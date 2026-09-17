import { createClient } from '@/lib/supabase/server';
import { getParametresBoutique } from '@/lib/services/parametres.service';
import type {
  PeriodeRapport,
  VenteParJour,
  TopProduit,
  TopClient,
  RepartitionCategorie,
  RepartitionPaiement,
} from '@/types/rapport';
import { PERIODES } from '@/types/rapport';

function getDateRange(periode: PeriodeRapport) {
  const config = PERIODES.find((p) => p.value === periode) ?? PERIODES[2];
  const fin = new Date();
  const debut = new Date();
  debut.setDate(debut.getDate() - config.jours + 1);
  debut.setHours(0, 0, 0, 0);

  const debutPrec = new Date(debut);
  debutPrec.setDate(debutPrec.getDate() - config.jours);
  const finPrec = new Date(debut);
  finPrec.setMilliseconds(-1);

  return {
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    debutPrec: debutPrec.toISOString(),
    finPrec: finPrec.toISOString(),
    jours: config.jours,
  };
}

export async function getStatsVentes(periode: PeriodeRapport) {
  const supabase = await createClient();
  const { debut, fin, debutPrec, finPrec } = getDateRange(periode);

  const { data: ventes } = await supabase
    .from('ventes')
    .select('total')
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee');

  const total = ventes?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const nombre = ventes?.length ?? 0;

  const { data: ventesPrec } = await supabase
    .from('ventes')
    .select('total')
    .gte('date_vente', debutPrec)
    .lte('date_vente', finPrec)
    .neq('statut', 'annulee');

  const totalPrec = ventesPrec?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const variation =
    totalPrec > 0 ? ((total - totalPrec) / totalPrec) * 100 : 0;

  return {
    total,
    nombre,
    panierMoyen: nombre > 0 ? total / nombre : 0,
    variation,
  };
}

export async function getStatsBenefices(periode: PeriodeRapport) {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const prorata = params?.finance_marge_credit === 'prorata';
  const { debut, fin } = getDateRange(periode);

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

  let chiffreAffaires = 0;
  let coutAchats = 0;

  (lignes ?? []).forEach((l: any) => {
    const taux =
      prorata && l.vente?.total > 0
        ? Math.min((l.vente.montant_paye ?? 0) / l.vente.total, 1)
        : 1;
    chiffreAffaires += (l.sous_total ?? 0) * taux;
    const prixAchat = l.variante?.prix_achat ?? 0;
    coutAchats += (l.quantite ?? 0) * prixAchat * taux;
  });

  const beneficeBrut = chiffreAffaires - coutAchats;
  const marge =
    chiffreAffaires > 0 ? (beneficeBrut / chiffreAffaires) * 100 : 0;

  return {
    chiffreAffaires,
    coutAchats,
    beneficeBrut,
    marge,
    prorata,
  };
}

export async function getVentesParJour(
  periode: PeriodeRapport
): Promise<VenteParJour[]> {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const prorata = params?.finance_marge_credit === 'prorata';
  const { debut, fin, jours } = getDateRange(periode);

  const { data: ventes } = await supabase
    .from('ventes')
    .select(
      `
      date_vente,
      total,
      montant_paye,
      lignes:lignes_vente (
        quantite,
        prix_unitaire,
        sous_total,
        variante:variantes (prix_achat)
      )
    `
    )
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee')
    .order('date_vente', { ascending: true });

  const parJour: Record<
    string,
    { ventes: number; benefices: number; nombre: number }
  > = {};

  for (let i = 0; i < jours; i++) {
    const d = new Date(debut);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    parJour[key] = { ventes: 0, benefices: 0, nombre: 0 };
  }

  (ventes ?? []).forEach((v: any) => {
    const key = v.date_vente.split('T')[0];
    if (!parJour[key]) parJour[key] = { ventes: 0, benefices: 0, nombre: 0 };

    const taux =
      prorata && v.total > 0
        ? Math.min((v.montant_paye ?? 0) / v.total, 1)
        : 1;

    let cout = 0;
    (v.lignes ?? []).forEach((l: any) => {
      cout += (l.quantite ?? 0) * (l.variante?.prix_achat ?? 0);
    });

    parJour[key].ventes += (v.total ?? 0) * taux;
    parJour[key].benefices += ((v.total ?? 0) - cout) * taux;
    parJour[key].nombre += 1;
  });

  return Object.entries(parJour)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      ...data,
    }));
}

