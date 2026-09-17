import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  XCircle,
  BarChart3,
  Info,
} from 'lucide-react';

import {
  getStatsVentes,
  getStatsBenefices,
  getVentesParJour,
  getTopProduits,
  getTopClients,
  getRepartitionCategories,
  getRepartitionPaiements,
  getStatsStockGlobal,
  getStatsFinancesGlobal,
} from '@/lib/services/rapports.service';
import { getParametresBoutique } from '@/lib/services/parametres.service';
import type { PeriodeRapport } from '@/types/rapport';
import { formatCurrency } from '@/lib/utils/format-currency';
import { StatCard } from '@/components/dashboard/stat-card';
import { SelecteurPeriode } from '@/components/rapports/selecteur-periode';
import { VentesChart } from '@/components/rapports/ventes-chart';
import { TopProduitsChart } from '@/components/rapports/top-produits-chart';
import { CategoriesChart } from '@/components/rapports/categories-chart';
import { PaiementsChart } from '@/components/rapports/paiements-chart';
import { TopClients } from '@/components/rapports/top-clients';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Rapports · TBB Fashion' };

const PERIODES_VALIDES: PeriodeRapport[] = [
  'jour',
  'semaine',
  'mois',
  'trimestre',
  'annee',
];

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const params = await searchParams;
  const parametres = await getParametresBoutique();

  // Période : URL > config > 'mois'
  const periodeDefaut =
    (parametres?.finance_periode_defaut as PeriodeRapport) ?? 'mois';

  const periode: PeriodeRapport = PERIODES_VALIDES.includes(
    params.periode as PeriodeRapport
  )
    ? (params.periode as PeriodeRapport)
    : periodeDefaut;

  const prorata = parametres?.finance_marge_credit === 'prorata';

  const [
    statsVentes,
    statsBenefices,
    ventesParJour,
    topProduits,
    topClients,
    categories,
    paiements,
    statsStock,
    statsFinances,
  ] = await Promise.all([
    getStatsVentes(periode),
    getStatsBenefices(periode),
    getVentesParJour(periode),
    getTopProduits(periode, 8),
    getTopClients(periode, 5),
    getRepartitionCategories(periode),
    getRepartitionPaiements(periode),
    getStatsStockGlobal(),
    getStatsFinancesGlobal(periode),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Rapports
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Analyses et statistiques de votre boutique
            </p>
          </div>
        </div>

        <SelecteurPeriode periodeActuelle={periode} />

        {prorata && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-2.5 flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Les bénéfices sont calculés <strong>au prorata</strong> des
              paiements (configuration financière active).
            </p>
          </div>
        )}
      </div>

      {/* Stats principales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          value={formatCurrency(statsVentes.total, { compact: true })}
          trend={statsVentes.variation}
          icon={<DollarSign className="h-5 w-5" />}
          description="vs période préc."
        />
        <StatCard
          label="Ventes"
          value={String(statsVentes.nombre)}
          icon={<ShoppingCart className="h-5 w-5" />}
          description={`Panier : ${formatCurrency(statsVentes.panierMoyen, { compact: true })}`}
        />
        <StatCard
          label="Bénéfice brut"
          value={formatCurrency(statsBenefices.beneficeBrut, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`Marge : ${statsBenefices.marge.toFixed(1)}%`}
        />
        <StatCard
          label="Cout marchandises"
          value={formatCurrency(statsBenefices.coutAchats, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description="prix d'achat"
        />
      </div>

      {/* Graphique évolution */}
      <VentesChart data={ventesParJour} />

      {/* Top produits + Catégories */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <TopProduitsChart data={topProduits} />
        <CategoriesChart data={categories} />
      </div>

      {/* Modes de paiement + Top clients */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <PaiementsChart data={paiements} />
        <TopClients clients={topClients} />
      </div>

      {/* Résumé stock + finances */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              État du stock
            </CardTitle>
            <CardDescription className="text-xs">
              Vue globale de l&apos;inventaire
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-medium">Paires en stock</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {statsStock.totalPaires.toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Valeur stock</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(statsStock.valeurStock, { compact: true })}
                </p>
              </div>

              <div className="rounded-lg border p-4 border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium">Stock faible</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
                  {statsStock.enAlerte}
                </p>
              </div>

              <div className="rounded-lg border p-4 border-red-200 dark:border-red-900">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Ruptures</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
                  {statsStock.enRupture}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Trésorerie
            </CardTitle>
            <CardDescription className="text-xs">
              Revenus et dépenses manuels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Revenus
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(statsFinances.revenus, { compact: true })}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  Dépenses
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(statsFinances.depenses, { compact: true })}
                </span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Solde</span>
                <span
                  className={`text-base font-bold ${
                    statsFinances.solde >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {statsFinances.solde >= 0 ? '+' : ''}
                  {formatCurrency(statsFinances.solde, { compact: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}