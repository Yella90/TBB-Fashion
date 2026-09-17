'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  transactionSchema,
  caisseJourSchema,
  type TransactionInput,
  type CaisseJourInput,
} from '@/lib/validations/finance.schema';

export async function creerTransaction(input: TransactionInput) {
  const parsed = transactionSchema.safeParse(input);
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

  const { error } = await supabase.from('transactions_financieres').insert({
    type: data.type,
    categorie: data.categorie,
    montant: data.montant,
    description: data.description || null,
    mode_paiement: data.mode_paiement || null,
    date_transaction: data.date_transaction || new Date().toISOString(),
    utilisateur_id: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/finances');
  revalidatePath('/finances/revenus');
  revalidatePath('/finances/depenses');
  revalidatePath('/finances/caisse');
  revalidatePath('/tableau-de-bord');

  return { success: true };
}

export async function supprimerTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('transactions_financieres')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/finances');
  return { success: true };
}

// ============================================
// Caisse du jour
// ============================================
export async function ouvrirCaisse(fondOuverture: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const aujourdhui = new Date().toISOString().split('T')[0];

  const { data: existante } = await supabase
    .from('caisse')
    .select('id')
    .eq('date_jour', aujourdhui)
    .single();

  if (existante) {
    return { success: false, error: 'La caisse du jour est déjà ouverte.' };
  }

  const { error } = await supabase.from('caisse').insert({
    date_jour: aujourdhui,
    fond_ouverture: fondOuverture,
    entrees: 0,
    sorties: 0,
    solde_theorique: fondOuverture,
    utilisateur_id: user?.id ?? null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/finances/caisse');
  return { success: true };
}

export async function cloturerCaisse(input: CaisseJourInput) {
  const parsed = caisseJourSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const supabase = await createClient();
  const aujourdhui = new Date().toISOString().split('T')[0];

  const { data: caisse } = await supabase
    .from('caisse')
    .select('*')
    .eq('date_jour', aujourdhui)
    .single();

  if (!caisse) {
    return { success: false, error: 'Aucune caisse ouverte aujourd\'hui.' };
  }

  // Récupérer les ventes du jour en espèces
  const { data: ventesJour } = await supabase
    .from('ventes')
    .select('montant_paye, mode_paiement')
    .gte('date_vente', `${aujourdhui}T00:00:00`)
    .neq('statut', 'annulee');

  const entreesEspeces =
    ventesJour
      ?.filter(
        (v) => v.mode_paiement === 'especes' || v.mode_paiement === 'mixte'
      )
      .reduce((s, v) => s + (v.montant_paye ?? 0), 0) ?? 0;

  // Récupérer les revenus et dépenses du jour
  const { data: transJour } = await supabase
    .from('transactions_financieres')
    .select('type, montant')
    .gte('date_transaction', `${aujourdhui}T00:00:00`);

  const revenusJour =
    transJour
      ?.filter((t) => t.type === 'revenu')
      .reduce((s, t) => s + t.montant, 0) ?? 0;
  const depensesJour =
    transJour
      ?.filter((t) => t.type === 'depense')
      .reduce((s, t) => s + t.montant, 0) ?? 0;

  const entrees = entreesEspeces + revenusJour;
  const sorties = depensesJour;
  const soldeTheorique = caisse.fond_ouverture + entrees - sorties;
  const ecart = parsed.data.solde_reel - soldeTheorique;

  const { error } = await supabase
    .from('caisse')
    .update({
      entrees,
      sorties,
      solde_theorique: soldeTheorique,
      solde_reel: parsed.data.solde_reel,
      ecart,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', caisse.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/finances/caisse');
  return { success: true };
}