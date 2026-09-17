import { z } from 'zod';

export const clientSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  prenom: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  adresse: z.string().optional().or(z.literal('')),
  ville: z.string().optional().or(z.literal('')),
  date_naissance: z.string().optional().or(z.literal('')),
  genre: z.enum(['homme', 'femme', 'autre']).optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
});

export type ClientInput = z.infer<typeof clientSchema>;