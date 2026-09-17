'use client';

import Link from 'next/link';
import {
  Star,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  User,
} from 'lucide-react';

import type { MouvementFideliteAvecDetails } from '@/types/fidelite';
import { TYPES_MOUVEMENT_FIDELITE } from '@/types/fidelite';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function TableauMouvements({
  mouvements,
}: {
  mouvements: MouvementFideliteAvecDetails[];
}) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getTypeConfig = (type: string) =>
    TYPES_MOUVEMENT_FIDELITE.find((t) => t.value === type) ??
    TYPES_MOUVEMENT_FIDELITE[0];

  const nomClient = (m: MouvementFideliteAvecDetails) =>
    m.client
      ? [m.client.nom, m.client.prenom].filter(Boolean).join(' ')
      : 'Client supprime';

  return (
    <>
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mouvements.map((m) => {
              const config = getTypeConfig(m.type);
              const isPositive = m.points > 0;
              return (
                <TableRow key={m.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <Link
                      href={`/clients/${m.client_id}`}
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{nomClient(m)}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${config.className}`}>
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {m.vente ? (
                      <Link
                        href={`/ventes/${m.vente.id}`}
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {m.vente.reference}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      m.description ?? '—'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(m.created_at)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {m.points}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {mouvements.map((m) => {
          const config = getTypeConfig(m.type);
          const isPositive = m.points > 0;
          return (
            <div
              key={m.id}
              className="rounded-xl border bg-card p-4 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isPositive
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/clients/${m.client_id}`}
                      className="text-sm font-medium truncate hover:text-primary"
                    >
                      {nomClient(m)}
                    </Link>
                    <Badge className={`text-[10px] shrink-0 ${config.className}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {formatDate(m.created_at)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {m.vente ? (
                      <Link
                        href={`/ventes/${m.vente.id}`}
                        className="text-xs font-mono text-primary hover:underline truncate"
                      >
                        {m.vente.reference}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground truncate">
                        {m.description ?? '—'}
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold shrink-0 ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {m.points}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}