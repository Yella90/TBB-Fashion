import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import {
  getCaisseAujourdhui,
  listerCaisses,
} from '@/lib/services/finances.service';
import { CaisseClient } from '@/components/finances/caisse-client';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Caisse · TBB Fashion' };

export default async function CaissePage() {
  const [caisse, historique] = await Promise.all([
    getCaisseAujourdhui(),
    listerCaisses(30),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
          <Link href="/finances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Caisse
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Ouverture, suivi et clôture journalière
          </p>
        </div>
      </div>

      <CaisseClient caisse={caisse} historique={historique} />
    </div>
  );
}