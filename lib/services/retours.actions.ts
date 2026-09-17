'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { retourSchema, type RetourInput } from '@/lib/validations/retour.schema';

export async function creerRetour(input: RetourInput) {
  const parsed = retourSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: retourId, error } = await supabase.rpc('creer_retour', {
    p_vente_id: data.vente_id,
    p_client_id: data.client_id || null,
    p_motif: data.motif,
    p_description: data.description || null,
    p_type_remboursement: data.type_remboursement,
    p_montant_rembourse: data.montant_rembourse,
    p_utilisateur_id: user?.id ?? null,
    p_lignes: data.lignes.map((l) => ({
      variante_id: l.variante_id,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      sous_total: l.sous_total,
    })),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/retours');
  revalidatePath(`/ventes/${data.vente_id}`);
  revalidatePath('/produits');
  revalidatePath('/stock');
  revalidatePath('/finances');

  return { success: true, retourId };
}

export async function changerStatutRetour(
  id: string,
  statut: 'en_attente' | 'valide' | 'refuse' | 'termine'
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('retours')
    .update({ statut })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/retours');
  revalidatePath(`/retours/${id}`);
  return { success: true };
}