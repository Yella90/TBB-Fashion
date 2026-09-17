import {
  ShoppingCart,
  Wallet,
  Users,
  Boxes,
  ArrowUpRight,
  BarChart3,
  Plus,
  Gift,
  HandCoins,
} from 'lucide-react';
import Link from 'next/link';

import {
  getStatsDashboard,
  getVentesParJour30j,
  getRepartitionCategoriesDashboard,
  getTopProduitsDashboard,
  getVentesRecentes,
  getAlertesStockDashboard,
  getTopClientsDashboard,
  getStatsSecondaires,
} from '@/lib/services/dashboard.service';
import { formatCurrency } from '@/lib/utils/format-currency';

import { StatCard } from '@/components/dashboard/stat-card';
import { VentesChart } from '@/components/dashboard/ventes-chart';
import { CategoriesChart } from '@/components/dashboard/categories-chart';
import { TopProduitsChart } from '@/components/dashboard/top-produits-chart';
import { RecentVentes } from '@/components/dashboard/recent-ventes';
import { AlertesStock } from '@/components/dashboard/alertes-stock';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const metadata = { title: 'Tableau de bord · TBB Fashion' };

export default async function TableauDeBordPage() {
  // Charger toutes les données en parallèle
  const [
    stats,
    ventes30j,
    categories,
    topProduits,
    recentes,
    alertes,
    topClients,
    secondaires,
  ] = await Promise.all([
    getStatsDashboard(),
    getVentesParJour30j(),
    getRepartitionCategoriesDashboard(),
    getTopProduitsDashboard(),
    getVentesRecentes(5),
    getAlertesStockDashboard(5),
    getTopClientsDashboard(4),
    getStatsSecondaires(),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Tableau de bord
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Bienvenue sur TBB Fashion 👟 · Voici votre activité
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 flex-1 sm:flex-initial"
          >
            <Link href="/rapports">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden xs:inline">Rapports</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-1.5 flex-1 sm:flex-initial">
            <Link href="/ventes/nouvelle">
              <Plus className="h-4 w-4" />
              <span>Nouvelle vente</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 StatCards principales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventes du mois"
          value={formatCurrency(stats.caMois, { compact: true })}
          trend={stats.variationCA}
          icon={<ShoppingCart className="h-5 w-5" />}
          description="vs mois dernier"
        />
        <StatCard
          label="Bénéfices du mois"
          value={formatCurrency(stats.beneficeMois, { compact: true })}
          trend={stats.variationBenefice}
          icon={<Wallet className="h-5 w-5" />}
          description="marge"
        />
        <StatCard
          label="Nouveaux clients"
          value={String(stats.nouveauxClients)}
          trend={stats.variationClients}
          icon={<Users className="h-5 w-5" />}
          description="ce mois"
        />
        <StatCard
          label="Articles en stock"
          value={stats.stockTotal.toLocaleString('fr-FR')}
          icon={<Boxes className="h-5 w-5" />}
          description={
            stats.alertes > 0 ? `${stats.alertes} alertes` : 'stock sain'
          }
        />
      </div>

      {/* Graphiques ligne 1 : Ventes + Catégories */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VentesChart data={ventes30j} />
        </div>
        {categories.length > 0 ? (
          <CategoriesChart data={categories} />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Répartition par catégorie
              </CardTitle>
              <CardDescription className="text-xs">
                Ventes par type de client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                Aucune vente ce mois
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top produits + Ventes récentes */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {topProduits.length > 0 ? (
          <TopProduitsChart data={topProduits} />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Top produits
              </CardTitle>
              <CardDescription className="text-xs">
                Ce mois-ci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                Aucune vente ce mois
              </div>
            </CardContent>
          </Card>
        )}
        <RecentVentes ventes={recentes} />
      </div>

      {/* Alertes + Top clients */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <AlertesStock alertes={alertes} />

        {topClients.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Meilleurs clients
                </CardTitle>
                <CardDescription className="text-xs">
                  Top {topClients.length} ce mois-ci
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients" className="gap-1">
                  Voir tout
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {topClients.map((client, index) => (
                  <li
                    key={client.nom}
                    className="flex items-center gap-3 px-6 py-3"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="gradient-tbb text-white text-xs font-semibold">
                          {getInitials(client.nom)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <span
                          className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${
                            index === 0
                              ? 'bg-amber-400 text-amber-900'
                              : index === 1
                                ? 'bg-gray-300 text-gray-700'
                                : 'bg-orange-400 text-orange-900'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {client.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.commandes} commande
                        {client.commandes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      {formatCurrency(client.total, { compact: true })}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Meilleurs clients
              </CardTitle>
              <CardDescription className="text-xs">
                Ce mois-ci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                Aucune vente nominative ce mois
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats secondaires */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          label="Panier moyen"
          value={formatCurrency(secondaires.panierMoyen, { compact: true })}
          description={`${secondaires.nbVentes} vente${secondaires.nbVentes > 1 ? 's' : ''} ce mois`}
        />
        <StatCard
          label="Dettes clients"
          value={formatCurrency(secondaires.totalDettes, { compact: true })}
          icon={<HandCoins className="h-5 w-5" />}
          description="à recouvrer"
        />
        <StatCard
          label="Points fidélité"
          value={secondaires.totalPoints.toLocaleString('fr-FR')}
          icon={<Gift className="h-5 w-5" />}
          description="en circulation"
        />
      </div>
    </div>
  );
}