import { createClient } from '@/lib/supabase/server';
import type { PaiementAvecDetails } from '@/types/paiement';

export async function listerPaiements(options?: {
  recherche?: string;
  mode?: string;
  dateDebut?: string;
  dateFin?: string;
  limite?: number;
}): Promise<PaiementAvecDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('paiements')
    .select(
      `
      *,
      client:clients (id, nom, prenom, telephone),
      vente:ventes (id, reference, total),
      utilisateur:utilisateurs (id, nom)
    `
    )
    .order('date_paiement', { ascending: false });

  if (options?.mode) query = query.eq('mode', options.mode);
  if (options?.dateDebut) query = query.gte('date_paiement', options.dateDebut);
  if (options?.dateFin) query = query.lte('date_paiement', options.dateFin);
  if (options?.recherche) {
    query = query.ilike('reference', `%${options.recherche}%`);
  }
  if (options?.limite) query = query.limit(options.limite);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as PaiementAvecDetails[];
}

export async function getStatsPaiements() {
  const supabase = await createClient();

  const aujourdhui = new Date().toISOString().split('T')[0];

  const { data: paiementsJour } = await supabase
    .from('paiements')
    .select('montant, mode')
    .gte('date_paiement', `${aujourdhui}T00:00:00`);

  const totalJour =
    paiementsJour?.reduce((s, p) => s + (p.montant ?? 0), 0) ?? 0;
  const nbJour = paiementsJour?.length ?? 0;

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { data: paiementsMois } = await supabase
    .from('paiements')
    .select('montant, mode')
    .gte('date_paiement', debutMois.toISOString());

  const totalMois =
    paiementsMois?.reduce((s, p) => s + (p.montant ?? 0), 0) ?? 0;
  const nbMois = paiementsMois?.length ?? 0;

  const parMode: Record<string, { montant: number; nombre: number }> = {};
  (paiementsMois ?? []).forEach((p) => {
    const mode = p.mode ?? 'autre';
    if (!parMode[mode]) parMode[mode] = { montant: 0, nombre: 0 };
    parMode[mode].montant += p.montant ?? 0;
    parMode[mode].nombre += 1;
  });

  return {
    totalJour,
    nbJour,
    totalMois,
    nbMois,
    parMode,
  };
}