export type FinanceModeDefaut = 'resultat' | 'tresorerie';
export type FinanceBaseAchats = 'paye' | 'total';
export type FinanceMargeCredit = 'complete' | 'prorata';
export type PeriodeFinance = 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';

export type ParametresBoutique = {
  id: number;
  nom: string;
  slogan: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  logo_url: string | null;
  devise: string;
  symbole_devise: string;
  tva: number;
  seuil_alerte_stock: number;
  points_fidelite_par_1000: number;
  valeur_point_fidelite: number;
  // Finance
  finance_mode_defaut: FinanceModeDefaut;
  finance_montrer_resultat: boolean;
  finance_montrer_tresorerie: boolean;
  finance_inclure_achats: boolean;
  finance_base_achats: FinanceBaseAchats;
  finance_marge_credit: FinanceMargeCredit;
  finance_periode_defaut: PeriodeFinance;
  finance_toggle_visible: boolean;
  created_at: string;
  updated_at: string;
};

export const MODES_FINANCE: { value: FinanceModeDefaut; label: string; description: string }[] = [
  {
    value: 'resultat',
    label: 'Résultat',
    description: 'Marge sur ventes + autres revenus - charges',
  },
  {
    value: 'tresorerie',
    label: 'Trésorerie',
    description: 'Encaissements - décaissements réels',
  },
];

export const BASES_ACHATS: { value: FinanceBaseAchats; label: string; description: string }[] = [
  {
    value: 'paye',
    label: 'Montant payé',
    description: 'Seuls les achats réellement payés comptent',
  },
  {
    value: 'total',
    label: 'Montant total',
    description: 'Tous les achats comptent, même à crédit',
  },
];

export const MARGES_CREDIT: { value: FinanceMargeCredit; label: string; description: string }[] = [
  {
    value: 'complete',
    label: 'Marge complète',
    description: 'Toute la marge est comptée dès la vente',
  },
  {
    value: 'prorata',
    label: 'Au prorata',
    description: 'Seule la part payée est comptée',
  },
];

export const PERIODES_FINANCE: { value: PeriodeFinance; label: string }[] = [
  { value: 'jour', label: 'Aujourd\'hui' },
  { value: 'semaine', label: '7 derniers jours' },
  { value: 'mois', label: '30 derniers jours' },
  { value: 'trimestre', label: '90 derniers jours' },
  { value: 'annee', label: 'Année en cours' },
];