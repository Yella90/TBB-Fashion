'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  fournisseurSchema,
  type FournisseurInput,
} from '@/lib/validations/fournisseur.schema';

export async function creerFournisseur(input: FournisseurInput) {
  const parsed = fournisseurSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: fournisseur, error } = await supabase
    .from('fournisseurs')
    .insert({
      nom: data.nom,
      contact_nom: data.contact_nom || null,
      telephone: data.telephone || null,
      email: data.email || null,
      adresse: data.adresse || null,
      ville: data.ville || null,
      pays: data.pays || 'Mali',
      notes: data.notes || null,
      actif: true,
    })
    .select()
    .single();

  if (error || !fournisseur) {
    return { success: false, error: error?.message ?? 'Erreur' };
  }

  revalidatePath('/fournisseurs');
  return { success: true, fournisseurId: fournisseur.id };
}

export async function modifierFournisseur(id: string, input: FournisseurInput) {
  const parsed = fournisseurSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from('fournisseurs')
    .update({
      nom: data.nom,
      contact_nom: data.contact_nom || null,
      telephone: data.telephone || null,
      email: data.email || null,
      adresse: data.adresse || null,
      ville: data.ville || null,
      pays: data.pays || 'Mali',
      notes: data.notes || null,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/fournisseurs');
  revalidatePath(`/fournisseurs/${id}`);
  return { success: true };
}

export async function supprimerFournisseur(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from('achats')
    .select('*', { count: 'exact', head: true })
    .eq('fournisseur_id', id);

  if (count && count > 0) {
    const { error } = await supabase
      .from('fournisseurs')
      .update({ actif: false })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/fournisseurs');
    return {
      success: true,
      message: 'Fournisseur désactivé (il a des achats enregistrés)',
    };
  }

  const { error } = await supabase.from('fournisseurs').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/fournisseurs');
  return { success: true };
}

export async function toggleActifFournisseur(id: string, actif: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('fournisseurs')
    .update({ actif })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/fournisseurs');
  return { success: true };
}