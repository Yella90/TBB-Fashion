import { z } from 'zod';

export const invitationSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'gerant', 'vendeur']),
});

export const modifierUtilisateurSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  telephone: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'gerant', 'vendeur']),
  actif: z.boolean(),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
export type ModifierUtilisateurInput = z.infer<typeof modifierUtilisateurSchema>;