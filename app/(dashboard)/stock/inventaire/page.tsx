import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { listerStock } from '@/lib/services/stock.service';
import { InventaireClient } from '@/components/stock/inventaire-client';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Inventaire · TBB Fashion' };

export default async function InventairePage() {
  const variantes = await listerStock({ limite: 1000 });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
          <Link href="/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Inventaire
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Ajustez les quantités réelles et validez en une seule fois
          </p>
        </div>
      </div>

      <InventaireClient variantes={variantes} />
    </div>
  );
}