export type TypeTransaction = 'revenu' | 'depense';
export type ModePaiementFinance =
  | 'especes'
  | 'mobile_money'
  | 'carte'
  | 'virement';

export type Transaction = {
  id: string;
  type: TypeTransaction;
  categorie: string;
  montant: number;
  description: string | null;
  mode_paiement: ModePaiementFinance | null;
  reference_id: string | null;
  reference_type: string | null;
  date_transaction: string;
  utilisateur_id: string | null;
  created_at: string;
};

export type Caisse = {
  id: string;
  date_jour: string;
  fond_ouverture: number;
  entrees: number;
  sorties: number;
  solde_theorique: number;
  solde_reel: number | null;
  ecart: number | null;
  notes: string | null;
  utilisateur_id: string | null;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES_REVENU = [
  'Vente',
  'Service',
  'Apport',
  'Remboursement',
  'Autre',
];

export const CATEGORIES_DEPENSE = [
  'Achat marchandise',
  'Loyer',
  'Salaires',
  'Électricité',
  'Eau',
  'Transport',
  'Publicité',
  'Entretien',
  'Taxes',
  'Autre',
];

export const MODES_PAIEMENT_FINANCE: {
  value: ModePaiementFinance;
  label: string;
}[] = [
  { value: 'especes', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'carte', label: 'Carte' },
  { value: 'virement', label: 'Virement' },
];