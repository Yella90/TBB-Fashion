import { createClient } from '@/lib/supabase/server';
import type { ParametresBoutique } from '@/types/parametres';

export async function getParametresBoutique(): Promise<ParametresBoutique | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('parametres_boutique')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return null;
  return data as ParametresBoutique;
}

// Valeurs par défaut si la table est vide
export const PARAMETRES_DEFAUT: Partial<ParametresBoutique> = {
  finance_mode_defaut: 'resultat',
  finance_montrer_resultat: true,
  finance_montrer_tresorerie: true,
  finance_inclure_achats: true,
  finance_base_achats: 'paye',
  finance_marge_credit: 'complete',
  finance_periode_defaut: 'mois',
  finance_toggle_visible: true,
};