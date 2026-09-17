'use client';

import Link from 'next/link';
import {
  HandCoins,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';

import type { PaiementAvecDetails } from '@/types/paiement';
import { MODES_PAIEMENT_GLOBAL } from '@/types/paiement';
import { formatCurrency } from '@/lib/utils/format-currency';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function TableauPaiements({
  paiements,
}: {
  paiements: PaiementAvecDetails[];
}) {
  const getModeConfig = (mode: string) =>
    MODES_PAIEMENT_GLOBAL.find((m) => m.value === mode) ??
    MODES_PAIEMENT_GLOBAL[0];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const nomClient = (p: PaiementAvecDetails) =>
    p.client
      ? [p.client.nom, p.client.prenom].filter(Boolean).join(' ')
      : 'Client de passage';

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Vente</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paiements.map((p) => {
              const mode = getModeConfig(p.mode);
              return (
                <TableRow key={p.id} className="hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">
                    {p.reference}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{nomClient(p)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.vente ? (
                      <Link
                        href={`/ventes/${p.vente.id}`}
                        className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {p.vente.reference}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(p.date_paiement)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${mode.className}`}>
                      {mode.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(p.montant)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {paiements.map((p) => {
          const mode = getModeConfig(p.mode);
          return (
            <div
              key={p.id}
              className="rounded-xl border bg-card p-4 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <HandCoins className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-mono truncate">
                        {p.reference}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {nomClient(p)}
                      </p>
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${mode.className}`}>
                      {mode.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.date_paiement)}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    {p.vente ? (
                      <Link
                        href={`/ventes/${p.vente.id}`}
                        className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 truncate"
                      >
                        {p.vente.reference}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      + {formatCurrency(p.montant)}
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