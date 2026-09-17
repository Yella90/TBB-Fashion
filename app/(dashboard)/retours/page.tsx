import Link from 'next/link';
import { RotateCcw, Clock, DollarSign, TrendingDown } from 'lucide-react';

import {
  listerRetours,
  getStatsRetours,
} from '@/lib/services/retours.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauRetours } from '@/components/retours/tableau-retours';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Retours · TBB Fashion' };

export default async function RetoursPage() {
  const [retours, stats] = await Promise.all([
    listerRetours({ limite: 100 }),
    getStatsRetours(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Retours
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gerez les retours clients et les remboursements
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
          <Link href="/ventes">
            <RotateCcw className="h-4 w-4" />
            Depuis une vente
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3">
        <StatCard
          label="Retours ce mois"
          value={String(stats.nbMois)}
          icon={<RotateCcw className="h-5 w-5" />}
          description="transactions"
        />
        <StatCard
          label="Montant rembourse"
          value={formatCurrency(stats.totalMois, { compact: true })}
          icon={<DollarSign className="h-5 w-5" />}
          description="ce mois"
        />
        <StatCard
          label="En attente"
          value={String(stats.enAttente)}
          icon={<Clock className="h-5 w-5" />}
          description="a traiter"
        />
      </div>

      {retours.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <RotateCcw className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun retour pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Pour enregistrer un retour, ouvrez une vente et cliquez sur
            Retourner un article.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/ventes">
              <RotateCcw className="h-4 w-4" />
              Voir les ventes
            </Link>
          </Button>
        </div>
      ) : (
        <TableauRetours retours={retours} />
      )}
    </div>
  );
}