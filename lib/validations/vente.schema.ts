import { z } from 'zod';

export const ligneVenteSchema = z.object({
  variante_id: z.string().uuid(),
  quantite: z.number().int().positive('Quantité invalide'),
  prix_unitaire: z.number().min(0),
  remise: z.number().min(0).optional(),
  sous_total: z.number().min(0),
  produit_nom: z.string().optional(),
  pointure: z.number().optional(),
  couleur: z.string().optional(),
  stock_disponible: z.number().optional(),
});

export const venteSchema = z.object({
  client_id: z.string().uuid().nullable().optional(),
  lignes: z.array(ligneVenteSchema).min(1, 'Ajoutez au moins un article'),
  remise: z.number().min(0).default(0),
  tva: z.number().min(0).default(0),
  mode_paiement: z.enum([
    'especes',
    'mobile_money',
    'carte',
    'virement',
    'credit',
    'mixte',
  ]),
  montant_paye: z.number().min(0),
  avoir_utilise: z.number().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
});

export type LigneVenteInput = z.infer<typeof ligneVenteSchema>;
export type VenteInput = z.infer<typeof venteSchema>;