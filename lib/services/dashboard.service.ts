import { createClient } from '@/lib/supabase/server';
import { getParametresBoutique } from '@/lib/services/parametres.service';

// ============================================
// Stats principales du dashboard
// ============================================
export async function getStatsDashboard() {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const prorata = params?.finance_marge_credit === 'prorata';

  // Période actuelle : mois en cours
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  // Période précédente : mois dernier complet
  const debutMoisPrec = new Date(debutMois);
  debutMoisPrec.setMonth(debutMoisPrec.getMonth() - 1);
  const finMoisPrec = new Date(debutMois);
  finMoisPrec.setMilliseconds(-1);

  // ---- VENTES DU MOIS ----
  const { data: ventesMois } = await supabase
    .from('ventes')
    .select('total, montant_paye, statut')
    .gte('date_vente', debutMois.toISOString())
    .neq('statut', 'annulee');

  const caMois = ventesMois?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const nbVentesMois = ventesMois?.length ?? 0;

  // ---- VENTES MOIS PRÉCÉDENT (pour variation) ----
  const { data: ventesMoisPrec } = await supabase
    .from('ventes')
    .select('total')
    .gte('date_vente', debutMoisPrec.toISOString())
    .lte('date_vente', finMoisPrec.toISOString())
    .neq('statut', 'annulee');

  const caMoisPrec = ventesMoisPrec?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const variationCA =
    caMoisPrec > 0 ? ((caMois - caMoisPrec) / caMoisPrec) * 100 : 0;

  // ---- BÉNÉFICES DU MOIS (marge) ----
  const { data: lignesMois } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      prix_unitaire,
      vente:ventes!inner (date_vente, statut, montant_paye, total),
      variante:variantes (prix_achat)
    `
    )
    .gte('vente.date_vente', debutMois.toISOString())
    .neq('vente.statut', 'annulee');

  let beneficeMois = 0;
  (lignesMois ?? []).forEach((l: any) => {
    const marge = (l.prix_unitaire - (l.variante?.prix_achat ?? 0)) * l.quantite;
    const taux =
      prorata && l.vente?.total > 0
        ? Math.min((l.vente.montant_paye ?? 0) / l.vente.total, 1)
        : 1;
    beneficeMois += marge * taux;
  });

  // Bénéfices mois précédent
  const { data: lignesMoisPrec } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      prix_unitaire,
      vente:ventes!inner (date_vente, statut, montant_paye, total),
      variante:variantes (prix_achat)
    `
    )
    .gte('vente.date_vente', debutMoisPrec.toISOString())
    .lte('vente.date_vente', finMoisPrec.toISOString())
    .neq('vente.statut', 'annulee');

  let beneficeMoisPrec = 0;
  (lignesMoisPrec ?? []).forEach((l: any) => {
    const marge = (l.prix_unitaire - (l.variante?.prix_achat ?? 0)) * l.quantite;
    const taux =
      prorata && l.vente?.total > 0
        ? Math.min((l.vente.montant_paye ?? 0) / l.vente.total, 1)
        : 1;
    beneficeMoisPrec += marge * taux;
  });

  const variationBenefice =
    beneficeMoisPrec > 0
      ? ((beneficeMois - beneficeMoisPrec) / beneficeMoisPrec) * 100
      : 0;

  // ---- NOUVEAUX CLIENTS CE MOIS ----
  const { count: clientsMois } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', debutMois.toISOString());

  const { count: clientsMoisPrec } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', debutMoisPrec.toISOString())
    .lte('created_at', finMoisPrec.toISOString());

  const variationClients =
    (clientsMoisPrec ?? 0) > 0
      ? (((clientsMois ?? 0) - (clientsMoisPrec ?? 0)) / (clientsMoisPrec ?? 1)) * 100
      : 0;

  // ---- STOCK + ALERTES ----
  const { data: variantes } = await supabase
    .from('variantes')
    .select(
      `
      id,
      prix_achat,
      produit:produits (actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .eq('actif', true);

  const variantesActives = (variantes ?? []).filter((v: any) => v.produit?.actif);
  const stockTotal = variantesActives.reduce(
    (s: number, v: any) => s + (v.stock?.quantite ?? 0),
    0
  );
  const valeurStock = variantesActives.reduce(
    (s: number, v: any) =>
      s + (v.stock?.quantite ?? 0) * (v.prix_achat ?? 0),
    0
  );
  const alertes = variantesActives.filter((v: any) => {
    const q = v.stock?.quantite ?? 0;
    return q <= (v.stock?.seuil_alerte ?? 5);
  }).length;

  return {
    caMois,
    nbVentesMois,
    variationCA,
    beneficeMois,
    variationBenefice,
    nouveauxClients: clientsMois ?? 0,
    variationClients,
    stockTotal,
    valeurStock,
    alertes,
  };
}

// ============================================
// Ventes des 30 derniers jours (pour graphique)
// ============================================
export async function getVentesParJour30j() {
  const supabase = await createClient();
  const params = await getParametresBoutique();
  const prorata = params?.finance_marge_credit === 'prorata';

  const debut = new Date();
  debut.setDate(debut.getDate() - 29);
  debut.setHours(0, 0, 0, 0);

  const { data: ventes } = await supabase
    .from('ventes')
    .select(
      `
      date_vente,
      total,
      lignes:lignes_vente (
        quantite,
        prix_unitaire,
        sous_total,
        variante:variantes (prix_achat)
      )
    `
    )
    .gte('date_vente', debut.toISOString())
    .neq('statut', 'annulee')
    .order('date_vente', { ascending: true });

  const parJour: Record<
    string,
    { ventes: number; benefices: number }
  > = {};

  // Initialiser tous les jours à 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(debut);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    parJour[key] = { ventes: 0, benefices: 0 };
  }

  (ventes ?? []).forEach((v: any) => {
    const key = v.date_vente.split('T')[0];
    if (!parJour[key]) parJour[key] = { ventes: 0, benefices: 0 };

    let marge = 0;
    (v.lignes ?? []).forEach((l: any) => {
      const m = (l.prix_unitaire - (l.variante?.prix_achat ?? 0)) * l.quantite;
      const taux =
        prorata && v.total > 0
          ? Math.min((v.total - 0) / v.total, 1) // simplifié, pas de montant_paye ici
          : 1;
      marge += m * taux;
    });

    parJour[key].ventes += v.total ?? 0;
    parJour[key].benefices += marge;
  });

  return Object.entries(parJour)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      ventes: Math.round(data.ventes),
      benefices: Math.round(data.benefices),
    }));
}

// ============================================
// Répartition par catégorie
// ============================================
export async function getRepartitionCategoriesDashboard() {
  const supabase = await createClient();

  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      vente:ventes!inner (date_vente, statut),
      variante:variantes (
        produit:produits (categorie)
      )
    `
    )
    .gte('vente.date_vente', debut.toISOString())
    .neq('vente.statut', 'annulee');

  const parCat: Record<string, number> = {};

  (lignes ?? []).forEach((l: any) => {
    const cat = l.variante?.produit?.categorie ?? 'autre';
    parCat[cat] = (parCat[cat] ?? 0) + (l.quantite ?? 0);
  });

  const labels: Record<string, string> = {
    homme: 'Homme',
    femme: 'Femme',
    enfant: 'Enfant',
    unisexe: 'Unisexe',
  };

  return Object.entries(parCat).map(([key, value]) => ({
    name: labels[key] ?? key,
    value,
  }));
}

