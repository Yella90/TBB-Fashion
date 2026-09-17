import Link from 'next/link';
import { ShoppingBag, Plus, TrendingUp, Truck } from 'lucide-react';

import { listerAchats, getStatsAchats } from '@/lib/services/achats.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauAchats } from '@/components/achats/tableau-achats';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Achats · TBB Fashion' };

export default async function AchatsPage() {
  const [achats, stats] = await Promise.all([
    listerAchats({ limite: 100 }),
    getStatsAchats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Achats
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Approvisionnements fournisseurs
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/achats/nouvelle">
            <Plus className="h-4 w-4" />
            Nouvel achat
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3">
        <StatCard
          label="Achats du mois"
          value={formatCurrency(stats.totalMois, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`${stats.nbMois} achat${stats.nbMois > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Total achats"
          value={String(stats.total)}
          icon={<ShoppingBag className="h-5 w-5" />}
          description="depuis le début"
        />
        <StatCard
          label="Fournisseurs"
          value="—"
          icon={<Truck className="h-5 w-5" />}
          description="à venir"
        />
      </div>

      {achats.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun achat pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enregistrez votre premier approvisionnement.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/achats/nouvelle">
              <Plus className="h-4 w-4" />
              Nouvel achat
            </Link>
          </Button>
        </div>
      ) : (
        <TableauAchats achats={achats} />
      )}
    </div>
  );
}