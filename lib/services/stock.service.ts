import { createClient } from '@/lib/supabase/server';
import type {
  VarianteAvecStockComplet,
  MouvementAvecDetails,
  LigneInventaire,
} from '@/types/stock';

// ============================================
// Liste des variantes avec stock
// ============================================
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

// ============================================
// Statistiques du stock
// ============================================
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

// ============================================
// Liste des mouvements de stock
// ============================================
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

  if (options?.varianteId) query = query.eq('variante_id', options.varianteId);
  if (options?.type) query = query.eq('type', options.type);
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MouvementAvecDetails[];
}

// ============================================
// Alertes stock
// ============================================
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
      return qa - qb;
    });
}

// ============================================
// Inventaire complet pour export PDF
// ============================================

// ============================================
// Inventaire complet pour export PDF
// ============================================
export async function getInventaireComplet(): Promise<LigneInventaire[]> {
  const supabase = await createClient();

  // 1. Variantes + produit
  const { data: variantes, error: errV } = await supabase
    .from('variantes')
    .select(
      `
      id, pointure, couleur, sku, prix_achat, prix_vente,
      produit:produits (id, nom, marque, reference, description, categorie, actif)
    `
    )
    .eq('actif', true)
    .order('pointure', { ascending: true });

  if (errV) {
    console.error('Erreur variantes:', errV);
    return [];
  }

  const actives = (variantes ?? []).filter((v: any) => v.produit?.actif);
  if (actives.length === 0) return [];

  const varianteIds = actives.map((v: any) => v.id);

  // 2. Stock séparé (requête indépendante — plus fiable)
  const { data: stocks, error: errS } = await supabase
    .from('stock')
    .select('variante_id, quantite, seuil_alerte')
    .in('variante_id', varianteIds);

  if (errS) {
    console.error('Erreur stock:', errS);
  }

  const stockMap: Record<string, { quantite: number; seuil_alerte: number }> = {};
  (stocks ?? []).forEach((s: any) => {
    stockMap[s.variante_id] = {
      quantite: s.quantite ?? 0,
      seuil_alerte: s.seuil_alerte ?? 5,
    };
  });

  // 3. Total vendu + prix pratiqués par variante
  const { data: lignesVente, error: errLV } = await supabase
    .from('lignes_vente')
    .select('variante_id, quantite, prix_unitaire, vente:ventes!inner (statut)')
    .in('variante_id', varianteIds)
    .neq('vente.statut', 'annulee');

  if (errLV) {
    console.error('Erreur lignes vente:', errLV);
  }

  const ventesMap: Record<
    string,
    { total: number; ca: number; prix: Set<number> }
  > = {};
  (lignesVente ?? []).forEach((l: any) => {
    if (!ventesMap[l.variante_id]) {
      ventesMap[l.variante_id] = { total: 0, ca: 0, prix: new Set() };
    }
    ventesMap[l.variante_id].total += l.quantite ?? 0;
    ventesMap[l.variante_id].ca +=
      (l.quantite ?? 0) * Number(l.prix_unitaire ?? 0);
    ventesMap[l.variante_id].prix.add(Number(l.prix_unitaire));
  });

  // 4. Fournisseur du dernier achat par variante
  const { data: lignesAchat, error: errLA } = await supabase
    .from('lignes_achat')
    .select(
      `
      variante_id,
      achat:achats!inner (date_achat, statut, fournisseur:fournisseurs (nom))
    `
    )
    .in('variante_id', varianteIds)
    .neq('achat.statut', 'annule');

  if (errLA) {
    console.error('Erreur lignes achat:', errLA);
  }

  const fournisseursMap: Record<string, { nom: string; date: string }> = {};
  (lignesAchat ?? []).forEach((l: any) => {
    const date = l.achat?.date_achat;
    const nom = l.achat?.fournisseur?.nom;
    if (!nom || !date) return;
    const existing = fournisseursMap[l.variante_id];
    if (!existing || date > existing.date) {
      fournisseursMap[l.variante_id] = { nom, date };
    }
  });

  // 5. Fusion
  return actives.map((v: any) => ({
    variante_id: v.id,
    pointure: v.pointure,
    couleur: v.couleur,
    sku: v.sku,
    prix_achat: Number(v.prix_achat) || 0,
    prix_vente: Number(v.prix_vente) || 0,
    produit: v.produit,
    stock: stockMap[v.id] ?? { quantite: 0, seuil_alerte: 5 },
    fournisseur: fournisseursMap[v.id]?.nom ?? null,
    total_vendu: ventesMap[v.id]?.total ?? 0,
    ca_vendu: ventesMap[v.id]?.ca ?? 0,
    prix_pratiques: ventesMap[v.id]
      ? Array.from(ventesMap[v.id].prix).sort((a, b) => a - b)
      : [],
  })) as LigneInventaire[];
}