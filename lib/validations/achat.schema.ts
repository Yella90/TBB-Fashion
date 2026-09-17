import { z } from 'zod';

export const ligneAchatSchema = z.object({
  variante_id: z.string().uuid(),
  quantite: z.number().int().positive('Quantité invalide'),
  prix_unitaire: z.number().min(0),
  sous_total: z.number().min(0),
  produit_nom: z.string().optional(),
  pointure: z.number().optional(),
  couleur: z.string().optional(),
});

export const achatSchema = z.object({
  fournisseur_id: z.string().uuid().nullable().optional(),
  lignes: z.array(ligneAchatSchema).min(1, 'Ajoutez au moins un article'),
  montant_paye: z.number().min(0),
  statut: z.enum(['en_attente', 'recu', 'annule']).default('recu'),
  notes: z.string().optional().or(z.literal('')),
  maj_prix_achat: z.boolean().default(true),
});

export type LigneAchatInput = z.infer<typeof ligneAchatSchema>;
export type AchatInput = z.infer<typeof achatSchema>;