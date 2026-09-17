export type TypeMouvement =
  | 'entree'
  | 'sortie'
  | 'ajustement'
  | 'retour'
  | 'perte';

export type VarianteAvecStockComplet = {
  id: string;
  produit_id: string;
  pointure: number;
  couleur: string;
  prix_vente: number;
  prix_achat: number;
  sku: string | null;
  actif: boolean;
  produit: {
    id: string;
    nom: string;
    marque: string | null;
    reference: string;
    categorie: string;
  } | null;
  stock: {
    quantite: number;
    seuil_alerte: number;
    emplacement: string | null;
    updated_at: string;
  } | null;
};

export type MouvementStock = {
  id: string;
  variante_id: string;
  type: TypeMouvement;
  quantite: number;
  quantite_avant: number;
  quantite_apres: number;
  motif: string | null;
  reference_id: string | null;
  reference_type: string | null;
  utilisateur_id: string | null;
  created_at: string;
};

export type MouvementAvecDetails = MouvementStock & {
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
  utilisateur: {
    id: string;
    nom: string;
  } | null;
};

export const TYPES_MOUVEMENT: {
  value: TypeMouvement;
  label: string;
  className: string;
}[] = [
  {
    value: 'entree',
    label: 'Entrée',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
  {
    value: 'sortie',
    label: 'Sortie',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
  },
  {
    value: 'ajustement',
    label: 'Ajustement',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0',
  },
  {
    value: 'retour',
    label: 'Retour',
    className:
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-0',
  },
  {
    value: 'perte',
    label: 'Perte',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0',
  },
];

export type StatutStock = 'rupture' | 'alerte' | 'ok';

export function getStatutStock(quantite: number, seuil: number): StatutStock {
  if (quantite === 0) return 'rupture';
  if (quantite <= seuil) return 'alerte';
  return 'ok';
}

export const STATUT_STOCK_CONFIG: Record<
  StatutStock,
  { label: string; className: string }
> = {
  rupture: {
    label: 'Rupture',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
  },
  alerte: {
    label: 'Stock faible',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  },
  ok: {
    label: 'En stock',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
  },
};
// ============================================
// Ligne complète pour l'export inventaire
// ============================================
export type LigneInventaire = {
  variante_id: string;
  pointure: number;
  couleur: string;
  sku: string | null;
  prix_achat: number;
  prix_vente: number;
  produit: {
    id: string;
    nom: string;
    marque: string | null;
    reference: string;
    description: string | null;
    categorie: string;
  } | null;
  stock: {
    quantite: number;
    seuil_alerte: number;
  } | null;
  fournisseur: string | null;
  total_vendu: number;
  ca_vendu: number;
  prix_pratiques: number[];
};