export async function getTopProduits(
  periode: PeriodeRapport,
  limite = 10
): Promise<TopProduit[]> {
  const supabase = await createClient();
  const { debut, fin } = getDateRange(periode);

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      sous_total,
      vente:ventes!inner (date_vente, statut),
      variante:variantes (
        produit:produits (id, nom, marque)
      )
    `
    )
    .gte('vente.date_vente', debut)
    .lte('vente.date_vente', fin)
    .neq('vente.statut', 'annulee');

  const parProduit: Record<string, TopProduit> = {};

  (lignes ?? []).forEach((l: any) => {
    const p = l.variante?.produit;
    if (!p) return;
    if (!parProduit[p.id]) {
      parProduit[p.id] = {
        produit_id: p.id,
        nom: p.nom,
        marque: p.marque,
        quantite: 0,
        ca: 0,
      };
    }
    parProduit[p.id].quantite += l.quantite ?? 0;
    parProduit[p.id].ca += l.sous_total ?? 0;
  });

  return Object.values(parProduit)
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, limite);
}

export async function getTopClients(
  periode: PeriodeRapport,
  limite = 10
): Promise<TopClient[]> {
  const supabase = await createClient();
  const { debut, fin } = getDateRange(periode);

  const { data: ventes } = await supabase
    .from('ventes')
    .select(
      `
      total,
      client:clients (id, nom, prenom)
    `
    )
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee')
    .not('client_id', 'is', null);

  const parClient: Record<string, TopClient> = {};

  (ventes ?? []).forEach((v: any) => {
    const c = v.client;
    if (!c) return;
    if (!parClient[c.id]) {
      parClient[c.id] = {
        client_id: c.id,
        nom: [c.nom, c.prenom].filter(Boolean).join(' '),
        total: 0,
        commandes: 0,
      };
    }
    parClient[c.id].total += v.total ?? 0;
    parClient[c.id].commandes += 1;
  });

  return Object.values(parClient)
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

export async function getRepartitionCategories(
  periode: PeriodeRapport
): Promise<RepartitionCategorie[]> {
  const supabase = await createClient();
  const { debut, fin } = getDateRange(periode);

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      sous_total,
      vente:ventes!inner (date_vente, statut),
      variante:variantes (
        produit:produits (categorie)
      )
    `
    )
    .gte('vente.date_vente', debut)
    .lte('vente.date_vente', fin)
    .neq('vente.statut', 'annulee');

  const parCat: Record<string, RepartitionCategorie> = {};

  (lignes ?? []).forEach((l: any) => {
    const cat = l.variante?.produit?.categorie ?? 'autre';
    if (!parCat[cat]) {
      parCat[cat] = { categorie: cat, quantite: 0, ca: 0 };
    }
    parCat[cat].quantite += l.quantite ?? 0;
    parCat[cat].ca += l.sous_total ?? 0;
  });

  return Object.values(parCat);
}

export async function getRepartitionPaiements(
  periode: PeriodeRapport
): Promise<RepartitionPaiement[]> {
  const supabase = await createClient();
  const { debut, fin } = getDateRange(periode);

  const { data: ventes } = await supabase
    .from('ventes')
    .select('mode_paiement, total')
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee')
    .not('mode_paiement', 'is', null);

  const parMode: Record<string, RepartitionPaiement> = {};

  (ventes ?? []).forEach((v: any) => {
    const mode = v.mode_paiement ?? 'autre';
    if (!parMode[mode]) {
      parMode[mode] = { mode, montant: 0, nombre: 0 };
    }
    parMode[mode].montant += v.total ?? 0;
    parMode[mode].nombre += 1;
  });

  return Object.values(parMode).sort((a, b) => b.montant - a.montant);
}