// ============================================
// Top 5 produits vendus
// ============================================
export async function getTopProduitsDashboard() {
  const supabase = await createClient();

  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select(
      `
      quantite,
      vente:ventes!inner (date_vente, statut),
      variante:variantes (
        produit:produits (id, nom)
      )
    `
    )
    .gte('vente.date_vente', debut.toISOString())
    .neq('vente.statut', 'annulee');

  const parProduit: Record<string, { nom: string; quantite: number }> = {};

  (lignes ?? []).forEach((l: any) => {
    const p = l.variante?.produit;
    if (!p) return;
    if (!parProduit[p.id]) {
      parProduit[p.id] = { nom: p.nom, quantite: 0 };
    }
    parProduit[p.id].quantite += l.quantite ?? 0;
  });

  return Object.values(parProduit)
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 5);
}

// ============================================
// Ventes récentes
// ============================================
export async function getVentesRecentes(limite = 5) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ventes')
    .select(
      `
      id,
      reference,
      total,
      statut,
      created_at,
      client:clients (nom, prenom)
    `
    )
    .order('created_at', { ascending: false })
    .limit(limite);

  return (data ?? []).map((v: any) => ({
    id: v.id,
    reference: v.reference,
    client_nom: v.client
      ? [v.client.nom, v.client.prenom].filter(Boolean).join(' ')
      : null,
    total: v.total,
    statut: v.statut,
    created_at: v.created_at,
  }));
}

