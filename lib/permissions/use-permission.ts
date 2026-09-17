'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  aLaPermission,
  aUneDesPermissions,
  aToutesLesPermissions,
  type Permission,
} from './roles';
import type { Role } from '@/types/utilisateur';

function extraireRoleMetadata(user: any): Role | null {
  const role = user?.user_metadata?.role ?? user?.app_metadata?.role;
  if (role === 'admin' || role === 'gerant' || role === 'vendeur') {
    return role;
  }
  return null;
}

export function usePermission() {
  const { user, loading: loadingUser } = useCurrentUser();
  const [role, setRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function chargerRole() {
      if (!user) {
        if (!cancelled) {
          setRole(null);
          setLoadingRole(false);
        }
        return;
      }

      // 1. Essayer depuis le metadata (rapide)
      const roleMeta = extraireRoleMetadata(user);
      if (roleMeta) {
        if (!cancelled) {
          setRole(roleMeta);
          setLoadingRole(false);
        }
        return;
      }

      // 2. Fallback : chercher dans la table utilisateurs
      const supabase = createClient();
      const { data } = await supabase
        .from('utilisateurs')
        .select('role')
        .eq('id', user.id)
        .single();

      if (cancelled) return;

      const r = data?.role;
      if (r === 'admin' || r === 'gerant' || r === 'vendeur') {
        setRole(r);
      } else {
        setRole(null);
      }
      setLoadingRole(false);
    }

    chargerRole();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = loadingUser || loadingRole;

  return useMemo(
    () => ({
      role,
      loading,
      can: (permission: Permission) => aLaPermission(role, permission),
      canAny: (permissions: Permission[]) =>
        aUneDesPermissions(role, permissions),
      canAll: (permissions: Permission[]) =>
        aToutesLesPermissions(role, permissions),
      isAdmin: role === 'admin',
      isGerant: role === 'gerant',
      isVendeur: role === 'vendeur',
    }),
    [role, loading]
  );
}