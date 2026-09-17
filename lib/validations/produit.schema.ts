import { z } from 'zod';

export const produitSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  marque: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  categorie: z.enum(['homme', 'femme', 'enfant', 'unisexe']),
  type: z
    .enum(['sport','ville','bottine','sandale','espadrille','basket','mocassin','autre'])
    .optional()
    .nullable(),
  saison: z
    .enum(['printemps','ete','automne','hiver','toutes'])
    .optional()
    .nullable(),
  prix_achat: z.number().min(0, 'Prix invalide'),
  prix_vente: z.number().min(0, 'Prix invalide'),
});

export const varianteSchema = z.object({
  pointure: z.number().min(15).max(60),
  couleur: z.string().min(1, 'Couleur requise'),
  prix_vente: z.number().min(0),
  prix_achat: z.number().min(0).optional(),
  code_barre: z.string().optional().or(z.literal('')),
  stock_initial: z.number().min(0),
});

export const produitCompletSchema = produitSchema.extend({
  variantes: z.array(varianteSchema).min(1, 'Ajoutez au moins une variante'),
});

export type ProduitInput = z.infer<typeof produitSchema>;
export type VarianteInput = z.infer<typeof varianteSchema>;
export type ProduitCompletInput = z.infer<typeof produitCompletSchema>;
// ============================================
// Schéma pour la modification d'un produit
// ============================================
export const varianteEditSchema = z.object({
  id: z.string().uuid().optional(), // présent si variante existante
  pointure: z.number().min(15).max(60),
  couleur: z.string().min(1, 'Couleur requise'),
  prix_vente: z.number().min(0),
  prix_achat: z.number().min(0).optional(),
  code_barre: z.string().optional().or(z.literal('')),
  stock_initial: z.number().min(0).optional(), // pour les nouvelles uniquement
});

export const produitEditSchema = produitSchema.extend({
  variantes: z.array(varianteEditSchema).min(1, 'Ajoutez au moins une variante'),
});

export type VarianteEditInput = z.infer<typeof varianteEditSchema>;
export type ProduitEditInput = z.infer<typeof produitEditSchema>;
