export type Fournisseur = {
  id: string;
  nom: string;
  contact_nom: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  notes: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
};

export type FournisseurAvecHistorique = Fournisseur & {
  achats: {
    id: string;
    reference: string;
    total: number;
    montant_paye: number;
    statut: string;
    date_achat: string;
  }[];
};

export type FournisseurAvecStats = Fournisseur & {
  nb_achats: number;
  total_achats: number;
  total_paye: number;
  reste_du: number;
};