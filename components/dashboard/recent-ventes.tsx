import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format-currency';

type Vente = {
  id: string;
  reference: string;
  client_nom: string | null;
  total: number;
  statut: 'payee' | 'partielle' | 'impayee' | 'annulee';
  created_at: string;
};

const STATUT_CONFIG: Record<Vente['statut'], { label: string; className: string }> = {
  payee: { label: 'Payée', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  partielle: { label: 'Partielle', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  impayee: { label: 'Impayée', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
  annulee: { label: 'Annulée', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

export function RecentVentes({ ventes }: { ventes: Vente[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Ventes récentes</CardTitle>
          <CardDescription className="text-xs">
            Les dernières transactions
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ventes" className="gap-1">
            Voir tout
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {ventes.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              Aucune vente pour le moment
            </li>
          )}
          {ventes.map((v) => {
            const config = STATUT_CONFIG[v.statut];
            return (
              <li key={v.id}>
                <Link
                  href={`/ventes/${v.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                    {v.reference.slice(-3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {v.client_nom ?? 'Client de passage'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {v.reference} · {new Date(v.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatCurrency(v.total)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 h-5 mt-1 border-0 ${config.className}`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}