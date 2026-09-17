import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  Wallet,
  AlertCircle,
} from 'lucide-react';

import { listerVentes, getStatsVentes } from '@/lib/services/ventes.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauVentes } from '@/components/ventes/tableau-ventes';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/permissions/can';

export const metadata = { title: 'Ventes · TBB Fashion' };

export default async function VentesPage() {
  const [ventes, stats] = await Promise.all([
    listerVentes({ limite: 100 }),
    getStatsVentes(),
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Ventes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Historique et suivi de vos transactions
          </p>
        </div>
        <Can permission="vente:create">
          <Button asChild size="sm" className="gap-1.5 shrink-0">
            <Link href="/ventes/nouvelle">
              <Plus className="h-4 w-4" />
              Nouvelle vente
            </Link>
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="CA aujourd'hui"
          value={formatCurrency(stats.caJour, { compact: true })}
          icon={<ShoppingCart className="h-5 w-5" />}
          description={`${stats.nbJour} vente${stats.nbJour > 1 ? 's' : ''}`}
        />
        <StatCard
          label="CA ce mois"
          value={formatCurrency(stats.caMois, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`${stats.nbMois} vente${stats.nbMois > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Impayées"
          value={formatCurrency(stats.totalImpaye, { compact: true })}
          icon={<AlertCircle className="h-5 w-5" />}
          description={`${stats.nbImpayees} à recouvrer`}
        />
        <StatCard
          label="Panier moyen (jour)"
          value={formatCurrency(
            stats.nbJour > 0 ? stats.caJour / stats.nbJour : 0,
            { compact: true }
          )}
          icon={<Wallet className="h-5 w-5" />}
          description="aujourd'hui"
        />
      </div>

      {/* Liste */}
      {ventes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucune vente pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enregistrez votre première vente pour commencer.
          </p>
          <Can permission="vente:create">
            <Button asChild className="mt-4 gap-1">
              <Link href="/ventes/nouvelle">
                <Plus className="h-4 w-4" />
                Nouvelle vente
              </Link>
            </Button>
          </Can>
        </div>
      ) : (
        <TableauVentes ventes={ventes} />
      )}
    </div>
  );
}