import { z } from 'zod';

export const fournisseurSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  contact_nom: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  adresse: z.string().optional().or(z.literal('')),
  ville: z.string().optional().or(z.literal('')),
  pays: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type FournisseurInput = z.infer<typeof fournisseurSchema>;