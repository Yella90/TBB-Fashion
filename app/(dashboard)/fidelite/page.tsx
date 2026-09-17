import Link from 'next/link';
import {
  Star,
  Users,
  Gift,
  TrendingUp,
  Settings,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

import {
  listerMouvements,
  listerTopClientsFideles,
  getStatsFidelite,
} from '@/lib/services/fidelite.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { StatCard } from '@/components/dashboard/stat-card';
import { TableauMouvements } from '@/components/fidelite/tableau-mouvements';
import { TopClientsFideles } from '@/components/fidelite/top-clients-fideles';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export const metadata = { title: 'Fidélité · TBB Fashion' };

export default async function FidelitePage() {
  const [mouvements, topClients, stats] = await Promise.all([
    listerMouvements({ limite: 100 }),
    listerTopClientsFideles(20),
    getStatsFidelite(),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Fidélité
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Points, avoirs et récompenses clients
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
          <Link href="/parametres/boutique">
            <Settings className="h-4 w-4" />
            Configurer
          </Link>
        </Button>
      </div>

      {/* Info config */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3 flex items-start gap-2">
        <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 dark:text-blue-400">
          <p>
            Configuration actuelle :{' '}
            <strong>{stats.pointsPar1000} point(s) par 1 000 FCFA</strong>{' '}
            dépensés · 1 point ={' '}
            <strong>{formatCurrency(stats.valeurPoint)}</strong>
          </p>
          <p className="mt-1">
            Modifiable dans{' '}
            <Link
              href="/parametres/boutique"
              className="underline font-medium"
            >
              Paramètres → Boutique
            </Link>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Points en circulation"
          value={stats.pointsCirculation.toLocaleString('fr-FR')}
          icon={<Star className="h-5 w-5" />}
          description={`≈ ${formatCurrency(stats.valeurTotale, { compact: true })}`}
        />
        <StatCard
          label="Clients fidèles"
          value={String(stats.nbClientsFideles)}
          icon={<Users className="h-5 w-5" />}
          description="avec points > 0"
        />
        <StatCard
          label="Gains ce mois"
          value={stats.gainsMois.toLocaleString('fr-FR')}
          icon={<TrendingUp className="h-5 w-5" />}
          description="points distribués"
        />
        <StatCard
          label="Avoirs clients"
          value={formatCurrency(stats.totalAvoirs, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description="crédit disponible"
        />
      </div>

      {/* Onglets */}
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1">
          <TabsTrigger value="top" className="gap-1.5 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            Top clients
          </TabsTrigger>
          <TabsTrigger value="mouvements" className="gap-1.5 text-xs sm:text-sm">
            <Star className="h-4 w-4" />
            Historique
            {mouvements.length > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1">
                ({mouvements.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="mt-4">
          <TopClientsFideles
            clients={topClients}
            valeurPoint={stats.valeurPoint}
          />
        </TabsContent>

        <TabsContent value="mouvements" className="mt-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div>
                <CardTitle className="text-base font-semibold">
                  Historique des mouvements
                </CardTitle>
                <CardDescription className="text-xs">
                  {mouvements.length} mouvement
                  {mouvements.length > 1 ? 's' : ''} récent
                  {mouvements.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {mouvements.length === 0 ? (
                <div className="p-12 text-center">
                  <Star className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="mt-3 text-sm font-medium">
                    Aucun mouvement de fidélité
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Les gains apparaissent lors des ventes.
                  </p>
                </div>
              ) : (
                <TableauMouvements mouvements={mouvements} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}