import { createClient } from '@/lib/supabase/server';
import type { Retour, RetourAvecDetails } from '@/types/retour';

export async function listerRetours(options?: {
  recherche?: string;
  statut?: string;
  limite?: number;
}): Promise<Retour[]> {
  const supabase = await createClient();

  let query = supabase
    .from('retours')
    .select('*')
    .order('date_retour', { ascending: false });

  if (options?.statut) query = query.eq('statut', options.statut);
  if (options?.recherche) {
    query = query.ilike('reference', `%${options.recherche}%`);
  }
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRetour(id: string): Promise<RetourAvecDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('retours')
    .select(
      `
      *,
      vente:ventes (id, reference, total, date_vente),
      client:clients (id, nom, prenom, telephone),
      lignes:lignes_retour (
        id,
        retour_id,
        variante_id,
        quantite,
        prix_unitaire,
        sous_total,
        variante:variantes (
          id,
          pointure,
          couleur,
          sku,
          produit:produits (id, nom, marque, reference)
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return data as RetourAvecDetails;
}

export async function getStatsRetours() {
  const supabase = await createClient();

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { data: mois } = await supabase
    .from('retours')
    .select('montant_rembourse, statut')
    .gte('date_retour', debutMois.toISOString());

  const totalMois =
    mois?.reduce((s, r) => s + (r.montant_rembourse ?? 0), 0) ?? 0;

  const { count: total } = await supabase
    .from('retours')
    .select('*', { count: 'exact', head: true });

  const { count: enAttente } = await supabase
    .from('retours')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'en_attente');

  return {
    totalMois,
    nbMois: mois?.length ?? 0,
    total: total ?? 0,
    enAttente: enAttente ?? 0,
  };
}

// ============================================
// Lignes éligibles au retour pour une vente
// ============================================
export async function getLignesRetournables(venteId: string) {
  const supabase = await createClient();

  // Récupérer les lignes de la vente
  const { data: lignesVente } = await supabase
    .from('lignes_vente')
    .select(
      `
      id,
      variante_id,
      quantite,
      prix_unitaire,
      sous_total,
      variante:variantes (
        id,
        pointure,
        couleur,
        produit:produits (id, nom, marque)
      )
    `
    )
    .eq('vente_id', venteId);

  // Récupérer les quantités déjà retournées
  const { data: lignesRetour } = await supabase
    .from('lignes_retour')
    .select(
      `
      variante_id,
      quantite,
      retour:retours!inner (vente_id, statut)
    `
    )
    .eq('retour.vente_id', venteId)
    .neq('retour.statut', 'refuse');

  const dejaRetournees: Record<string, number> = {};
  (lignesRetour ?? []).forEach((lr: any) => {
    dejaRetournees[lr.variante_id] =
      (dejaRetournees[lr.variante_id] ?? 0) + lr.quantite;
  });

  return (lignesVente ?? [])
    .map((l: any) => {
      const dejaRetourne = dejaRetournees[l.variante_id] ?? 0;
      const quantiteRestante = l.quantite - dejaRetourne;
      return {
        variante_id: l.variante_id,
        quantite: l.quantite,
        quantite_restante: quantiteRestante,
        deja_retourne: dejaRetourne,
        prix_unitaire: l.prix_unitaire,
        sous_total: l.sous_total,
        produit_nom: l.variante?.produit?.nom ?? 'Produit',
        marque: l.variante?.produit?.marque ?? null,
        pointure: l.variante?.pointure,
        couleur: l.variante?.couleur,
      };
    })
    .filter((l) => l.quantite_restante > 0);
}
// ============================================
// Retours d'une vente spécifique
// ============================================
export async function listerRetoursParVente(venteId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('retours')
    .select(
      `
      id,
      reference,
      date_retour,
      motif,
      montant_rembourse,
      type_remboursement,
      statut,
      lignes:lignes_retour (
        id,
        variante_id,
        quantite,
        prix_unitaire,
        sous_total,
        variante:variantes (
          id,
          pointure,
          couleur,
          produit:produits (id, nom, marque)
        )
      )
    `
    )
    .eq('vente_id', venteId)
    .order('date_retour', { ascending: false });

  if (error) return [];
  return data ?? [];
}
