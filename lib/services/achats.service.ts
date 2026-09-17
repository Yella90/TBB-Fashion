import { createClient } from '@/lib/supabase/server';
import type { Achat, AchatAvecDetails } from '@/types/achat';

export async function listerAchats(options?: {
  recherche?: string;
  statut?: string;
  limite?: number;
}): Promise<Achat[]> {
  const supabase = await createClient();

  let query = supabase
    .from('achats')
    .select('*')
    .order('date_achat', { ascending: false });

  if (options?.statut) query = query.eq('statut', options.statut);
  if (options?.recherche) query = query.ilike('reference', `%${options.recherche}%`);
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAchat(id: string): Promise<AchatAvecDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('achats')
    .select(
      `
      *,
      fournisseur:fournisseurs (id, nom, contact_nom, telephone),
      lignes:lignes_achat (
        id,
        achat_id,
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
  return data as AchatAvecDetails;
}

export async function getStatsAchats() {
  const supabase = await createClient();

  const debutMois = new Date();
  debutMois.setDate(1);

  const { data: mois } = await supabase
    .from('achats')
    .select('total')
    .gte('date_achat', debutMois.toISOString().split('T')[0]);

  const totalMois = mois?.reduce((s, a) => s + (a.total ?? 0), 0) ?? 0;

  const { count: total } = await supabase
    .from('achats')
    .select('*', { count: 'exact', head: true });

  return {
    totalMois,
    nbMois: mois?.length ?? 0,
    total: total ?? 0,
  };
}

// Recherche de variantes pour un achat (par produit/marque/référence)
export async function rechercherVariantesPourAchat(recherche: string) {
  const supabase = await createClient();
  const terme = recherche?.trim() ?? '';

  let produitsQuery = supabase
    .from('produits')
    .select('id')
    .eq('actif', true)
    .limit(30);

  if (terme.length >= 2) {
    produitsQuery = produitsQuery.or(
      `nom.ilike.%${terme}%,marque.ilike.%${terme}%,reference.ilike.%${terme}%`
    );
  }

  const { data: produits, error: errP } = await produitsQuery;
  if (errP || !produits || produits.length === 0) return [];

  const produitIds = produits.map((p) => p.id);

  const { data: variantes, error: errV } = await supabase
    .from('variantes')
    .select(
      `
      id,
      pointure,
      couleur,
      prix_vente,
      prix_achat,
      sku,
      actif,
      produit:produits (id, nom, marque, reference, actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .in('produit_id', produitIds)
    .eq('actif', true)
    .order('pointure', { ascending: true })
    .limit(50);

  if (errV || !variantes) return [];
  return variantes.filter((v: any) => v.produit?.actif);
}