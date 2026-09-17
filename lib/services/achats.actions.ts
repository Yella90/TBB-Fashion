'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { achatSchema, type AchatInput } from '@/lib/validations/achat.schema';

export async function creerAchat(input: AchatInput) {
  const parsed = achatSchema.safeParse(input);
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
  const total = sousTotal;

  const { data: achatId, error } = await supabase.rpc('creer_achat', {
    p_fournisseur_id: data.fournisseur_id || null,
    p_sous_total: sousTotal,
    p_total: total,
    p_montant_paye: data.montant_paye,
    p_statut: data.statut,
    p_notes: data.notes || null,
    p_utilisateur_id: user?.id ?? null,
    p_lignes: data.lignes.map((l) => ({
      variante_id: l.variante_id,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      sous_total: l.sous_total,
    })),
    p_maj_prix_achat: data.maj_prix_achat,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/achats');
  revalidatePath('/produits');
  revalidatePath('/stock');
  revalidatePath('/tableau-de-bord');

  return { success: true, achatId };
}

export async function annulerAchat(achatId: string) {
  const supabase = await createClient();

  // Retirer le stock ajouté
  const { data: lignes } = await supabase
    .from('lignes_achat')
    .select('variante_id, quantite')
    .eq('achat_id', achatId);

  if (lignes) {
    for (const ligne of lignes) {
      const { data: stock } = await supabase
        .from('stock')
        .select('quantite')
        .eq('variante_id', ligne.variante_id)
        .single();

      const quantiteAvant = stock?.quantite ?? 0;
      const quantiteApres = Math.max(quantiteAvant - ligne.quantite, 0);

      await supabase
        .from('stock')
        .update({ quantite: quantiteApres })
        .eq('variante_id', ligne.variante_id);

      await supabase.from('mouvements_stock').insert({
        variante_id: ligne.variante_id,
        type: 'ajustement',
        quantite: -ligne.quantite,
        quantite_avant: quantiteAvant,
        quantite_apres: quantiteApres,
        motif: 'Annulation achat',
        reference_id: achatId,
        reference_type: 'annulation_achat',
      });
    }
  }

  const { error } = await supabase
    .from('achats')
    .update({ statut: 'annule' })
    .eq('id', achatId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/achats');
  revalidatePath(`/achats/${achatId}`);
  return { success: true };
}

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

  const { data: produits } = await produitsQuery;
  if (!produits || produits.length === 0) return [];

  const { data: variantes } = await supabase
    .from('variantes')
    .select(
      `
      id,
      pointure,
      couleur,
      prix_vente,
      prix_achat,
      sku,
      produit:produits (id, nom, marque, reference, actif),
      stock:stock (quantite)
    `
    )
    .in('produit_id', produits.map((p) => p.id))
    .eq('actif', true)
    .order('pointure', { ascending: true })
    .limit(50);

  return (variantes ?? []).filter((v: any) => v.produit?.actif);
}