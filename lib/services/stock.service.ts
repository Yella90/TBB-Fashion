import { createClient } from '@/lib/supabase/server';
import type { VarianteAvecStockComplet, MouvementAvecDetails } from '@/types/stock';

export async function listerStock(options?: {
  recherche?: string;
  statut?: 'ok' | 'alerte' | 'rupture';
  limite?: number;
}): Promise<VarianteAvecStockComplet[]> {
  const supabase = await createClient();

  let query = supabase
    .from('variantes')
    .select(
      `
      id,
      produit_id,
      pointure,
      couleur,
      prix_vente,
      prix_achat,
      sku,
      actif,
      produit:produits (id, nom, marque, reference, categorie, actif),
      stock:stock (quantite, seuil_alerte, emplacement, updated_at)
    `
    )
    .eq('actif', true)
    .order('produit_id', { ascending: true })
    .order('pointure', { ascending: true });

  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let result = (data ?? []).filter((v: any) => v.produit?.actif);

  // Filtre recherche côté client
  if (options?.recherche) {
    const terme = options.recherche.toLowerCase();
    result = result.filter((v: any) => {
      return (
        v.produit?.nom?.toLowerCase().includes(terme) ||
        v.produit?.marque?.toLowerCase().includes(terme) ||
        v.produit?.reference?.toLowerCase().includes(terme) ||
        v.couleur?.toLowerCase().includes(terme) ||
        String(v.pointure).includes(terme)
      );
    });
  }

  // Filtre statut
  if (options?.statut) {
    result = result.filter((v: any) => {
      const q = v.stock?.quantite ?? 0;
      const s = v.stock?.seuil_alerte ?? 5;
      if (options.statut === 'rupture') return q === 0;
      if (options.statut === 'alerte') return q > 0 && q <= s;
      return q > s;
    });
  }

  return result as VarianteAvecStockComplet[];
}

export async function getStatsStock() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('variantes')
    .select(
      `
      id,
      prix_achat,
      actif,
      produit:produits (actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .eq('actif', true);

  const variantes = (data ?? []).filter((v: any) => v.produit?.actif);

  const totalPaires = variantes.reduce(
    (s: number, v: any) => s + (v.stock?.quantite ?? 0),
    0
  );

  const valeurStock = variantes.reduce(
    (s: number, v: any) =>
      s + (v.stock?.quantite ?? 0) * (v.prix_achat ?? 0),
    0
  );

  const enAlerte = variantes.filter((v: any) => {
    const q = v.stock?.quantite ?? 0;
    const seuil = v.stock?.seuil_alerte ?? 5;
    return q > 0 && q <= seuil;
  }).length;

  const enRupture = variantes.filter(
    (v: any) => (v.stock?.quantite ?? 0) === 0
  ).length;

  return {
    totalVariantes: variantes.length,
    totalPaires,
    valeurStock,
    enAlerte,
    enRupture,
  };
}

export async function listerMouvements(options?: {
  varianteId?: string;
  type?: string;
  limite?: number;
}): Promise<MouvementAvecDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('mouvements_stock')
    .select(
      `
      id,
      variante_id,
      type,
      quantite,
      quantite_avant,
      quantite_apres,
      motif,
      reference_id,
      reference_type,
      utilisateur_id,
      created_at,
      variante:variantes (
        id,
        pointure,
        couleur,
        sku,
        produit:produits (id, nom, marque, reference)
      ),
      utilisateur:utilisateurs (id, nom)
    `
    )
    .order('created_at', { ascending: false });

  if (options?.varianteId) {
    query = query.eq('variante_id', options.varianteId);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limite) {
    query = query.limit(options.limite);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MouvementAvecDetails[];
}

export async function listerAlertes(): Promise<VarianteAvecStockComplet[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('variantes')
    .select(
      `
      id,
      produit_id,
      pointure,
      couleur,
      prix_vente,
      prix_achat,
      sku,
      actif,
      produit:produits (id, nom, marque, reference, categorie, actif),
      stock:stock (quantite, seuil_alerte, emplacement, updated_at)
    `
    )
    .eq('actif', true);

  if (error) throw new Error(error.message);

  return ((data ?? []) as VarianteAvecStockComplet[])
    .filter((v: any) => {
      if (!v.produit?.actif) return false;
      const q = v.stock?.quantite ?? 0;
      const seuil = v.stock?.seuil_alerte ?? 5;
      return q <= seuil;
    })
    .sort((a: any, b: any) => {
      const qa = a.stock?.quantite ?? 0;
      const qb = b.stock?.quantite ?? 0;
      return qa - qb; // ruptures d'abord
    });
}