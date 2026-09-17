import { FormulaireClient } from '@/components/clients/formulaire-client';

export const metadata = { title: 'Nouveau client · TBB Fashion' };

export default function NouveauClientPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireClient />
    </div>
  );
}