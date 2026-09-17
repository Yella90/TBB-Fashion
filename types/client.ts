export type Genre = 'homme' | 'femme' | 'autre';

export type Client = {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  date_naissance: string | null;
  genre: Genre | null;
  points_fidelite: number;
  solde_avoir: number;
  total_achats: number;
  total_dettes: number;
  notes: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientAvecHistorique = Client & {
  ventes: {
    id: string;
    reference: string;
    total: number;
    statut: string;
    date_vente: string;
  }[];
  dettes: {
    id: string;
    montant_initial: number;
    montant_restant: number;
    statut: string;
    date_echeance: string | null;
    created_at: string;
  }[];
  paiements: {
    id: string;
    reference: string;
    montant: number;
    mode: string;
    date_paiement: string;
  }[];
  fidelite: {
    id: string;
    points: number;
    type: string;
    description: string | null;
    vente_id: string | null;
    created_at: string;
  }[];
};

export const GENRES: { value: Genre; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

export const TYPES_MOUVEMENT_FIDELITE: Record<
  string,
  { label: string; className: string }
> = {
  gain: {
    label: 'Gain',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  utilisation: {
    label: 'Utilisation',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0',
  },
  expiration: {
    label: 'Expiration',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
  ajustement: {
    label: 'Ajustement',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
};