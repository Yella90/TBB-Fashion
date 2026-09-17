export type Categorie = 'homme' | 'femme' | 'enfant' | 'unisexe';

export type TypeChaussure =
  | 'sport'
  | 'ville'
  | 'bottine'
  | 'sandale'
  | 'espadrille'
  | 'basket'
  | 'mocassin'
  | 'autre';

export type Saison = 'printemps' | 'ete' | 'automne' | 'hiver' | 'toutes';

export type Produit = {
  id: string;
  reference: string;
  nom: string;
  marque: string | null;
  description: string | null;
  categorie: Categorie;
  type: TypeChaussure | null;
  saison: Saison | null;
  prix_achat: number;
  prix_vente: number;
  image_url: string | null;
  images: string[] | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
};

export type VarianteAvecStock = {
  id: string;
  produit_id: string;
  pointure: number;
  couleur: string;
  code_barre: string | null;
  prix_vente: number;
  prix_achat: number;
  sku: string | null;
  actif: boolean;
  stock: {
    quantite: number;
    seuil_alerte: number;
  } | null;
};

export type ProduitAvecVariantes = Produit & {
  variantes: VarianteAvecStock[];
};

export const CATEGORIES: { value: Categorie; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'unisexe', label: 'Unisexe' },
];

export const TYPES: { value: TypeChaussure; label: string }[] = [
  { value: 'basket', label: 'Basket' },
  { value: 'sport', label: 'Sport' },
  { value: 'ville', label: 'Ville' },
  { value: 'bottine', label: 'Bottine' },
  { value: 'sandale', label: 'Sandale' },
  { value: 'espadrille', label: 'Espadrille' },
  { value: 'mocassin', label: 'Mocassin' },
  { value: 'autre', label: 'Autre' },
];

export const SAISONS: { value: Saison; label: string }[] = [
  { value: 'toutes', label: 'Toutes saisons' },
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
];

export const POINTURES_STANDARD = [
  36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5,
  43, 43.5, 44, 44.5, 45, 46, 47,
];