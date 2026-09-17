import { notFound } from 'next/navigation';
import { getProduit } from '@/lib/services/produits.service';
import { FormulaireModifierProduit } from '@/components/produits/formulaire-modifier-produit';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produit = await getProduit(id);
  return {
    title: produit
      ? `Modifier ${produit.nom} · TBB Fashion`
      : 'Modifier produit · TBB Fashion',
  };
}

export default async function ModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produit = await getProduit(id);

  if (!produit) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <FormulaireModifierProduit produit={produit} />
    </div>
  );
}