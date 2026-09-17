export type PeriodeRapport = 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';

export type StatsVentes = {
  total: number;
  nombre: number;
  panierMoyen: number;
  variation: number; // % vs période précédente
};

export type StatsBenefices = {
  chiffreAffaires: number;
  coutAchats: number;
  beneficeBrut: number;
  marge: number; // %
};

export type VenteParJour = {
  date: string;
  ventes: number;
  benefices: number;
  nombre: number;
};

export type TopProduit = {
  produit_id: string;
  nom: string;
  marque: string | null;
  quantite: number;
  ca: number;
};

export type TopClient = {
  client_id: string;
  nom: string;
  total: number;
  commandes: number;
};

export type RepartitionCategorie = {
  categorie: string;
  quantite: number;
  ca: number;
};

export type RepartitionPaiement = {
  mode: string;
  montant: number;
  nombre: number;
};

export const PERIODES: {
  value: PeriodeRapport;
  label: string;
  jours: number;
}[] = [
  { value: 'jour', label: 'Aujourd\'hui', jours: 1 },
  { value: 'semaine', label: '7 derniers jours', jours: 7 },
  { value: 'mois', label: '30 derniers jours', jours: 30 },
  { value: 'trimestre', label: '90 derniers jours', jours: 90 },
  { value: 'annee', label: 'Année en cours', jours: 365 },
];

export const LABELS_PAIEMENT: Record<string, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  carte: 'Carte',
  virement: 'Virement',
  credit: 'Crédit',
  mixte: 'Mixte',
};

export const LABELS_CATEGORIE: Record<string, string> = {
  homme: 'Homme',
  femme: 'Femme',
  enfant: 'Enfant',
  unisexe: 'Unisexe',
};