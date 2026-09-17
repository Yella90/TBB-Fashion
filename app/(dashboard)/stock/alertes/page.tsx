import Link from 'next/link';
import { ArrowLeft, AlertTriangle, XCircle, Package } from 'lucide-react';

import { listerAlertes } from '@/lib/services/stock.service';
import { getStatutStock, STATUT_STOCK_CONFIG } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Alertes stock · TBB Fashion' };

export default async function AlertesPage() {
  const alertes = await listerAlertes();

  const ruptures = alertes.filter(
    (a) => (a.stock?.quantite ?? 0) === 0
  );
  const faibles = alertes.filter((a) => {
    const q = a.stock?.quantite ?? 0;
    return q > 0 && q <= (a.stock?.seuil_alerte ?? 5);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
          <Link href="/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Alertes stock
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            {alertes.length} variante{alertes.length > 1 ? 's' : ''} à surveiller
          </p>
        </div>
      </div>

      {alertes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold">Stock sain ✅</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aucune variante sous le seuil d&apos;alerte.
          </p>
        </div>
      ) : (
        <>
          {/* Ruptures */}
          {ruptures.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Ruptures ({ruptures.length})
                </CardTitle>
                <CardDescription className="text-xs text-red-600/80 dark:text-red-400/80">
                  Ces variantes n&apos;ont plus de stock
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {ruptures.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold">
                        {a.pointure}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {a.produit?.nom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.produit?.marque} · {a.couleur}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0 shrink-0">
                        0 / {a.stock?.seuil_alerte ?? 5}
                      </Badge>
                      <Button size="sm" variant="outline" asChild className="shrink-0">
                        <Link href={`/produits/${a.produit_id}`}>
                          Voir
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Stocks faibles */}
          {faibles.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900">
              <CardHeader className="pb-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Stocks faibles ({faibles.length})
                </CardTitle>
                <CardDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  Ces variantes sont proches de la rupture
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {faibles.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        {a.pointure}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {a.produit?.nom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.produit?.marque} · {a.couleur}
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0 shrink-0">
                        {a.stock?.quantite} / {a.stock?.seuil_alerte ?? 5}
                      </Badge>
                      <Button size="sm" variant="outline" asChild className="shrink-0">
                        <Link href={`/produits/${a.produit_id}`}>
                          Voir
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}