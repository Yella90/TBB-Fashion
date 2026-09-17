import Link from 'next/link';
import {
  HandCoins,
  Wallet,
  TrendingUp,
  Calendar,
  Plus,
} from 'lucide-react';

import {
  listerPaiements,
  getStatsPaiements,
} from '@/lib/services/paiements.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauPaiements } from '@/components/paiements/tableau-paiements';
import { RepartitionModes } from '@/components/paiements/repartition-modes';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Paiements · TBB Fashion' };

export default async function PaiementsPage() {
  const [paiements, stats] = await Promise.all([
    listerPaiements({ limite: 200 }),
    getStatsPaiements(),
  ]);

  const formatDateLong = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <HandCoins className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Paiements
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Historique global des encaissements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Encaissements du jour"
          value={formatCurrency(stats.totalJour, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description={`${stats.nbJour} paiement${stats.nbJour > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Encaissements du mois"
          value={formatCurrency(stats.totalMois, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`${stats.nbMois} paiement${stats.nbMois > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Moyenne / paiement"
          value={formatCurrency(
            stats.nbMois > 0 ? stats.totalMois / stats.nbMois : 0,
            { compact: true }
          )}
          icon={<Wallet className="h-5 w-5" />}
          description="ce mois"
        />
        <StatCard
          label="Total historique"
          value={String(paiements.length)}
          icon={<Calendar className="h-5 w-5" />}
          description="paiements enregistrés"
        />
      </div>

      {/* Contenu */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Liste */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Historique des paiements
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {paiements.length} paiement
                    {paiements.length > 1 ? 's' : ''} récent
                    {paiements.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paiements.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <HandCoins className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">
                    Aucun paiement enregistré
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                    Les paiements apparaissent automatiquement lors des
                    encaissements de ventes.
                  </p>
                  <Button asChild className="mt-4 gap-1">
                    <Link href="/ventes/nouvelle">
                      <Plus className="h-4 w-4" />
                      Nouvelle vente
                    </Link>
                  </Button>
                </div>
              ) : (
                <TableauPaiements paiements={paiements} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Répartition */}
        <div className="space-y-4">
          <RepartitionModes
            parMode={stats.parMode}
            totalMois={stats.totalMois}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cette page regroupe tous les encaissements de la boutique :
                <strong className="text-foreground"> paiements de ventes</strong> et
                <strong className="text-foreground"> paiements de dettes</strong>.
                Chaque paiement est tracé avec son mode et son utilisateur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}