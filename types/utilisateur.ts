export type Role = 'admin' | 'gerant' | 'vendeur';

export type Utilisateur = {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  avatar_url: string | null;
  role: Role;
  actif: boolean;
  derniere_connexion: string | null;
  created_at: string;
  updated_at: string;
};

export const ROLES: {
  value: Role;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
  },
  {
    value: 'gerant',
    label: 'Gérant',
    description: 'Gestion produits, ventes, stock, finances',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0',
  },
  {
    value: 'vendeur',
    label: 'Vendeur',
    description: 'Peut uniquement enregistrer des ventes',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
];