import { notFound } from 'next/navigation';

import {
  getParametresBoutique,
  PARAMETRES_DEFAUT,
} from '@/lib/services/parametres.service';
import {
  getVueResultat,
  getVueTresorerie,
  getEvolutionSolde,
  listerTransactions,
} from '@/lib/services/finances.service';
import { OngletsFinances } from '@/components/finances/onglets-finances';
import type { ParametresBoutique } from '@/types/parametres';

export const metadata = { title: 'Finances · TBB Fashion' };

export default async function FinancesPage() {
  const params = await getParametresBoutique();

  if (!params) notFound();

  const merged = {
    ...PARAMETRES_DEFAUT,
    ...params,
  } as ParametresBoutique;

  const periode = merged.finance_periode_defaut ?? 'mois';

  // Charger toutes les données en parallèle
  const [
    resultat,
    tresorerie,
    evolutionResultat,
    evolutionTresorerie,
    transactions,
  ] = await Promise.all([
    getVueResultat(periode),
    getVueTresorerie(periode),
    getEvolutionSolde(periode, 'resultat'),
    getEvolutionSolde(periode, 'tresorerie'),
    listerTransactions({ limite: 30 }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <OngletsFinances
        parametres={merged}
        periodeInitiale={periode}
        resultatInitial={resultat}
        tresorerieInitiale={tresorerie}
        evolutionResultat={evolutionResultat}
        evolutionTresorerie={evolutionTresorerie}
        transactions={transactions}
      />
    </div>
  );
}