export async function getStatsStockGlobal() {
  const supabase = await createClient();

  const { data: variantes } = await supabase
    .from('variantes')
    .select(
      `
      prix_achat,
      produit:produits (actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .eq('actif', true);

  const actives = (variantes ?? []).filter((v: any) => v.produit?.actif);

  const totalPaires = actives.reduce(
    (s: number, v: any) => s + (v.stock?.quantite ?? 0),
    0
  );

  const valeurStock = actives.reduce(
    (s: number, v: any) =>
      s + (v.stock?.quantite ?? 0) * (v.prix_achat ?? 0),
    0
  );

  const enAlerte = actives.filter((v: any) => {
    const q = v.stock?.quantite ?? 0;
    return q > 0 && q <= (v.stock?.seuil_alerte ?? 5);
  }).length;

  const enRupture = actives.filter(
    (v: any) => (v.stock?.quantite ?? 0) === 0
  ).length;

  return {
    totalPaires,
    valeurStock,
    enAlerte,
    enRupture,
  };
}

// ============================================
// Trésorerie globale — flux réels
// Encaissements : ventes payées + autres revenus
// Décaissements : achats payés + dépenses + remboursements
// ============================================
export async function getStatsFinancesGlobal(periode: PeriodeRapport) {
  const supabase = await createClient();
  const { debut, fin } = getDateRange(periode);

  // 1. Encaissements ventes (montant réellement payé)
  const { data: ventes } = await supabase
    .from('ventes')
    .select('montant_paye, avoir_utilise')
    .gte('date_vente', debut)
    .lte('date_vente', fin)
    .neq('statut', 'annulee');

  const encaissementsVentes =
    ventes?.reduce((s, v) => s + (v.montant_paye ?? 0), 0) ?? 0;

  // 2. Autres revenus (transactions manuelles)
  const { data: transRevenus } = await supabase
    .from('transactions_financieres')
    .select('montant')
    .eq('type', 'revenu')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const autresRevenus =
    transRevenus?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  const totalEntrees = encaissementsVentes + autresRevenus;

  // 3. Achats payés au fournisseur
  const { data: achats } = await supabase
    .from('achats')
    .select('montant_paye')
    .gte('date_achat', debut.split('T')[0])
    .lte('date_achat', fin.split('T')[0])
    .neq('statut', 'annule');

  const achatsPayes =
    achats?.reduce((s, a) => s + (a.montant_paye ?? 0), 0) ?? 0;

  // 4. Dépenses manuelles
  const { data: transDepenses } = await supabase
    .from('transactions_financieres')
    .select('montant, categorie')
    .eq('type', 'depense')
    .gte('date_transaction', debut)
    .lte('date_transaction', fin);

  const depensesManuelles =
    transDepenses?.reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  // 5. Remboursements clients (retours espèces déjà dans transactions comme 'depense' catégorie 'Remboursement client')
  const remboursements =
    transDepenses
      ?.filter((t) => t.categorie === 'Remboursement client')
      .reduce((s, t) => s + (t.montant ?? 0), 0) ?? 0;

  // Les "dépenses manuelles" incluent les remboursements → on isole les vraies charges
  const chargesExploitation = depensesManuelles - remboursements;

  const totalSorties = achatsPayes + depensesManuelles;

  const solde = totalEntrees - totalSorties;

  return {
    // Entrées
    encaissementsVentes,
    autresRevenus,
    totalEntrees,
    // Sorties
    achatsPayes,
    chargesExploitation,
    remboursements,
    depensesManuelles,
    totalSorties,
    // Solde
    solde,
    // Compatibilité (ancien format)
    revenus: totalEntrees,
    depenses: totalSorties,
  };
}