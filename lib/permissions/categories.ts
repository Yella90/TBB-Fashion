import type { Permission } from './roles';

export type CategoriePermission = {
  label: string;
  permissions: {
    code: Permission;
    label: string;
    description?: string;
  }[];
};

export const CATEGORIES_PERMISSIONS: CategoriePermission[] = [
  {
    label: 'Ventes',
    permissions: [
      { code: 'vente:create', label: 'Créer une vente' },
      { code: 'vente:read', label: 'Voir les ventes' },
      { code: 'vente:update', label: 'Modifier une vente' },
      { code: 'vente:annuler', label: 'Annuler une vente' },
      { code: 'vente:delete', label: 'Supprimer une vente' },
    ],
  },
  {
    label: 'Achats',
    permissions: [
      { code: 'achat:create', label: 'Créer un achat' },
      { code: 'achat:read', label: 'Voir les achats' },
      { code: 'achat:update', label: 'Modifier un achat' },
      { code: 'achat:annuler', label: 'Annuler un achat' },
      { code: 'achat:delete', label: 'Supprimer un achat' },
    ],
  },
  {
    label: 'Produits',
    permissions: [
      { code: 'produit:create', label: 'Créer un produit' },
      { code: 'produit:read', label: 'Voir les produits' },
      { code: 'produit:update', label: 'Modifier un produit' },
      { code: 'produit:delete', label: 'Supprimer un produit' },
    ],
  },
  {
    label: 'Variantes',
    permissions: [
      { code: 'variante:create', label: 'Créer une variante' },
      { code: 'variante:read', label: 'Voir les variantes' },
      { code: 'variante:update', label: 'Modifier une variante' },
      { code: 'variante:delete', label: 'Supprimer une variante' },
    ],
  },
  {
    label: 'Stock',
    permissions: [
      { code: 'stock:read', label: 'Voir le stock' },
      { code: 'stock:adjust', label: 'Ajuster le stock' },
      { code: 'stock:inventaire', label: 'Faire un inventaire' },
    ],
  },
  {
    label: 'Clients',
    permissions: [
      { code: 'client:create', label: 'Créer un client' },
      { code: 'client:read', label: 'Voir les clients' },
      { code: 'client:update', label: 'Modifier un client' },
      { code: 'client:delete', label: 'Supprimer un client' },
    ],
  },
  {
    label: 'Fournisseurs',
    permissions: [
      { code: 'fournisseur:create', label: 'Créer un fournisseur' },
      { code: 'fournisseur:read', label: 'Voir les fournisseurs' },
      { code: 'fournisseur:update', label: 'Modifier un fournisseur' },
      { code: 'fournisseur:delete', label: 'Supprimer un fournisseur' },
    ],
  },
  {
    label: 'Retours',
    permissions: [
      { code: 'retour:create', label: 'Créer un retour' },
      { code: 'retour:read', label: 'Voir les retours' },
      { code: 'retour:validate', label: 'Valider un retour' },
    ],
  },
  {
    label: 'Paiements',
    permissions: [
      { code: 'paiement:create', label: 'Encaisser un paiement' },
      { code: 'paiement:read', label: 'Voir les paiements' },
      { code: 'paiement:delete', label: 'Supprimer un paiement' },
    ],
  },
  {
    label: 'Finances',
    permissions: [
      { code: 'finance:read', label: 'Voir les finances' },
      { code: 'finance:create', label: 'Créer une transaction' },
      { code: 'finance:caisse', label: 'Gérer la caisse' },
    ],
  },
  {
    label: 'Rapports',
    permissions: [
      { code: 'rapport:read', label: 'Voir les rapports' },
      { code: 'rapport:export', label: 'Exporter les rapports' },
    ],
  },
  {
    label: 'Paramètres',
    permissions: [
      { code: 'parametre:read', label: 'Voir les paramètres' },
      { code: 'parametre:update', label: 'Modifier les paramètres' },
    ],
  },
  {
    label: 'Utilisateurs',
    permissions: [
      { code: 'utilisateur:read', label: 'Voir les utilisateurs' },
      { code: 'utilisateur:create', label: 'Inviter un utilisateur' },
      { code: 'utilisateur:update', label: 'Modifier un utilisateur' },
      { code: 'utilisateur:delete', label: 'Supprimer un utilisateur' },
    ],
  },
];