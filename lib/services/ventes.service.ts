import { createClient } from '@/lib/supabase/server';
import type { Vente, VenteAvecDetails } from '@/types/vente';

export async function listerVentes(options?: {
  recherche?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  limite?: number;
}): Promise<Vente[]> {
  const supabase = await createClient();

  let query = supabase
    .from('ventes')
    .select('*')
    .order('date_vente', { ascending: false });

  if (options?.statut) query = query.eq('statut', options.statut);
  if (options?.dateDebut) query = query.gte('date_vente', options.dateDebut);
  if (options?.dateFin) query = query.lte('date_vente', options.dateFin);
  if (options?.recherche) query = query.ilike('reference', `%${options.recherche}%`);
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVente(id: string): Promise<VenteAvecDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ventes')
    .select(
      `
      *,
      client:clients (id, nom, prenom, telephone),
      utilisateur:utilisateurs (id, nom, email),
      lignes:lignes_vente (
        id,
        vente_id,
        variante_id,
        quantite,
        prix_unitaire,
        remise,
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
  return data as VenteAvecDetails;
}

export async function getStatsVentes() {
  const supabase = await createClient();
  const aujourdhui = new Date().toISOString().split('T')[0];

  const { data: ventesJour } = await supabase
    .from('ventes')
    .select('total, statut')
    .gte('date_vente', `${aujourdhui}T00:00:00`);

  const caJour = ventesJour?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const nbJour = ventesJour?.length ?? 0;

  const debutMois = new Date();
  debutMois.setDate(1);
  const { data: ventesMois } = await supabase
    .from('ventes')
    .select('total')
    .gte('date_vente', debutMois.toISOString());

  const caMois = ventesMois?.reduce((s, v) => s + (v.total ?? 0), 0) ?? 0;
  const nbMois = ventesMois?.length ?? 0;

  const { data: impayees } = await supabase
    .from('ventes')
    .select('reste_a_payer')
    .gt('reste_a_payer', 0);

  const totalImpaye =
    impayees?.reduce((s, v) => s + (v.reste_a_payer ?? 0), 0) ?? 0;

  return {
    caJour,
    nbJour,
    caMois,
    nbMois,
    totalImpaye,
    nbImpayees: impayees?.length ?? 0,
  };
}

export async function rechercherVariantesPourVente(recherche: string) {
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

  const { data: produits } = await produitsQuery;
  if (!produits || produits.length === 0) return [];

  const { data: variantes } = await supabase
    .from('variantes')
    .select(
      `
      id, pointure, couleur, prix_vente, sku, actif,
      produit:produits (id, nom, marque, reference, actif),
      stock:stock (quantite, seuil_alerte)
    `
    )
    .in('produit_id', produits.map((p) => p.id))
    .eq('actif', true)
    .order('pointure', { ascending: true })
    .limit(50);

  return (variantes ?? []).filter((v: any) => v.produit?.actif);
}