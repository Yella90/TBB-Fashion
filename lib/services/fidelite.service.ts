import { createClient } from '@/lib/supabase/server';
import type {
  MouvementFideliteAvecDetails,
  ClientFidele,
} from '@/types/fidelite';

export async function listerMouvements(options?: {
  type?: string;
  clientId?: string;
  dateDebut?: string;
  dateFin?: string;
  limite?: number;
}): Promise<MouvementFideliteAvecDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('fidelite_mouvements')
    .select(
      `
      *,
      client:clients (id, nom, prenom, telephone),
      vente:ventes (id, reference)
    `
    )
    .order('created_at', { ascending: false });

  if (options?.type) query = query.eq('type', options.type);
  if (options?.clientId) query = query.eq('client_id', options.clientId);
  if (options?.dateDebut) query = query.gte('created_at', options.dateDebut);
  if (options?.dateFin) query = query.lte('created_at', options.dateFin);
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MouvementFideliteAvecDetails[];
}

export async function listerTopClientsFideles(
  limite = 20
): Promise<ClientFidele[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select(
      'id, nom, prenom, telephone, email, points_fidelite, total_achats, solde_avoir'
    )
    .eq('actif', true)
    .gt('points_fidelite', 0)
    .order('points_fidelite', { ascending: false })
    .limit(limite);

  if (error) throw new Error(error.message);

  // Compter les ventes par client
  const clients = (data ?? []) as any[];
  const clientIds = clients.map((c) => c.id);

  if (clientIds.length === 0) return [];

  const { data: ventes } = await supabase
    .from('ventes')
    .select('client_id')
    .in('client_id', clientIds)
    .neq('statut', 'annulee');

  const ventesMap: Record<string, number> = {};
  (ventes ?? []).forEach((v: any) => {
    ventesMap[v.client_id] = (ventesMap[v.client_id] ?? 0) + 1;
  });

  return clients.map((c) => ({
    ...c,
    nb_visites: ventesMap[c.id] ?? 0,
  })) as ClientFidele[];
}

export async function getStatsFidelite() {
  const supabase = await createClient();

  // Total points en circulation
  const { data: clients } = await supabase
    .from('clients')
    .select('points_fidelite, solde_avoir')
    .eq('actif', true);

  const pointsCirculation =
    clients?.reduce((s, c) => s + (c.points_fidelite ?? 0), 0) ?? 0;
  const totalAvoirs =
    clients?.reduce((s, c) => s + (c.solde_avoir ?? 0), 0) ?? 0;
  const nbClientsFideles =
    clients?.filter((c) => (c.points_fidelite ?? 0) > 0).length ?? 0;

  // Mouvements du mois
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { data: mouvementsMois } = await supabase
    .from('fidelite_mouvements')
    .select('points, type')
    .gte('created_at', debutMois.toISOString());

  const gainsMois =
    mouvementsMois
      ?.filter((m) => m.type === 'gain' && m.points > 0)
      .reduce((s, m) => s + m.points, 0) ?? 0;

  const utilisationsMois =
    mouvementsMois
      ?.filter((m) => m.type === 'utilisation')
      .reduce((s, m) => s + Math.abs(m.points), 0) ?? 0;

  // Paramètres
  const { data: params } = await supabase
    .from('parametres_boutique')
    .select('points_fidelite_par_1000, valeur_point_fidelite')
    .eq('id', 1)
    .single();

  const pointsPar1000 = params?.points_fidelite_par_1000 ?? 1;
  const valeurPoint = params?.valeur_point_fidelite ?? 100;

  return {
    pointsCirculation,
    totalAvoirs,
    nbClientsFideles,
    gainsMois,
    utilisationsMois,
    pointsPar1000,
    valeurPoint,
    valeurTotale: pointsCirculation * valeurPoint,
  };
}