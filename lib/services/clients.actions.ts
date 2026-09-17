'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { clientSchema, type ClientInput } from '@/lib/validations/client.schema';

export async function creerClient(input: ClientInput) {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      nom: data.nom,
      prenom: data.prenom || null,
      telephone: data.telephone || null,
      email: data.email || null,
      adresse: data.adresse || null,
      ville: data.ville || null,
      date_naissance: data.date_naissance || null,
      genre: data.genre || null,
      notes: data.notes || null,
      actif: true,
    })
    .select()
    .single();

  if (error || !client) {
    return { success: false, error: error?.message ?? 'Erreur' };
  }

  revalidatePath('/clients');
  return { success: true, clientId: client.id };
}

export async function modifierClient(id: string, input: ClientInput) {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from('clients')
    .update({
      nom: data.nom,
      prenom: data.prenom || null,
      telephone: data.telephone || null,
      email: data.email || null,
      adresse: data.adresse || null,
      ville: data.ville || null,
      date_naissance: data.date_naissance || null,
      genre: data.genre || null,
      notes: data.notes || null,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return { success: true };
}

export async function supprimerClient(id: string) {
  const supabase = await createClient();

  // Vérifier si le client a des ventes
  const { count } = await supabase
    .from('ventes')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id);

  if (count && count > 0) {
    // Désactiver au lieu de supprimer
    const { error } = await supabase
      .from('clients')
      .update({ actif: false })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/clients');
    return {
      success: true,
      message: 'Client désactivé (il a des ventes enregistrées)',
    };
  }

  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/clients');
  return { success: true };
}

export async function toggleActifClient(id: string, actif: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('clients')
    .update({ actif })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/clients');
  return { success: true };
}
// ============================================
// Paiement d'une dette
// ============================================
export async function payerDette(
  detteId: string,
  montant: number,
  mode: string,
  notes?: string
) {
  if (montant <= 0) {
    return { success: false, error: 'Le montant doit être positif.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: dette } = await supabase
    .from('dettes')
    .select('id, client_id, montant_restant, montant_initial')
    .eq('id', detteId)
    .single();

  if (!dette) return { success: false, error: 'Dette introuvable.' };

  if (montant > dette.montant_restant) {
    return {
      success: false,
      error: `Le montant dépasse le reste (${dette.montant_restant} FCFA).`,
    };
  }

  const nouveauRestant = dette.montant_restant - montant;
  const nouveauStatut =
    nouveauRestant === 0 ? 'payee' : nouveauRestant < dette.montant_initial ? 'partielle' : 'impayee';

  // Créer un paiement
  const reference = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const { error: errP } = await supabase.from('paiements').insert({
    reference,
    client_id: dette.client_id,
    montant,
    mode,
    notes: notes || null,
    utilisateur_id: user?.id ?? null,
  });

  if (errP) return { success: false, error: errP.message };

  // Mettre à jour la dette
  const { error: errD } = await supabase
    .from('dettes')
    .update({
      montant_restant: nouveauRestant,
      statut: nouveauStatut,
    })
    .eq('id', detteId);

  if (errD) return { success: false, error: errD.message };

  // Mettre à jour le client
  const { data: client } = await supabase
    .from('clients')
    .select('total_dettes')
    .eq('id', dette.client_id)
    .single();

  if (client) {
    await supabase
      .from('clients')
      .update({
        total_dettes: Math.max((client.total_dettes ?? 0) - montant, 0),
      })
      .eq('id', dette.client_id);
  }

  revalidatePath('/clients');
  revalidatePath(`/clients/${dette.client_id}`);
  revalidatePath('/tableau-de-bord');

  return { success: true };
}
