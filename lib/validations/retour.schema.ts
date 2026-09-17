import { z } from 'zod';

export const ligneRetourSchema = z.object({
  variante_id: z.string().uuid(),
  quantite: z.number().int().positive('Quantité invalide'),
  prix_unitaire: z.number().min(0),
  sous_total: z.number().min(0),
  produit_nom: z.string().optional(),
  pointure: z.number().optional(),
  couleur: z.string().optional(),
  quantite_max: z.number().optional(),
});

export const retourSchema = z.object({
  vente_id: z.string().uuid(),
  client_id: z.string().uuid().nullable().optional(),
  motif: z.enum([
    'defectueux',
    'mauvaise_taille',
    'changement_avis',
    'erreur',
    'autre',
  ]),
  description: z.string().optional().or(z.literal('')),
  type_remboursement: z.enum(['especes', 'avoir']),
  montant_rembourse: z.number().min(0),
  lignes: z.array(ligneRetourSchema).min(1, 'Sélectionnez au moins un article'),
});

export type LigneRetourInput = z.infer<typeof ligneRetourSchema>;
export type RetourInput = z.infer<typeof retourSchema>;