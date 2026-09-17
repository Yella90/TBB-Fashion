import { notFound } from 'next/navigation';
import {
  getParametresBoutique,
  PARAMETRES_DEFAUT,
} from '@/lib/services/parametres.service';
import { FormulaireBoutique } from '@/components/parametres/formulaire-boutique';
import type { ParametresBoutique } from '@/types/parametres';

export const metadata = { title: 'Boutique · Paramètres · TBB Fashion' };

export default async function ParametresBoutiquePage() {
  const params = await getParametresBoutique();

  if (!params) notFound();

  const merged = {
    ...PARAMETRES_DEFAUT,
    ...params,
  } as ParametresBoutique;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireBoutique parametres={merged} />
    </div>
  );
}