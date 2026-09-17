'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Eye,
  ShoppingBag,
  Calendar,
  XCircle,
} from 'lucide-react';

import type { Achat } from '@/types/achat';
import { STATUTS_ACHAT } from '@/types/achat';
import { formatCurrency } from '@/lib/utils/format-currency';
import { annulerAchat } from '@/lib/services/achats.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TableauAchats({ achats }: { achats: Achat[] }) {
  const router = useRouter();
  const confirm = useConfirm();

  const handleAnnuler = (achat: Achat) => {
    confirm({
      title: 'Annuler cet achat ?',
      description: `L'achat ${achat.reference} sera marqué comme annulé et le stock sera réduit.`,
      confirmLabel: 'Annuler l\'achat',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await annulerAchat(achat.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success('Achat annulé', {
          description: 'Le stock a été réduit.',
        });
        router.refresh();
      },
    });
  };

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
              <TableHead>Référence</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achats.map((a) => {
              const statut =
                STATUTS_ACHAT.find((s) => s.value === a.statut) ??
                STATUTS_ACHAT[0];
              return (
                <TableRow key={a.id} className="hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">
                    {a.reference}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.fournisseur_id ? 'Fournisseur' : 'Direct'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(a.date_achat)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(a.total)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(a.montant_paye)}
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
                            href={`/achats/${a.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le détail
                          </Link>
                        </DropdownMenuItem>
                        {a.statut !== 'annule' && (
                          <DropdownMenuItem
                            onClick={() => handleAnnuler(a)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler l&apos;achat
                          </DropdownMenuItem>
                        )}
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
        {achats.map((a) => {
          const statut =
            STATUTS_ACHAT.find((s) => s.value === a.statut) ?? STATUTS_ACHAT[0];
          return (
            <div
              key={a.id}
              className="rounded-xl border bg-card p-4 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-mono truncate">
                        {a.reference}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.date_achat)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/achats/${a.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        {a.statut !== 'annule' && (
                          <DropdownMenuItem
                            onClick={() => handleAnnuler(a)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Badge className={`text-[10px] ${statut.className}`}>
                      {statut.label}
                    </Badge>
                    <p className="text-sm font-bold">
                      {formatCurrency(a.total)}
                    </p>
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