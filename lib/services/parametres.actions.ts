'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  parametresBoutiqueSchema,
  parametresFinanceSchema,
  type ParametresBoutiqueInput,
  type ParametresFinanceInput,
} from '@/lib/validations/parametres.schema';

// ============================================
// Boutique
// ============================================
export async function updateParametresBoutique(input: ParametresBoutiqueInput) {
  const parsed = parametresBoutiqueSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('parametres_boutique')
    .update({
      nom: parsed.data.nom,
      slogan: parsed.data.slogan || null,
      adresse: parsed.data.adresse || null,
      telephone: parsed.data.telephone || null,
      email: parsed.data.email || null,
      devise: parsed.data.devise,
      symbole_devise: parsed.data.symbole_devise,
      tva: parsed.data.tva,
      seuil_alerte_stock: parsed.data.seuil_alerte_stock,
      points_fidelite_par_1000: parsed.data.points_fidelite_par_1000,
      valeur_point_fidelite: parsed.data.valeur_point_fidelite,
    })
    .eq('id', 1);

  if (error) return { success: false, error: error.message };

  revalidatePath('/parametres/boutique');
  revalidatePath('/parametres');
  revalidatePath('/tableau-de-bord');

  return { success: true };
}

// ============================================
// Finance
// ============================================
export async function updateParametresFinance(input: ParametresFinanceInput) {
  const parsed = parametresFinanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;

  if (!data.finance_montrer_resultat && !data.finance_montrer_tresorerie) {
    return {
      success: false,
      error: 'Au moins un onglet doit être affiché.',
    };
  }

  if (
    data.finance_mode_defaut === 'resultat' &&
    !data.finance_montrer_resultat
  ) {
    data.finance_mode_defaut = 'tresorerie';
  }
  if (
    data.finance_mode_defaut === 'tresorerie' &&
    !data.finance_montrer_tresorerie
  ) {
    data.finance_mode_defaut = 'resultat';
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('parametres_boutique')
    .update(data)
    .eq('id', 1);

  if (error) return { success: false, error: error.message };

  revalidatePath('/parametres/finances');
  revalidatePath('/finances');
  revalidatePath('/rapports');
  revalidatePath('/tableau-de-bord');

  return { success: true };
}