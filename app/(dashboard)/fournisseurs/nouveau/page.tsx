import { FormulaireFournisseur } from '@/components/fournisseurs/formulaire-fournisseur';

export const metadata = { title: 'Nouveau fournisseur · TBB Fashion' };

export default function NouveauFournisseurPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireFournisseur />
    </div>
  );
}