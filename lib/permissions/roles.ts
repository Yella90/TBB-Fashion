import type { Role } from '@/types/utilisateur';

export type Permission =
  // Ventes
  | 'vente:create'
  | 'vente:read'
  | 'vente:update'
  | 'vente:delete'
  | 'vente:annuler'
  // Achats
  | 'achat:create'
  | 'achat:read'
  | 'achat:update'
  | 'achat:delete'
  | 'achat:annuler'
  // Produits
  | 'produit:create'
  | 'produit:read'
  | 'produit:update'
  | 'produit:delete'
  // Variantes
  | 'variante:create'
  | 'variante:read'
  | 'variante:update'
  | 'variante:delete'
  // Stock
  | 'stock:read'
  | 'stock:adjust'
  | 'stock:inventaire'
  // Clients
  | 'client:create'
  | 'client:read'
  | 'client:update'
  | 'client:delete'
  // Fournisseurs
  | 'fournisseur:create'
  | 'fournisseur:read'
  | 'fournisseur:update'
  | 'fournisseur:delete'
  // Retours
  | 'retour:create'
  | 'retour:read'
  | 'retour:validate'
  // Paiements
  | 'paiement:create'
  | 'paiement:read'
  | 'paiement:delete'
  // Finances
  | 'finance:read'
  | 'finance:create'
  | 'finance:caisse'
  // Rapports
  | 'rapport:read'
  | 'rapport:export'
  // Paramètres
  | 'parametre:read'
  | 'parametre:update'
  // Utilisateurs
  | 'utilisateur:read'
  | 'utilisateur:create'
  | 'utilisateur:update'
  | 'utilisateur:delete';

export const PERMISSIONS_PAR_ROLE: Record<Role, Permission[]> = {
  // ============================================
  // ADMIN — Accès complet
  // ============================================
  admin: [
    // Ventes
    'vente:create', 'vente:read', 'vente:update', 'vente:delete', 'vente:annuler',
    // Achats
    'achat:create', 'achat:read', 'achat:update', 'achat:delete', 'achat:annuler',
    // Produits
    'produit:create', 'produit:read', 'produit:update', 'produit:delete',
    // Variantes
    'variante:create', 'variante:read', 'variante:update', 'variante:delete',
    // Stock
    'stock:read', 'stock:adjust', 'stock:inventaire',
    // Clients
    'client:create', 'client:read', 'client:update', 'client:delete',
    // Fournisseurs
    'fournisseur:create', 'fournisseur:read', 'fournisseur:update', 'fournisseur:delete',
    // Retours
    'retour:create', 'retour:read', 'retour:validate',
    // Paiements
    'paiement:create', 'paiement:read', 'paiement:delete',
    // Finances
    'finance:read', 'finance:create', 'finance:caisse',
    // Rapports
    'rapport:read', 'rapport:export',
    // Paramètres
    'parametre:read', 'parametre:update',
    // Utilisateurs
    'utilisateur:read', 'utilisateur:create', 'utilisateur:update', 'utilisateur:delete',
  ],

  // ============================================
  // GÉRANT — Gestion complète sauf utilisateurs et config critique
  // ============================================
  gerant: [
    // Ventes
    'vente:create', 'vente:read', 'vente:update', 'vente:annuler',
    // Achats
    'achat:create', 'achat:read', 'achat:update', 'achat:annuler',
    // Produits
    'produit:create', 'produit:read', 'produit:update', 'produit:delete',
    // Variantes
    'variante:create', 'variante:read', 'variante:update', 'variante:delete',
    // Stock
    'stock:read', 'stock:adjust', 'stock:inventaire',
    // Clients
    'client:create', 'client:read', 'client:update', 'client:delete',
    // Fournisseurs
    'fournisseur:create', 'fournisseur:read', 'fournisseur:update', 'fournisseur:delete',
    // Retours
    'retour:create', 'retour:read', 'retour:validate',
    // Paiements
    'paiement:create', 'paiement:read',
    // Finances
    'finance:read', 'finance:create', 'finance:caisse',
    // Rapports
    'rapport:read', 'rapport:export',
    // Paramètres (lecture seule)
    'parametre:read',
    // Utilisateurs (lecture seule)
    'utilisateur:read',
  ],

  // ============================================
  // VENDEUR — Uniquement ventes, clients, retours
  // ============================================
  vendeur: [
    // Ventes
    'vente:create', 'vente:read',
    // Produits (lecture seule)
    'produit:read',
    // Variantes (lecture seule)
    'variante:read',
    // Stock (lecture seule)
    'stock:read',
    // Clients
    'client:create', 'client:read', 'client:update',
    // Retours
    'retour:create', 'retour:read',
    // Paiements
    'paiement:create', 'paiement:read',
  ],
};

export function aLaPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS_PAR_ROLE[role]?.includes(permission) ?? false;
}

export function aUneDesPermissions(
  role: Role | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.some((p) => aLaPermission(role, p));
}

export function aToutesLesPermissions(
  role: Role | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.every((p) => aLaPermission(role, p));
}