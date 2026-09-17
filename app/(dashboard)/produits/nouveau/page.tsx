import { FormulaireProduit } from '@/components/produits/formulaire-produit';

export const metadata = { title: 'Nouveau produit · TBB Fashion' };

export default function NouveauProduitPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-2 sm:px-4">
      <FormulaireProduit />
    </div>
  );
}