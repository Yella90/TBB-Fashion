import { z } from 'zod';

export const connexionSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});

export const inscriptionSchema = z.object({
  nom: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
  confirmation: z.string(),
}).refine((data) => data.password === data.confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmation'],
});

export type ConnexionInput = z.infer<typeof connexionSchema>;
export type InscriptionInput = z.infer<typeof inscriptionSchema>;