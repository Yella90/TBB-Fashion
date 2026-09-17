import { createClient } from '@/lib/supabase/server';
import type { Transaction, Caisse } from '@/types/finance';
import type { ParametresBoutique, PeriodeFinance } from '@/types/parametres';
import { getParametresBoutique } from '@/lib/services/parametres.service';

// ============================================
// Helpers de plage de dates
// ============================================
function getPlage(periode: PeriodeFinance) {
  const fin = new Date();
  const debut = new Date();

  switch (periode) {
    case 'jour':
      debut.setHours(0, 0, 0, 0);
      break;
    case 'semaine':
      debut.setDate(debut.getDate() - 6);
      debut.setHours(0, 0, 0, 0);
      break;
    case 'mois':
      debut.setDate(debut.getDate() - 29);
      debut.setHours(0, 0, 0, 0);
      break;
    case 'trimestre':
      debut.setDate(debut.getDate() - 89);
      debut.setHours(0, 0, 0, 0);
      break;
    case 'annee':
      debut.setMonth(0, 1);
      debut.setHours(0, 0, 0, 0);
      break;
  }

  const nbJours = Math.max(
    1,
    Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    nbJours,
  };
}

// ============================================
// Vue RÉSULTAT (comptabilité analytique)
// ============================================
export async function getVueResultat(periode: PeriodeFinance) {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const { debut, fin } = getPlage(periode);

  // 1. Marge sur ventes
  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      prix_unitaire,
      sous_total,
      vente:ventes!inner (date_vente, statut, montant_paye, total),
      variante:variantes (prix_achat)
    `
    )
    .gte('vente.date_vente', debut)
    .lte('vente.date_vente', fin)
    .neq('vente.statut', 'annulee');

  let margeVentes = 0;
  let caVentes = 0;

  const prorata = params?.finance_marge_credit === 'prorata';

  (lignes ?? []).forEach((l: any) => {
    const prixAchat = l.variante?.prix_achat ?? 0;
    const quantite = l.quantite ?? 0;
    const margeLigne = (l.prix_unitaire - prixAchat) * quantite;
    const caLigne = l.sous_total ?? 0;

    if (prorata) {
      // Pro-rata basé sur le taux de paiement de la vente
      const tauxPaiement =
        l.vente?.total > 0
          ? Math.min((l.vente?.montant_paye ?? 0) / l.vente.total, 1)
          : 0;
      margeVentes += margeLigne * tauxPaiement;
      caVentes += caLigne * tauxPaiement;
    } else {
      margeVentes += margeLigne;
      caVentes += caLigne;
    }
  });

  // 2. Autres revenus (transactions manuelles)
  const { data: transRevenus } = await supabase
    .from('transactions_financieres')
    .select('montant')
    .eq('type', 'revenu')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const autresRevenus =
    transRevenus?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  // 3. Charges (transactions manuelles de type dépense)
  const { data: transDepenses } = await supabase
    .from('transactions_financieres')
    .select('montant')
    .eq('type', 'depense')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const charges =
    transDepenses?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  const totalRevenus = margeVentes + autresRevenus;
  const resultatNet = totalRevenus - charges;

  return {
    margeVentes,
    caVentes,
    autresRevenus,
    totalRevenus,
    charges,
    resultatNet,
  };
}

// ============================================
// Vue TRÉSORERIE (cash flow)
// ============================================
export async function getVueTresorerie(
  periode: PeriodeFinance,
  forcerInclureAchats?: boolean
) {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const { debut, fin } = getPlage(periode);

  const inclureAchats =
    forcerInclureAchats ?? params?.finance_inclure_achats ?? true;
  const baseAchats = params?.finance_base_achats ?? 'paye';

  // 1. Encaissements ventes (montant réellement payé)
  const { data: ventes } = await supabase
    .from('ventes')
    .select('montant_paye')
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee');

  const encaissementsVentes =
    ventes?.reduce((s, v) => s + (v.montant_paye ?? 0), 0) ?? 0;

  // 2. Autres revenus
  const { data: transRevenus } = await supabase
    .from('transactions_financieres')
    .select('montant')
    .eq('type', 'revenu')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const autresRevenus =
    transRevenus?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  const totalEntrees = encaissementsVentes + autresRevenus;

  // 3. Décaissements achats (payé OU total)
  let decaissementsAchats = 0;
  if (inclureAchats) {
    const champ = baseAchats === 'paye' ? 'montant_paye' : 'total';

    const { data: achats } = await supabase
      .from('achats')
      .select(champ)
      .gte('date_achat', debut.split('T')[0])
      .lte('date_achat', fin.split('T')[0])
      .neq('statut', 'annule');

    decaissementsAchats = (achats ?? []).reduce(
      (s: number, a: any) => s + (a[champ] ?? 0),
      0
    );
  }

  // 4. Charges
  const { data: transDepenses } = await supabase
    .from('transactions_financieres')
    .select('montant')
    .eq('type', 'depense')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const charges =
    transDepenses?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  const totalSorties = decaissementsAchats + charges;
  const soldeTresorerie = totalEntrees - totalSorties;

  return {
    encaissementsVentes,
    autresRevenus,
    totalEntrees,
    decaissementsAchats,
    charges,
    totalSorties,
    soldeTresorerie,
    inclureAchats,
    baseAchats,
  };
}

// ============================================
// Évolution du solde jour par jour
// ============================================
export async function getEvolutionSolde(
  periode: PeriodeFinance,
  mode: 'resultat' | 'tresorerie',
  forcerInclureAchats?: boolean
) {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const { debut, fin, nbJours } = getPlage(periode);

  // Initialiser tous les jours
  const jours: Record<
    string,
    { date: string; entrees: number; sorties: number; solde: number }
  > = {};

  const startDate = new Date(debut);
  for (let i = 0; i < nbJours; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    jours[key] = {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      entrees: 0,
      sorties: 0,
      solde: 0,
    };
  }

  if (mode === 'resultat') {
    // === Vue Résultat ===
    const prorata = params?.finance_marge_credit === 'prorata';

    // Marge par jour
    const { data: lignes } = await supabase
      .from('lignes_vente')
      .select(
        `
        quantite,
        prix_unitaire,
        vente:ventes!inner (date_vente, statut, montant_paye, total),
        variante:variantes (prix_achat)
      `
      )
      .gte('vente.date_vente', debut)
      .lte('vente.date_vente', fin)
      .neq('vente.statut', 'annulee');

    (lignes ?? []).forEach((l: any) => {
      const key = l.vente.date_vente.split('T')[0];
      if (!jours[key]) return;
      const marge = (l.prix_unitaire - (l.variante?.prix_achat ?? 0)) * l.quantite;
      const taux =
        prorata && l.vente.total > 0
          ? Math.min((l.vente.montant_paye ?? 0) / l.vente.total, 1)
          : 1;
      jours[key].entrees += marge * taux;
    });

    // Revenus manuels
    const { data: revenus } = await supabase
      .from('transactions_financieres')
      .select('montant, date_transaction')
      .eq('type', 'revenu')
      .gte('date_transaction', debut)
      .lte('date_transaction', fin);

    (revenus ?? []).forEach((r: any) => {
      const key = r.date_transaction.split('T')[0];
      if (jours[key]) jours[key].entrees += r.montant;
    });

    // Charges
    const { data: depenses } = await supabase
      .from('transactions_financieres')
      .select('montant, date_transaction')
      .eq('type', 'depense')
      .gte('date_transaction', debut)
      .lte('date_transaction', fin);

    (depenses ?? []).forEach((d: any) => {
      const key = d.date_transaction.split('T')[0];
      if (jours[key]) jours[key].sorties += d.montant;
    });
  } else {
    // === Vue Trésorerie ===
    const inclureAchats =
      forcerInclureAchats ?? params?.finance_inclure_achats ?? true;
    const baseAchats = params?.finance_base_achats ?? 'paye';

    // Encaissements ventes
    const { data: ventes } = await supabase
      .from('ventes')
      .select('montant_paye, date_vente')
      .gte('date_vente', debut)
      .lte('date_vente', fin)
      .neq('statut', 'annulee');

    (ventes ?? []).forEach((v: any) => {
      const key = v.date_vente.split('T')[0];
      if (jours[key]) jours[key].entrees += v.montant_paye ?? 0;
    });

    // Revenus manuels
    const { data: revenus } = await supabase
      .from('transactions_financieres')
      .select('montant, date_transaction')
      .eq('type', 'revenu')
      .gte('date_transaction', debut)
      .lte('date_transaction', fin);

    (revenus ?? []).forEach((r: any) => {
      const key = r.date_transaction.split('T')[0];
      if (jours[key]) jours[key].entrees += r.montant;
    });

    // Achats
    if (inclureAchats) {
      const champ = baseAchats === 'paye' ? 'montant_paye' : 'total';
      const { data: achats } = await supabase
        .from('achats')
        .select(`${champ}, date_achat`)
        .gte('date_achat', debut.split('T')[0])
        .lte('date_achat', fin.split('T')[0])
        .neq('statut', 'annule');

      (achats ?? []).forEach((a: any) => {
        const key = a.date_achat;
        if (jours[key]) jours[key].sorties += a[champ] ?? 0;
      });
    }

    // Charges
    const { data: depenses } = await supabase
      .from('transactions_financieres')
      .select('montant, date_transaction')
      .eq('type', 'depense')
      .gte('date_transaction', debut)
      .lte('date_transaction', fin);

    (depenses ?? []).forEach((d: any) => {
      const key = d.date_transaction.split('T')[0];
      if (jours[key]) jours[key].sorties += d.montant;
    });
  }

  // Calcul du cumul
  let cumul = 0;
  return Object.values(jours)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((j) => {
      cumul += j.entrees - j.sorties;
      return {
        date: j.date,
        entrees: Math.round(j.entrees),
        sorties: Math.round(j.sorties),
        solde: Math.round(cumul),
      };
    });
}

// ============================================
// Lectures existantes (inchangées)
// ============================================
export async function listerTransactions(options?: {
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  limite?: number;
}): Promise<Transaction[]> {
  const supabase = await createClient();

  let query = supabase
    .from('transactions_financieres')
    .select('*')
    .order('date_transaction', { ascending: false });

  if (options?.type) query = query.eq('type', options.type);
  if (options?.dateDebut) query = query.gte('date_transaction', options.dateDebut);
  if (options?.dateFin) query = query.lte('date_transaction', options.dateFin);
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStatsFinances() {
  const params = await getParametresBoutique();
  const periode = params?.finance_periode_defaut ?? 'mois';
  const [resultat, tresorerie] = await Promise.all([
    getVueResultat(periode),
    getVueTresorerie(periode),
  ]);
  return { resultat, tresorerie, periode };
}

export async function getCaisseAujourdhui(): Promise<Caisse | null> {
  const supabase = await createClient();
  const aujourdhui = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('caisse')
    .select('*')
    .eq('date_jour', aujourdhui)
    .single();

  if (error) return null;
  return data as Caisse;
}

export async function listerCaisses(limite = 30): Promise<Caisse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('caisse')
    .select('*')
    .order('date_jour', { ascending: false })
    .limit(limite);

  if (error) throw new Error(error.message);
  return data ?? [];
}