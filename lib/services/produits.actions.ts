'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  produitCompletSchema,
  produitEditSchema,
  type ProduitCompletInput,
  type ProduitEditInput,
} from '@/lib/validations/produit.schema';
import { generateSKU } from '@/lib/utils/generate-reference';

// ============================================
// CRÉATION
// ============================================
export async function creerProduitComplet(input: ProduitCompletInput) {
  const parsed = produitCompletSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // 1. Créer le produit
  const { data: produit, error: errProduit } = await supabase
    .from('produits')
    .insert({
      reference: data.reference,
      nom: data.nom,
      marque: data.marque || null,
      description: data.description || null,
      categorie: data.categorie,
      type: data.type || null,
      saison: data.saison || null,
      prix_achat: data.prix_achat,
      prix_vente: data.prix_vente,
      actif: true,
    })
    .select()
    .single();

  if (errProduit || !produit) {
    return {
      success: false,
      error:
        errProduit?.code === '23505'
          ? 'Cette référence existe déjà.'
          : errProduit?.message ?? 'Erreur lors de la création.',
    };
  }

  // 2. Créer les variantes
  const variantesData = data.variantes.map((v) => ({
    produit_id: produit.id,
    pointure: v.pointure,
    couleur: v.couleur,
    prix_vente: v.prix_vente,
    prix_achat: v.prix_achat ?? data.prix_achat,
    code_barre: v.code_barre || null,
    sku: generateSKU(produit.reference, v.pointure, v.couleur),
    actif: true,
  }));

  const { data: variantes, error: errVar } = await supabase
    .from('variantes')
    .insert(variantesData)
    .select();

  if (errVar || !variantes) {
    await supabase.from('produits').delete().eq('id', produit.id);
    return {
      success: false,
      error:
        errVar?.code === '23505'
          ? 'Une variante (pointure + couleur) existe déjà.'
          : errVar?.message ?? 'Erreur lors de la création des variantes.',
    };
  }

  // 3. Stock initial
  for (let i = 0; i < variantes.length; i++) {
    const stockInitial = data.variantes[i].stock_initial;
    if (stockInitial > 0) {
      await supabase
        .from('stock')
        .update({ quantite: stockInitial })
        .eq('variante_id', variantes[i].id);
    }
  }

  revalidatePath('/produits');
  return { success: true, produitId: produit.id };
}

// ============================================
// MODIFICATION
// ============================================
export async function modifierProduitComplet(
  produitId: string,
  input: ProduitEditInput
) {
  const parsed = produitEditSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // 1. Mettre à jour le produit
  const { error: errProduit } = await supabase
    .from('produits')
    .update({
      reference: data.reference,
      nom: data.nom,
      marque: data.marque || null,
      description: data.description || null,
      categorie: data.categorie,
      type: data.type || null,
      saison: data.saison || null,
      prix_achat: data.prix_achat,
      prix_vente: data.prix_vente,
    })
    .eq('id', produitId);

  if (errProduit) {
    return {
      success: false,
      error:
        errProduit.code === '23505'
          ? 'Cette référence existe déjà.'
          : errProduit.message,
    };
  }

  // 2. Variantes existantes
  const { data: variantesExistantes } = await supabase
    .from('variantes')
    .select('id')
    .eq('produit_id', produitId);

  const idsExistants = new Set(variantesExistantes?.map((v) => v.id) ?? []);
  const idsForm = new Set(
    data.variantes.filter((v) => v.id).map((v) => v.id!)
  );

  // 3. Supprimer les variantes retirées
  const aSupprimer = [...idsExistants].filter((id) => !idsForm.has(id));
  if (aSupprimer.length > 0) {
    const { error: errDel } = await supabase
      .from('variantes')
      .delete()
      .in('id', aSupprimer);

    if (errDel) {
      if (errDel.code === '23503') {
        await supabase
          .from('variantes')
          .update({ actif: false })
          .in('id', aSupprimer);
      } else {
        return { success: false, error: errDel.message };
      }
    }
  }

  // 4. Mettre à jour les variantes existantes
  for (const v of data.variantes) {
    if (v.id) {
      const { error: errUpd } = await supabase
        .from('variantes')
        .update({
          pointure: v.pointure,
          couleur: v.couleur,
          prix_vente: v.prix_vente,
          prix_achat: v.prix_achat ?? data.prix_achat,
          code_barre: v.code_barre || null,
        })
        .eq('id', v.id);

      if (errUpd) {
        return { success: false, error: errUpd.message };
      }
    }
  }

  // 5. Nouvelles variantes
  const nouvelles = data.variantes.filter((v) => !v.id);
  if (nouvelles.length > 0) {
    const { data: inserted, error: errIns } = await supabase
      .from('variantes')
      .insert(
        nouvelles.map((v) => ({
          produit_id: produitId,
          pointure: v.pointure,
          couleur: v.couleur,
          prix_vente: v.prix_vente,
          prix_achat: v.prix_achat ?? data.prix_achat,
          code_barre: v.code_barre || null,
          sku: generateSKU(data.reference, v.pointure, v.couleur),
          actif: true,
        }))
      )
      .select();

    if (errIns || !inserted) {
      return {
        success: false,
        error:
          errIns?.code === '23505'
            ? 'Une variante (pointure + couleur) existe déjà.'
            : errIns?.message ?? "Erreur lors de l'ajout des variantes.",
      };
    }

    // 6. Stock initial pour les nouvelles
    for (let i = 0; i < inserted.length; i++) {
      const stockInitial = nouvelles[i].stock_initial;
      if (stockInitial && stockInitial > 0) {
        await supabase
          .from('stock')
          .update({ quantite: stockInitial })
          .eq('variante_id', inserted[i].id);
      }
    }
  }

  revalidatePath('/produits');
  revalidatePath(`/produits/${produitId}`);
  return { success: true };
}

// ============================================
// SUPPRESSION
// ============================================
export async function supprimerProduit(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('produits').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/produits');
  return { success: true };
}

export async function supprimerVariante(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('variantes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/produits');
  return { success: true };
}

// ============================================
// TOGGLE ACTIF
// ============================================
export async function toggleActifProduit(id: string, actif: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('produits')
    .update({ actif })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/produits');
  return { success: true };
}

// ============================================
// AJUSTER STOCK
// ============================================
export async function ajusterStock(
  varianteId: string,
  quantite: number,
  motif: string
) {
  const supabase = await createClient();

  const { data: stockActuel } = await supabase
    .from('stock')
    .select('quantite')
    .eq('variante_id', varianteId)
    .single();

  const quantiteAvant = stockActuel?.quantite ?? 0;
  const quantiteApres = quantiteAvant + quantite;

  if (quantiteApres < 0) {
    return { success: false, error: 'Le stock ne peut pas être négatif.' };
  }

  const { error } = await supabase
    .from('stock')
    .update({ quantite: quantiteApres })
    .eq('variante_id', varianteId);

  if (error) return { success: false, error: error.message };

  await supabase.from('mouvements_stock').insert({
    variante_id: varianteId,
    type: quantite > 0 ? 'entree' : 'ajustement',
    quantite,
    quantite_avant: quantiteAvant,
    quantite_apres: quantiteApres,
    motif,
  });

  revalidatePath('/produits');
  return { success: true };
}