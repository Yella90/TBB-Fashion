export type TypeMouvementFidelite =
  | 'gain'
  | 'utilisation'
  | 'expiration'
  | 'ajustement';

export type MouvementFidelite = {
  id: string;
  client_id: string;
  points: number;
  type: TypeMouvementFidelite;
  vente_id: string | null;
  description: string | null;
  created_at: string;
};

export type MouvementFideliteAvecDetails = MouvementFidelite & {
  client: {
    id: string;
    nom: string;
    prenom: string | null;
    telephone: string | null;
  } | null;
  vente: {
    id: string;
    reference: string;
  } | null;
};

export type ClientFidele = {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  email: string | null;
  points_fidelite: number;
  total_achats: number;
  solde_avoir: number;
  nb_visites: number;
};

export const TYPES_MOUVEMENT_FIDELITE: {
  value: TypeMouvementFidelite;
  label: string;
  className: string;
}[] = [
  {
    value: 'gain',
    label: 'Gain',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'utilisation',
    label: 'Utilisation',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0',
  },
  {
    value: 'expiration',
    label: 'Expiration',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
  {
    value: 'ajustement',
    label: 'Ajustement',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
];