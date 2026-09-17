import Link from 'next/link';
import { Trophy, Star, ArrowUpRight } from 'lucide-react';

import type { ClientFidele } from '@/types/fidelite';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

function getInitials(nom: string, prenom: string | null) {
  const parts = [nom, prenom].filter(Boolean).join(' ').trim();
  if (!parts) return '??';
  const words = parts.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TopClientsFideles({
  clients,
  valeurPoint,
}: {
  clients: ClientFidele[];
  valeurPoint: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top clients fideles
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Classement par points accumules
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients" className="gap-1">
              Voir tout
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="mt-3 text-sm font-medium">
              Aucun client fidele pour le moment
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les clients gagnent des points automatiquement lors des ventes.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {clients.map((c, i) => {
              const nom = [c.nom, c.prenom].filter(Boolean).join(' ');
              const medaille =
                i === 0
                  ? 'bg-amber-400 text-amber-900'
                  : i === 1
                    ? 'bg-gray-300 text-gray-700'
                    : i === 2
                      ? 'bg-orange-400 text-orange-900'
                      : null;
              return (
                <li key={c.id}>
                  <Link
                    href={`/clients/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-tbb text-white text-xs font-semibold">
                          {getInitials(c.nom, c.prenom)}
                        </AvatarFallback>
                      </Avatar>
                      {medaille && (
                        <span
                          className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${medaille}`}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.nb_visites} visite{c.nb_visites > 1 ? 's' : ''} -{' '}
                        {formatCurrency(c.total_achats, { compact: true })}{' '}
                        d&apos;achats
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0 gap-1">
                        <Star className="h-2.5 w-2.5" />
                        {c.points_fidelite} pts
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatCurrency(c.points_fidelite * valeurPoint, {
                          compact: true,
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}