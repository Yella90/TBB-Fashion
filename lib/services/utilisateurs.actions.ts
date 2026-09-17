'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  invitationSchema,
  modifierUtilisateurSchema,
  type InvitationInput,
  type ModifierUtilisateurInput,
} from '@/lib/validations/utilisateur.schema';

// ============================================
// Inviter un nouvel utilisateur
// ============================================
export async function inviterUtilisateur(input: InvitationInput) {
  const parsed = invitationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const data = parsed.data;

  // Vérifier que l'appelant est admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  const { data: profile } = await supabase
    .from('utilisateurs')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return {
      success: false,
      error: 'Seul un administrateur peut inviter des utilisateurs.',
    };
  }

  // Créer l'utilisateur avec le client admin
  const admin = createAdminClient();

  const { data: created, error } = await admin.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    password: 'TempTBB2025!', // mot de passe temporaire
    user_metadata: {
      nom: data.nom,
      role: data.role,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Cet email est déjà utilisé.' };
    }
    return { success: false, error: error.message };
  }

  // Mettre à jour le téléphone si fourni (le trigger handle_new_user a déjà créé la ligne)
  if (data.telephone && created.user) {
    await admin
      .from('utilisateurs')
      .update({ telephone: data.telephone })
      .eq('id', created.user.id);
  }

  revalidatePath('/parametres/utilisateurs');
  return {
    success: true,
    userId: created.user?.id,
    motDePasseTemporaire: 'TempTBB2025!',
  };
}

// ============================================
// Modifier un utilisateur
// ============================================
export async function modifierUtilisateur(
  id: string,
  input: ModifierUtilisateurInput
) {
  const parsed = modifierUtilisateurSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Données invalides',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non authentifié' };

  const { data: profile } = await supabase
    .from('utilisateurs')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return {
      success: false,
      error: 'Seul un administrateur peut modifier les utilisateurs.',
    };
  }

  // Empêcher de se retirer soi-même le rôle admin
  if (id === user.id && parsed.data.role !== 'admin') {
    return {
      success: false,
      error: 'Vous ne pouvez pas retirer votre propre rôle admin.',
    };
  }

  const { error } = await supabase
    .from('utilisateurs')
    .update({
      nom: parsed.data.nom,
      telephone: parsed.data.telephone || null,
      role: parsed.data.role,
      actif: parsed.data.actif,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/parametres/utilisateurs');
  return { success: true };
}

// ============================================
// Basculer actif/inactif
// ============================================
export async function toggleActifUtilisateur(id: string, actif: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non authentifié' };

  if (id === user.id) {
    return {
      success: false,
      error: 'Vous ne pouvez pas désactiver votre propre compte.',
    };
  }

  const { error } = await supabase
    .from('utilisateurs')
    .update({ actif })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/parametres/utilisateurs');
  return { success: true };
}

// ============================================
// Réinitialiser le mot de passe
// ============================================
export async function reinitialiserMotDePasse(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/connexion`,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}