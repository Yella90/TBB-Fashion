'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function ajusterStockVariante(
  varianteId: string,
  nouvelleQuantite: number,
  motif: string
) {
  if (nouvelleQuantite < 0) {
    return { success: false, error: 'La quantité ne peut pas être négative.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stock } = await supabase
    .from('stock')
    .select('quantite')
    .eq('variante_id', varianteId)
    .single();

  const quantiteAvant = stock?.quantite ?? 0;
  const delta = nouvelleQuantite - quantiteAvant;

  if (delta === 0) {
    return { success: true };
  }

  const { error: errUp } = await supabase
    .from('stock')
    .update({ quantite: nouvelleQuantite, updated_at: new Date().toISOString() })
    .eq('variante_id', varianteId);

  if (errUp) return { success: false, error: errUp.message };

  await supabase.from('mouvements_stock').insert({
    variante_id: varianteId,
    type: 'ajustement',
    quantite: delta,
    quantite_avant: quantiteAvant,
    quantite_apres: nouvelleQuantite,
    motif: motif || 'Ajustement manuel',
    utilisateur_id: user?.id ?? null,
  });

  revalidatePath('/stock');
  revalidatePath('/stock/mouvements');
  revalidatePath('/stock/inventaire');
  revalidatePath('/produits');

  return { success: true };
}

export async function ajusterStockEnMasse(
  ajustements: { varianteId: string; nouvelleQuantite: number }[],
  motif: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let updated = 0;

  for (const a of ajustements) {
    if (a.nouvelleQuantite < 0) continue;

    const { data: stock } = await supabase
      .from('stock')
      .select('quantite')
      .eq('variante_id', a.varianteId)
      .single();

    const quantiteAvant = stock?.quantite ?? 0;
    if (quantiteAvant === a.nouvelleQuantite) continue;

    const delta = a.nouvelleQuantite - quantiteAvant;

    await supabase
      .from('stock')
      .update({ quantite: a.nouvelleQuantite })
      .eq('variante_id', a.varianteId);

    await supabase.from('mouvements_stock').insert({
      variante_id: a.varianteId,
      type: 'ajustement',
      quantite: delta,
      quantite_avant: quantiteAvant,
      quantite_apres: a.nouvelleQuantite,
      motif: motif || 'Inventaire',
      utilisateur_id: user?.id ?? null,
    });

    updated++;
  }

  revalidatePath('/stock');
  revalidatePath('/stock/mouvements');
  revalidatePath('/stock/inventaire');
  revalidatePath('/produits');

  return { success: true, count: updated };
}