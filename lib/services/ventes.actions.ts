'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { venteSchema, type VenteInput } from '@/lib/validations/vente.schema';

export async function creerVente(input: VenteInput) {
  const parsed = venteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sousTotal = data.lignes.reduce((s, l) => s + l.sous_total, 0);
  const total = sousTotal - data.remise + data.tva;

  const totalCouvert = data.montant_paye + (data.avoir_utilise ?? 0);
  const reste = total - totalCouvert;

  let statut: 'payee' | 'partielle' | 'impayee' = 'payee';
  if (totalCouvert === 0) statut = 'impayee';
  else if (reste > 0) statut = 'partielle';

  const pointsGagnes = data.client_id ? Math.floor(total / 1000) : 0;

  // La RPC gère tout : vente + stock + avoir + dette + fidélité
  const { data: venteId, error } = await supabase.rpc('creer_vente', {
    p_client_id: data.client_id || null,
    p_sous_total: sousTotal,
    p_remise: data.remise,
    p_tva: data.tva,
    p_total: total,
    p_montant_paye: data.montant_paye,
    p_avoir_utilise: data.avoir_utilise ?? 0,
    p_mode_paiement: data.mode_paiement,
    p_statut: statut,
    p_points_fidelite: pointsGagnes,
    p_notes: data.notes || null,
    p_utilisateur_id: user?.id ?? null,
    p_lignes: data.lignes.map((l) => ({
      variante_id: l.variante_id,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      remise: l.remise ?? 0,
      sous_total: l.sous_total,
    })),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/ventes');
  revalidatePath('/produits');
  revalidatePath('/stock');
  revalidatePath('/tableau-de-bord');
  revalidatePath('/clients');
  revalidatePath('/finances');

  return { success: true, venteId };
}
export async function annulerVente(venteId: string) {
  const supabase = await createClient();

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select('variante_id, quantite')
    .eq('vente_id', venteId);

  if (lignes) {
    for (const ligne of lignes) {
      const { data: stock } = await supabase
        .from('stock')
        .select('quantite')
        .eq('variante_id', ligne.variante_id)
        .single();

      const quantiteAvant = stock?.quantite ?? 0;
      const quantiteApres = quantiteAvant + ligne.quantite;

      await supabase
        .from('stock')
        .update({ quantite: quantiteApres })
        .eq('variante_id', ligne.variante_id);

      await supabase.from('mouvements_stock').insert({
        variante_id: ligne.variante_id,
        type: 'retour',
        quantite: ligne.quantite,
        quantite_avant: quantiteAvant,
        quantite_apres: quantiteApres,
        motif: 'Annulation de vente',
        reference_id: venteId,
        reference_type: 'annulation',
      });
    }
  }

  const { error } = await supabase
    .from('ventes')
    .update({ statut: 'annulee' })
    .eq('id', venteId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/ventes');
  revalidatePath(`/ventes/${venteId}`);
  return { success: true };
}

// ============================================
// Recherche de variantes pour la vente
// ============================================
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

// ============================================
// Ajouter un paiement à une vente
// ============================================
export async function ajouterPaiement(
  venteId: string,
  montant: number,
  mode: string,
  notes?: string
) {
  if (montant <= 0) {
    return { success: false, error: 'Le montant doit être positif.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc('ajouter_paiement_vente', {
    p_vente_id: venteId,
    p_montant: montant,
    p_mode: mode,
    p_notes: notes || null,
    p_utilisateur_id: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/ventes');
  revalidatePath(`/ventes/${venteId}`);
  revalidatePath('/clients');
  revalidatePath('/tableau-de-bord');

  return { success: true, paiementId: data };
}