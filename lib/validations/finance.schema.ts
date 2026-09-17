import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['revenu', 'depense']),
  categorie: z.string().min(1, 'Catégorie requise'),
  montant: z.number({ message: 'Montant invalide' }).positive('Le montant doit être positif'),
  description: z.string().optional().or(z.literal('')),
  mode_paiement: z
    .enum(['especes', 'mobile_money', 'carte', 'virement'])
    .optional(),
  date_transaction: z.string().optional(),
});

export const caisseJourSchema = z.object({
  fond_ouverture: z.number().min(0),
  solde_reel: z.number().min(0),
  notes: z.string().optional().or(z.literal('')),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type CaisseJourInput = z.infer<typeof caisseJourSchema>;