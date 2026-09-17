import Link from 'next/link';
import { Trophy, ArrowUpRight, User } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils/format-currency';
import type { TopClient } from '@/types/rapport';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TopClients({ clients }: { clients: TopClient[] }) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Meilleurs clients
            </CardTitle>
            <CardDescription className="text-xs">
              Classement par chiffre d&apos;affaires
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
            <User className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="mt-3 text-sm font-medium">
              Aucun client sur cette période
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {clients.map((c, i) => (
              <li key={c.client_id}>
                <Link
                  href={`/clients/${c.client_id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-tbb text-white text-xs font-semibold">
                        {getInitials(c.nom)}
                      </AvatarFallback>
                    </Avatar>
                    {i < 3 && (
                      <span
                        className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${
                          i === 0
                            ? 'bg-amber-400 text-amber-900'
                            : i === 1
                              ? 'bg-gray-300 text-gray-700'
                              : 'bg-orange-400 text-orange-900'
                        }`}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.commandes} commande{c.commandes > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatCurrency(c.total, { compact: true })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}