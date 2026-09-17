import Link from 'next/link';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Alerte = {
  variante_id: string;
  produit_nom: string;
  pointure: number;
  couleur: string;
  quantite: number;
  seuil: number;
};

export function AlertesStock({ alertes }: { alertes: Alerte[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Alertes stock
          </CardTitle>
          <CardDescription className="text-xs">
            Variantes sous le seuil
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/stock" className="gap-1">
            Voir stock
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {alertes.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              ✅ Aucune alerte — stock sain
            </li>
          )}
          {alertes.slice(0, 5).map((a) => (
            <li
              key={a.variante_id}
              className="flex items-center gap-3 px-6 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.produit_nom}</p>
                <p className="text-xs text-muted-foreground">
                  Pointure {a.pointure} · {a.couleur}
                </p>
              </div>
              <Badge
                className={
                  a.quantite === 0
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0'
                }
              >
                {a.quantite} / {a.seuil}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}