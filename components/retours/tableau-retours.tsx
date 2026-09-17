'use client';

import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  RotateCcw,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';

import type { Retour } from '@/types/retour';
import { STATUTS_RETOUR } from '@/types/retour';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TableauRetours({ retours }: { retours: Retour[] }) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Vente</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Rembourse</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retours.map((r) => {
              const statut =
                STATUTS_RETOUR.find((s) => s.value === r.statut) ??
                STATUTS_RETOUR[0];
              return (
                <TableRow key={r.id} className="hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">
                    {r.reference}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.vente_id.slice(-8)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(r.date_retour)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {r.montant_rembourse > 0
                      ? formatCurrency(r.montant_rembourse)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-xs capitalize text-muted-foreground">
                    {r.type_remboursement?.replace('_', ' ') ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statut.className}>{statut.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/retours/${r.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le detail
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {retours.map((r) => {
          const statut =
            STATUTS_RETOUR.find((s) => s.value === r.statut) ??
            STATUTS_RETOUR[0];
          return (
            <Link
              key={r.id}
              href={`/retours/${r.id}`}
              className="rounded-xl border bg-card p-4 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold font-mono truncate">
                      {r.reference}
                    </p>
                    <Badge
                      className={`text-[10px] shrink-0 ${statut.className}`}
                    >
                      {statut.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {formatDate(r.date_retour)}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {r.type_remboursement?.replace('_', ' ') ?? '—'}
                    </span>
                    {r.montant_rembourse > 0 && (
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(r.montant_rembourse)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}