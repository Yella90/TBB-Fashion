import { z } from 'zod';

// ============================================
// Boutique
// ============================================
export const parametresBoutiqueSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  slogan: z.string().optional().or(z.literal('')),
  adresse: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  devise: z.string().min(1, 'Devise requise'),
  symbole_devise: z.string().min(1, 'Symbole requis'),
  tva: z.number().min(0).max(100, 'TVA max 100%'),
  seuil_alerte_stock: z.number().int().min(0, 'Seuil invalide'),
  points_fidelite_par_1000: z.number().min(0),
  valeur_point_fidelite: z.number().min(0),
});

export type ParametresBoutiqueInput = z.infer<typeof parametresBoutiqueSchema>;

// ============================================
// Finance
// ============================================
export const parametresFinanceSchema = z.object({
  finance_mode_defaut: z.enum(['resultat', 'tresorerie']),
  finance_montrer_resultat: z.boolean(),
  finance_montrer_tresorerie: z.boolean(),
  finance_inclure_achats: z.boolean(),
  finance_base_achats: z.enum(['paye', 'total']),
  finance_marge_credit: z.enum(['complete', 'prorata']),
  finance_periode_defaut: z.enum([
    'jour',
    'semaine',
    'mois',
    'trimestre',
    'annee',
  ]),
  finance_toggle_visible: z.boolean(),
});

export type ParametresFinanceInput = z.infer<typeof parametresFinanceSchema>;