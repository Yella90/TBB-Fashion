export type StatutVente = 'payee' | 'partielle' | 'impayee' | 'annulee';
export type ModePaiement =
  | 'especes'
  | 'mobile_money'
  | 'carte'
  | 'virement'
  | 'credit'
  | 'mixte';

export type LigneVente = {
  id: string;
  vente_id: string;
  variante_id: string;
  quantite: number;
  prix_unitaire: number;
  remise: number;
  sous_total: number;
};

export type LigneVenteAvecVariante = LigneVente & {
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

export type Vente = {
  id: string;
  reference: string;
  client_id: string | null;
  date_vente: string;
  sous_total: number;
  remise: number;
  tva: number;
  total: number;
  montant_paye: number;
  reste_a_payer: number;
  mode_paiement: ModePaiement | null;
  statut: StatutVente;
  points_fidelite_gagnes: number | null;
  notes: string | null;
  utilisateur_id: string | null;
  created_at: string;
  updated_at: string;
};

export type VenteAvecDetails = Vente & {
  client: {
    id: string;
    nom: string;
    prenom: string | null;
    telephone: string | null;
  } | null;
  lignes: LigneVenteAvecVariante[];
};

export const STATUTS_VENTE: {
  value: StatutVente;
  label: string;
  className: string;
}[] = [
  {
    value: 'payee',
    label: 'Payée',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'partielle',
    label: 'Partielle',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
  {
    value: 'impayee',
    label: 'Impayée',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
  },
  {
    value: 'annulee',
    label: 'Annulée',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
];

export const MODES_PAIEMENT: {
  value: ModePaiement;
  label: string;
}[] = [
  { value: 'especes', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'carte', label: 'Carte' },
  { value: 'virement', label: 'Virement' },
  { value: 'credit', label: 'Crédit (dette)' },
  { value: 'mixte', label: 'Mixte' },
];