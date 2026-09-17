import { listerFournisseurs } from '@/lib/services/fournisseurs.service';
import { FormulaireAchat } from '@/components/achats/formulaire-achat';

export const metadata = { title: 'Nouvel achat · TBB Fashion' };

export default async function NouvelAchatPage() {
  const fournisseurs = await listerFournisseurs({ limite: 200 });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <FormulaireAchat fournisseurs={fournisseurs} />
    </div>
  );
}