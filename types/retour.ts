export type MotifRetour =
  | 'defectueux'
  | 'mauvaise_taille'
  | 'changement_avis'
  | 'erreur'
  | 'autre';

export type TypeRemboursement = 'especes' | 'avoir';
export type StatutRetour = 'en_attente' | 'valide' | 'refuse' | 'termine';

export type Retour = {
  id: string;
  reference: string;
  vente_id: string;
  client_id: string | null;
  date_retour: string;
  motif: MotifRetour;
  description: string | null;
  montant_rembourse: number;
  type_remboursement: TypeRemboursement | null;
  statut: StatutRetour;
  utilisateur_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LigneRetour = {
  id: string;
  retour_id: string;
  variante_id: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
};

export type RetourAvecDetails = Retour & {
  vente: {
    id: string;
    reference: string;
    total: number;
    date_vente: string;
  } | null;
  client: {
    id: string;
    nom: string;
    prenom: string | null;
    telephone: string | null;
  } | null;
  lignes: (LigneRetour & {
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
  })[];
};

export const MOTIFS_RETOUR: {
  value: MotifRetour;
  label: string;
}[] = [
  { value: 'defectueux', label: 'Produit défectueux' },
  { value: 'mauvaise_taille', label: 'Mauvaise taille' },
  { value: 'changement_avis', label: 'Changement d\'avis' },
  { value: 'erreur', label: 'Erreur de vente' },
  { value: 'autre', label: 'Autre' },
];

export const TYPES_REMBOURSEMENT: {
  value: TypeRemboursement;
  label: string;
  description: string;
}[] = [
  {
    value: 'especes',
    label: 'Remboursement en espèces',
    description: 'Le client récupère son argent (sortie de caisse)',
  },
  {
    value: 'avoir',
    label: 'Avoir (crédit client)',
    description:
      'Le montant est crédité au client, utilisable sur une prochaine vente',
  },
];

export const STATUTS_RETOUR: {
  value: StatutRetour;
  label: string;
  className: string;
}[] = [
  {
    value: 'en_attente',
    label: 'En attente',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
  {
    value: 'valide',
    label: 'Validé',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'refuse',
    label: 'Refusé',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
  },
  {
    value: 'termine',
    label: 'Terminé',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
];