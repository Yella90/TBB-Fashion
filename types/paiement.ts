export type ModePaiementGlobal =
  | 'especes'
  | 'mobile_money'
  | 'carte'
  | 'virement';

export type Paiement = {
  id: string;
  reference: string;
  client_id: string | null;
  vente_id: string | null;
  achat_id: string | null;
  montant: number;
  mode: ModePaiementGlobal;
  date_paiement: string;
  notes: string | null;
  utilisateur_id: string | null;
  created_at: string;
};

export type PaiementAvecDetails = Paiement & {
  client: {
    id: string;
    nom: string;
    prenom: string | null;
    telephone: string | null;
  } | null;
  vente: {
    id: string;
    reference: string;
    total: number;
  } | null;
  utilisateur: {
    id: string;
    nom: string;
  } | null;
};

export const MODES_PAIEMENT_GLOBAL: {
  value: ModePaiementGlobal;
  label: string;
  className: string;
}[] = [
  {
    value: 'especes',
    label: 'Espèces',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'mobile_money',
    label: 'Mobile Money',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
  {
    value: 'carte',
    label: 'Carte',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0',
  },
  {
    value: 'virement',
    label: 'Virement',
    className:
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-0',
  },
];