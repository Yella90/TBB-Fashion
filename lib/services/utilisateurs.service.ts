import { createClient } from '@/lib/supabase/server';
import type { Utilisateur } from '@/types/utilisateur';

export async function listerUtilisateurs(): Promise<Utilisateur[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .order('role', { ascending: true })
    .order('nom', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Utilisateur[];
}

export async function getUtilisateur(id: string): Promise<Utilisateur | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Utilisateur;
}

export async function getUtilisateurActuel(): Promise<Utilisateur | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', user.id)
    .single();

  return data as Utilisateur | null;
}

export async function getStatsUtilisateurs() {
  const supabase = await createClient();

  const { data } = await supabase.from('utilisateurs').select('role, actif');

  const total = data?.length ?? 0;
  const actifs = data?.filter((u) => u.actif).length ?? 0;
  const admins = data?.filter((u) => u.role === 'admin').length ?? 0;
  const gerants = data?.filter((u) => u.role === 'gerant').length ?? 0;
  const vendeurs = data?.filter((u) => u.role === 'vendeur').length ?? 0;

  return { total, actifs, admins, gerants, vendeurs };
}