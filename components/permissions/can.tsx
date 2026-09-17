'use client';

import { usePermission } from '@/lib/permissions/use-permission';
import type { Permission } from '@/lib/permissions/roles';

type Props = {
  /** Permission requise */
  permission?: Permission;
  /** OU l'une de ces permissions */
  any?: Permission[];
  /** ET toutes ces permissions */
  all?: Permission[];
  /** Contenu alternatif si non autorisé */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Affiche les enfants uniquement si l'utilisateur a la permission.
 *
 * @example
 * <Can permission="vente:create">
 *   <Button>Nouvelle vente</Button>
 * </Can>
 */
export function Can({ permission, any, all, fallback = null, children }: Props) {
  const { can, canAny, canAll, loading } = usePermission();

  if (loading) return null;

  let autorise = false;

  if (permission) {
    autorise = can(permission);
  } else if (any && any.length > 0) {
    autorise = canAny(any);
  } else if (all && all.length > 0) {
    autorise = canAll(all);
  }

  return autorise ? <>{children}</> : <>{fallback}</>;
}