import { createClient } from '@/lib/supabase/server';
import type { Produit, ProduitAvecVariantes } from '@/types/produit';

export async function listerProduits(options?: {
  recherche?: string;
  categorie?: string;
  actifSeulement?: boolean;
}): Promise<Produit[]> {
  const supabase = await createClient();

  let query = supabase
    .from('produits')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.actifSeulement !== false) {
    query = query.eq('actif', true);
  }

  if (options?.categorie) {
    query = query.eq('categorie', options.categorie);
  }

  if (options?.recherche) {
    query = query.or(
      `nom.ilike.%${options.recherche}%,marque.ilike.%${options.recherche}%,reference.ilike.%${options.recherche}%`
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProduit(id: string): Promise<ProduitAvecVariantes | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('produits')
    .select(
      `
      *,
      variantes:variantes (
        id,
        produit_id,
        pointure,
        couleur,
        code_barre,
        prix_vente,
        prix_achat,
        sku,
        actif,
        stock:stock (
          quantite,
          seuil_alerte
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return data as ProduitAvecVariantes;
}

export async function getStatsProduits() {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('produits')
    .select('*', { count: 'exact', head: true });

  const { count: actifs } = await supabase
    .from('produits')
    .select('*', { count: 'exact', head: true })
    .eq('actif', true);

  return {
    total: total ?? 0,
    actifs: actifs ?? 0,
  };
}