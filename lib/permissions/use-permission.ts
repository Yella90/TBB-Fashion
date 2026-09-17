'use client';

import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useMemo } from 'react';
import {
  aLaPermission,
  aUneDesPermissions,
  aToutesLesPermissions,
  type Permission,
} from './roles';
import type { Role } from '@/types/utilisateur';

// Le rôle est stocké dans user_metadata du JWT
function extraireRole(user: any): Role | null {
  const role = user?.user_metadata?.role ?? user?.app_metadata?.role;
  if (role === 'admin' || role === 'gerant' || role === 'vendeur') {
    return role;
  }
  return null;
}

export function usePermission() {
  const { user, loading } = useCurrentUser();
  const role = useMemo(() => extraireRole(user), [user]);

  return {
    role,
    loading,
    can: (permission: Permission) => aLaPermission(role, permission),
    canAny: (permissions: Permission[]) => aUneDesPermissions(role, permissions),
    canAll: (permissions: Permission[]) => aToutesLesPermissions(role, permissions),
    isAdmin: role === 'admin',
    isGerant: role === 'gerant',
    isVendeur: role === 'vendeur',
  };
}