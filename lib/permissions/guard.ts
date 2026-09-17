import { createClient } from '@/lib/supabase/server';
import { aLaPermission, type Permission } from './roles';
import type { Role } from '@/types/utilisateur';

export async function getRoleUtilisateurActuel(): Promise<Role | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('utilisateurs')
    .select('role')
    .eq('id', user.id)
    .single();

  return (data?.role as Role) ?? null;
}

export async function requirePermission(permission: Permission) {
  const role = await getRoleUtilisateurActuel();

  if (!aLaPermission(role, permission)) {
    throw new Error('Vous n\'avez pas la permission pour cette action.');
  }

  return role;
}