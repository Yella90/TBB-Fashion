import Link from 'next/link';
import { ArrowLeft, ListFilter, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

import { listerMouvements, getStatsStock } from '@/lib/services/stock.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TYPES_MOUVEMENT } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Mouvements de stock · TBB Fashion' };

export default async function MouvementsPage() {
  const mouvements = await listerMouvements({ limite: 200 });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
          <Link href="/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Mouvements de stock
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Historique complet des entrées, sorties et ajustements
          </p>
        </div>
      </div>

      {mouvements.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <ListFilter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun mouvement
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Les entrées/sorties apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Historique
            </CardTitle>
            <CardDescription className="text-xs">
              {mouvements.length} dernier{mouvements.length > 1 ? 's' : ''} mouvement{mouvements.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {mouvements.map((m) => {
                const config =
                  TYPES_MOUVEMENT.find((t) => t.value === m.type) ??
                  TYPES_MOUVEMENT[0];
                const isEntree = m.quantite > 0;
                return (
                  <li key={m.id} className="p-4 hover:bg-secondary/30">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isEntree
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isEntree ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {m.variante?.produit?.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P.{m.variante?.pointure} · {m.variante?.couleur}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`text-sm font-bold ${
                                isEntree
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {isEntree ? '+' : ''}
                              {m.quantite}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {m.quantite_avant} → {m.quantite_apres}
                            </p>
                          </div>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge className={`text-[10px] ${config.className}`}>
                            {config.label}
                          </Badge>
                          {m.motif && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {m.motif}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatDate(m.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}