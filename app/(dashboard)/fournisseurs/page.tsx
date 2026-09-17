import Link from 'next/link';
import { Truck, Plus, TrendingUp, Wallet } from 'lucide-react';

import {
  listerFournisseurs,
  getStatsFournisseurs,
} from '@/lib/services/fournisseurs.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauFournisseurs } from '@/components/fournisseurs/tableau-fournisseurs';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Fournisseurs · TBB Fashion' };

export default async function FournisseursPage() {
  const [fournisseurs, stats] = await Promise.all([
    listerFournisseurs({ limite: 200, actifSeulement: false }),
    getStatsFournisseurs(),
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Fournisseurs
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Répertoire et historique des approvisionnements
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/fournisseurs/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau fournisseur
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3">
        <StatCard
          label="Fournisseurs actifs"
          value={String(stats.total)}
          icon={<Truck className="h-5 w-5" />}
          description="dans le répertoire"
        />
        <StatCard
          label="Total achats"
          value={formatCurrency(stats.totalAchats, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description="cumulés"
        />
        <StatCard
          label="Reste à payer"
          value={formatCurrency(stats.resteDu, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description={stats.resteDu > 0 ? 'à régler' : 'tout est réglé'}
        />
      </div>

      {/* Liste */}
      {fournisseurs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun fournisseur pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez votre premier fournisseur pour commencer.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/fournisseurs/nouveau">
              <Plus className="h-4 w-4" />
              Ajouter un fournisseur
            </Link>
          </Button>
        </div>
      ) : (
        <TableauFournisseurs fournisseurs={fournisseurs} />
      )}
    </div>
  );
}