// ============================================
// Alertes stock
// ============================================
export async function getAlertesStockDashboard(limite = 5) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('variantes')
    .select(
      `
      id,
      pointure,
      couleur,
      produit:produits (nom, actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .eq('actif', true);

  return (data ?? [])
    .filter((v: any) => v.produit?.actif)
    .filter((v: any) => {
      const q = v.stock?.quantite ?? 0;
      return q <= (v.stock?.seuil_alerte ?? 5);
    })
    .sort((a: any, b: any) => {
      const qa = a.stock?.quantite ?? 0;
      const qb = b.stock?.quantite ?? 0;
      return qa - qb;
    })
    .slice(0, limite)
    .map((v: any) => ({
      variante_id: v.id,
      produit_nom: v.produit?.nom ?? 'Produit',
      pointure: v.pointure,
      couleur: v.couleur,
      quantite: v.stock?.quantite ?? 0,
      seuil: v.stock?.seuil_alerte ?? 5,
    }));
}

// ============================================
// Top clients
// ============================================
export async function getTopClientsDashboard(limite = 4) {
  const supabase = await createClient();

  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);

  const { data: ventes } = await supabase
    .from('ventes')
    .select(
      `
      total,
      client:clients (id, nom, prenom)
    `
    )
    .gte('date_vente', debut.toISOString())
    .neq('statut', 'annulee')
    .not('client_id', 'is', null);

  const parClient: Record<
    string,
    { nom: string; total: number; commandes: number }
  > = {};

  (ventes ?? []).forEach((v: any) => {
    const c = v.client;
    if (!c) return;
    if (!parClient[c.id]) {
      parClient[c.id] = {
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

// ============================================
// Stats secondaires (dettes, fidélité, panier moyen)
// ============================================
export async function getStatsSecondaires() {
  const supabase = await createClient();

  const debut = new Date();
  debut.setDate(1);

  // Dettes clients
  const { data: clients } = await supabase
    .from('clients')
    .select('total_dettes, points_fidelite');

  const totalDettes =
    clients?.reduce((s, c) => s + (c.total_dettes ?? 0), 0) ?? 0;
  const totalPoints =
    clients?.reduce((s, c) => s + (c.points_fidelite ?? 0), 0) ?? 0;

  // Panier moyen
  const { data: ventesMois } = await supabase
    .from('ventes')
    .select('total')
    .gte('date_vente', debut.toISOString())
    .neq('statut', 'annulee');

  const nbVentes = ventesMois?.length ?? 0;
  const caMois = ventesMois?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const panierMoyen = nbVentes > 0 ? caMois / nbVentes : 0;

  return {
    totalDettes,
    totalPoints,
    panierMoyen,
    nbVentes,
  };
}