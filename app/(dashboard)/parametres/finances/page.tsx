import { notFound } from 'next/navigation';
import {
  getParametresBoutique,
  PARAMETRES_DEFAUT,
} from '@/lib/services/parametres.service';
import { FormulaireFinances } from '@/components/parametres/formulaire-finances';
import type { ParametresBoutique } from '@/types/parametres';

export const metadata = { title: 'Finances · Paramètres · TBB Fashion' };

export default async function ParametresFinancesPage() {
  const params = await getParametresBoutique();

  if (!params) notFound();

  // Fusionner avec les défauts au cas où certaines colonnes seraient null
  const merged = {
    ...PARAMETRES_DEFAUT,
    ...params,
  } as ParametresBoutique;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireFinances parametres={merged} />
    </div>
  );
}