import { createClient } from '@/lib/supabase/server';
import type { Fournisseur, FournisseurAvecHistorique } from '@/types/fournisseur';

export async function listerFournisseurs(options?: {
  recherche?: string;
  limite?: number;
  actifSeulement?: boolean;
}): Promise<Fournisseur[]> {
  const supabase = await createClient();

  let query = supabase
    .from('fournisseurs')
    .select('*')
    .order('nom', { ascending: true });

  if (options?.actifSeulement !== false) {
    query = query.eq('actif', true);
  }

  if (options?.recherche) {
    query = query.or(
      `nom.ilike.%${options.recherche}%,contact_nom.ilike.%${options.recherche}%,telephone.ilike.%${options.recherche}%`
    );
  }

  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFournisseur(
  id: string
): Promise<FournisseurAvecHistorique | null> {
  const supabase = await createClient();

  const { data: fournisseur, error } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !fournisseur) return null;

  const { data: achats } = await supabase
    .from('achats')
    .select('id, reference, total, montant_paye, statut, date_achat')
    .eq('fournisseur_id', id)
    .order('date_achat', { ascending: false })
    .limit(50);

  return {
    ...fournisseur,
    achats: achats ?? [],
  };
}

export async function getStatsFournisseurs() {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('fournisseurs')
    .select('*', { count: 'exact', head: true })
    .eq('actif', true);

  const { data: achats } = await supabase
    .from('achats')
    .select('total, montant_paye')
    .neq('statut', 'annule');

  const totalAchats = achats?.reduce((s, a) => s + (a.total ?? 0), 0) ?? 0;
  const totalPaye = achats?.reduce((s, a) => s + (a.montant_paye ?? 0), 0) ?? 0;

  return {
    total: total ?? 0,
    totalAchats,
    resteDu: Math.max(totalAchats - totalPaye, 0),
  };
}