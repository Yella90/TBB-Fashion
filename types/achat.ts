export type StatutAchat = 'en_attente' | 'recu' | 'annule';

export type LigneAchat = {
  id: string;
  achat_id: string;
  variante_id: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
};

export type LigneAchatAvecVariante = LigneAchat & {
  variante: {
    id: string;
    pointure: number;
    couleur: string;
    sku: string | null;
    produit: {
      id: string;
      nom: string;
      marque: string | null;
      reference: string;
    } | null;
  } | null;
};

export type Achat = {
  id: string;
  reference: string;
  fournisseur_id: string | null;
  date_achat: string;
  statut: StatutAchat;
  total: number;
  montant_paye: number;
  notes: string | null;
  utilisateur_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AchatAvecDetails = Achat & {
  fournisseur: {
    id: string;
    nom: string;
    contact_nom: string | null;
    telephone: string | null;
  } | null;
  lignes: LigneAchatAvecVariante[];
};

export const STATUTS_ACHAT: {
  value: StatutAchat;
  label: string;
  className: string;
}[] = [
  {
    value: 'recu',
    label: 'Reçu',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'en_attente',
    label: 'En attente',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
  {
    value: 'annule',
    label: 'Annulé',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
];