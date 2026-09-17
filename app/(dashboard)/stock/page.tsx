import Link from 'next/link';
import {
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingDown,
  ListFilter,
} from 'lucide-react';

import { listerStock, getStatsStock } from '@/lib/services/stock.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauStock } from '@/components/stock/tableau-stock';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Stock · TBB Fashion' };

export default async function StockPage() {
  const [variantes, stats] = await Promise.all([
    listerStock({ limite: 500 }),
    getStatsStock(),
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Stock
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Vue d&apos;ensemble de votre inventaire
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/stock/mouvements">
              <ListFilter className="h-4 w-4" />
              Mouvements
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/stock/alertes">
              <AlertTriangle className="h-4 w-4" />
              Alertes
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-1.5">
            <Link href="/stock/inventaire">
              <Package className="h-4 w-4" />
              Inventaire
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Paires en stock"
          value={stats.totalPaires.toLocaleString('fr-FR')}
          icon={<Boxes className="h-5 w-5" />}
          description={`${stats.totalVariantes} variantes`}
        />
        <StatCard
          label="Valeur du stock"
          value={formatCurrency(stats.valeurStock, { compact: true })}
          icon={<DollarSign className="h-5 w-5" />}
          description="prix d'achat"
        />
        <StatCard
          label="Stock faible"
          value={String(stats.enAlerte)}
          icon={<TrendingDown className="h-5 w-5" />}
          description="variantes en alerte"
        />
        <StatCard
          label="Ruptures"
          value={String(stats.enRupture)}
          icon={<XCircle className="h-5 w-5" />}
          description="à réapprovisionner"
        />
      </div>

      {/* Liste */}
      {variantes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Boxes className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun stock à afficher
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez des produits et variantes pour commencer.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Inventaire complet
                </CardTitle>
                <CardDescription className="text-xs">
                  {variantes.length} variante{variantes.length > 1 ? 's' : ''} active{variantes.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TableauStock variantes={variantes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}