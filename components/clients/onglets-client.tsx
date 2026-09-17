'use client';

import Link from 'next/link';
import {
  ShoppingCart,
  Wallet,
  HandCoins,
  Star,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  TrendingUp,
} from 'lucide-react';

import type { ClientAvecHistorique } from '@/types/client';
import { TYPES_MOUVEMENT_FIDELITE } from '@/types/client';
import { formatCurrency } from '@/lib/utils/format-currency';
import { STATUTS_VENTE } from '@/types/vente';
import { ModalPaiementDette } from '@/components/clients/modal-paiement-dette';

import { Badge } from '@/components/ui/badge';
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

export function OngletsClient({ client }: { client: ClientAvecHistorique }) {
  const ventesEnCours = client.ventes.filter((v) => v.statut !== 'annulee');
  const dettesActives = client.dettes.filter(
    (d) => d.statut !== 'payee' && d.statut !== 'annulee'
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatDateHeure = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Tabs defaultValue="ventes" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-12 p-1">
        <TabsTrigger value="ventes" className="gap-1 text-xs">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Ventes</span>
          {ventesEnCours.length > 0 && (
            <Badge
              variant="secondary"
              className="h-4 px-1 text-[9px] font-bold ml-0.5"
            >
              {ventesEnCours.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="dettes" className="gap-1 text-xs">
          <Wallet className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Dettes</span>
          {dettesActives.length > 0 && (
            <Badge className="h-4 px-1 text-[9px] font-bold ml-0.5 bg-amber-500">
              {dettesActives.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="paiements" className="gap-1 text-xs">
          <HandCoins className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Paiements</span>
        </TabsTrigger>
        <TabsTrigger value="avoir" className="gap-1 text-xs">
          <Gift className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Avoir</span>
          {client.solde_avoir > 0 && (
            <Badge className="h-4 px-1 text-[9px] font-bold ml-0.5 bg-blue-500">
              ✓
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="fidelite" className="gap-1 text-xs">
          <Star className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Points</span>
        </TabsTrigger>
      </TabsList>

      {/* ============ VENTES ============ */}
      <TabsContent value="ventes" className="mt-4">
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Historique des ventes
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {client.ventes.length} vente{client.ventes.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button size="sm" asChild className="gap-1.5">
                <Link href={`/ventes/nouvelle?client=${client.id}`}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Nouvelle vente
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {client.ventes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucune vente enregistrée
              </div>
            ) : (
              <ul className="divide-y">
                {client.ventes.map((v) => {
                  const statut =
                    STATUTS_VENTE.find((s) => s.value === v.statut) ??
                    STATUTS_VENTE[0];
                  return (
                    <li key={v.id}>
                      <Link
                        href={`/ventes/${v.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold">
                          {v.reference.slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-medium truncate">
                            {v.reference}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateHeure(v.date_vente)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">
                            {formatCurrency(v.total)}
                          </p>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 h-5 mt-0.5 ${statut.className}`}
                          >
                            {statut.label}
                          </Badge>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ DETTES ============ */}
      <TabsContent value="dettes" className="mt-4">
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Dettes
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {dettesActives.length} dette{dettesActives.length > 1 ? 's' : ''} active{dettesActives.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {client.dettes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucune dette
              </div>
            ) : (
              <ul className="divide-y">
                {client.dettes.map((d) => {
                  const progress =
                    d.montant_initial > 0
                      ? ((d.montant_initial - d.montant_restant) /
                          d.montant_initial) *
                        100
                      : 0;
                  const isSoldee = d.statut === 'payee';
                  return (
                    <li key={d.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isSoldee ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                            <p className="text-sm font-medium">
                              {isSoldee ? 'Payée' : 'En cours'}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Créée le {formatDate(d.created_at)}
                            {d.date_echeance &&
                              ` · Échéance : ${formatDate(d.date_echeance)}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">
                            {formatCurrency(d.montant_restant)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            sur {formatCurrency(d.montant_initial)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isSoldee ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      {!isSoldee && (
                        <div className="mt-3 flex justify-end">
                          <ModalPaiementDette
                            detteId={d.id}
                            montantRestant={d.montant_restant}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ PAIEMENTS ============ */}
      <TabsContent value="paiements" className="mt-4">
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-primary" />
              Historique des paiements
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {client.paiements.length} paiement{client.paiements.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {client.paiements.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun paiement enregistré
              </div>
            ) : (
              <ul className="divide-y">
                {client.paiements.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <HandCoins className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium truncate">
                        {p.reference}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateHeure(p.date_paiement)} ·{' '}
                        <span className="capitalize">
                          {p.mode.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      + {formatCurrency(p.montant)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ AVOIR ============ */}
      <TabsContent value="avoir" className="mt-4 space-y-4">
        {/* Solde actuel */}
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Gift className="h-9 w-9" />
              </div>
              <p className="mt-3 text-sm font-semibold">Solde d&apos;avoir</p>
              <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(client.solde_avoir)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                Montant disponible que le client peut utiliser comme paiement
                sur une prochaine vente.
              </p>
              {client.solde_avoir > 0 && (
                <Button
                  size="sm"
                  asChild
                  className="mt-4 gap-1.5"
                >
                  <Link href={`/ventes/nouvelle?client=${client.id}`}>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Utiliser l&apos;avoir
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historique des mouvements d'avoir */}
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Mouvements d&apos;avoir
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Gains et utilisations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {client.fidelite.filter(
              (f) => f.type === 'gain' || f.type === 'utilisation'
            ).length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun mouvement d&apos;avoir
              </div>
            ) : (
              <ul className="divide-y">
                {client.fidelite
                  .filter((f) => f.type === 'gain' || f.type === 'utilisation')
                  .map((f) => {
                    const isGain = f.points > 0;
                    return (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isGain
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {isGain ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {f.description ?? 'Mouvement'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateHeure(f.created_at)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold shrink-0 ${
                            isGain
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {isGain ? '+' : ''}
                          {formatCurrency(f.points)}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ============ FIDÉLITÉ ============ */}
      <TabsContent value="fidelite" className="mt-4 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-tbb text-white shadow-lg">
                <span className="text-2xl font-bold">
                  {client.points_fidelite}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">Points de fidélité</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Les points sont gagnés automatiquement lors des ventes et
                retirés lors des retours.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Valeur estimée</p>
                  <p className="text-sm font-bold mt-1">
                    {formatCurrency(client.points_fidelite * 100)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total achats</p>
                  <p className="text-sm font-bold mt-1">
                    {formatCurrency(client.total_achats, { compact: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique des points */}
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Historique des points
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {client.fidelite.length} mouvement{client.fidelite.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {client.fidelite.filter(
              (f) => f.type === 'gain' || f.type === 'ajustement'
            ).length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun mouvement de points
              </div>
            ) : (
              <ul className="divide-y">
                {client.fidelite
                  .filter((f) => f.type === 'gain' || f.type === 'ajustement')
                  .map((f) => {
                    const config =
                      TYPES_MOUVEMENT_FIDELITE[f.type] ??
                      TYPES_MOUVEMENT_FIDELITE.ajustement;
                    const isPositive = f.points > 0;
                    return (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isPositive
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {f.description ?? 'Mouvement de points'}
                            </p>
                            <Badge className={`text-[9px] h-4 ${config.className}`}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateHeure(f.created_at)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold shrink-0 ${
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {f.points} pts
                        </p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}