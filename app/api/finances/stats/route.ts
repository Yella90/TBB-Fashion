import { NextResponse } from 'next/server';
import {
  getVueResultat,
  getVueTresorerie,
  getEvolutionSolde,
} from '@/lib/services/finances.service';
import type { PeriodeFinance } from '@/types/parametres';

const PERIODES: PeriodeFinance[] = [
  'jour',
  'semaine',
  'mois',
  'trimestre',
  'annee',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodeParam = searchParams.get('periode') ?? 'mois';
  const mode = searchParams.get('mode') ?? 'resultat';
  const inclureAchatsParam = searchParams.get('inclureAchats');

  const periode: PeriodeFinance = PERIODES.includes(
    periodeParam as PeriodeFinance
  )
    ? (periodeParam as PeriodeFinance)
    : 'mois';

  const inclureAchats =
    inclureAchatsParam === null ? undefined : inclureAchatsParam === 'true';

  const [resultat, tresorerie, evolutionResultat, evolutionTresorerie] =
    await Promise.all([
      getVueResultat(periode),
      getVueTresorerie(periode, inclureAchats),
      getEvolutionSolde(periode, 'resultat'),
      getEvolutionSolde(periode, 'tresorerie', inclureAchats),
    ]);

  return NextResponse.json({
    resultat,
    tresorerie,
    evolutionResultat,
    evolutionTresorerie,
    periode,
    mode,
  });
}