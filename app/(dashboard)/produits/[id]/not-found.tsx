import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Package className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-xl font-bold tracking-tight">
        Produit introuvable
      </h1>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Ce produit n&apos;existe pas ou a été supprimé.
      </p>
      <Button asChild className="mt-5 gap-2">
        <Link href="/produits">
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
      </Button>
    </div>
  );
}