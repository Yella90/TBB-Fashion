import { createClient } from '@/lib/supabase/server';
import type { Client, ClientAvecHistorique } from '@/types/client';

export async function listerClients(options?: {
  recherche?: string;
  limite?: number;
  actifSeulement?: boolean;
}): Promise<Client[]> {
  const supabase = await createClient();

  let query = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.actifSeulement !== false) {
    query = query.eq('actif', true);
  }

  if (options?.recherche) {
    query = query.or(
      `nom.ilike.%${options.recherche}%,prenom.ilike.%${options.recherche}%,telephone.ilike.%${options.recherche}%,email.ilike.%${options.recherche}%`
    );
  }

  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getClient(
  id: string
): Promise<ClientAvecHistorique | null> {
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) return null;

  const [ventesRes, dettesRes, paiementsRes, fideliteRes] = await Promise.all([
    supabase
      .from('ventes')
      .select('id, reference, total, statut, date_vente')
      .eq('client_id', id)
      .order('date_vente', { ascending: false })
      .limit(20),
    supabase
      .from('dettes')
      .select(
        'id, montant_initial, montant_restant, statut, date_echeance, created_at'
      )
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('paiements')
      .select('id, reference, montant, mode, date_paiement')
      .eq('client_id', id)
      .order('date_paiement', { ascending: false })
      .limit(20),
    supabase
      .from('fidelite_mouvements')
      .select('id, points, type, description, vente_id, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return {
    ...client,
    ventes: ventesRes.data ?? [],
    dettes: dettesRes.data ?? [],
    paiements: paiementsRes.data ?? [],
    fidelite: fideliteRes.data ?? [],
  };
}

export async function getStatsClients() {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('actif', true);

  const { data: clients } = await supabase
    .from('clients')
    .select('total_dettes, points_fidelite, solde_avoir');

  const totalDettes =
    clients?.reduce((s, c) => s + (c.total_dettes ?? 0), 0) ?? 0;

  const totalPoints =
    clients?.reduce((s, c) => s + (c.points_fidelite ?? 0), 0) ?? 0;

  const totalAvoirs =
    clients?.reduce((s, c) => s + (c.solde_avoir ?? 0), 0) ?? 0;

  const { data: fideles } = await supabase
    .from('clients')
    .select('id')
    .gt('points_fidelite', 0);

  return {
    total: total ?? 0,
    totalDettes,
    totalPoints,
    totalAvoirs,
    nbFideles: fideles?.length ?? 0,
  };
}