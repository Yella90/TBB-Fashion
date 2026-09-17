'use client';

import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  ShoppingCart,
  Calendar,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { Vente } from '@/types/vente';
import { STATUTS_VENTE } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import { annulerVente } from '@/lib/services/ventes.actions';
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

export function TableauVentes({ ventes }: { ventes: Vente[] }) {
  const router = useRouter();
  const confirm = useConfirm();

  const handleAnnuler = (vente: Vente) => {
    confirm({
      title: 'Annuler cette vente ?',
      description: `La vente ${vente.reference} sera marquée comme annulée et le stock sera restauré.`,
      confirmLabel: 'Annuler la vente',
      cancelLabel: 'Retour',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await annulerVente(vente.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success('Vente annulée', {
          description: 'Le stock a été restauré.',
        });
        router.refresh();
      },
    });
  };

  const getStatutConfig = (statut: string) =>
    STATUTS_VENTE.find((s) => s.value === statut) ?? STATUTS_VENTE[0];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventes.map((v) => {
              const config = getStatutConfig(v.statut);
              return (
                <TableRow key={v.id} className="hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">{v.reference}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.client_id ? 'Client enregistré' : 'Passage'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(v.date_vente)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(v.total)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(v.montant_paye)}
                  </TableCell>
                  <TableCell>
                    <Badge className={config.className}>{config.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/ventes/${v.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le détail
                          </Link>
                        </DropdownMenuItem>
                        {v.statut !== 'annulee' && (
                          <DropdownMenuItem
                            onClick={() => handleAnnuler(v)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler la vente
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

      <div className="grid gap-3 md:hidden">
        {ventes.map((v) => {
          const config = getStatutConfig(v.statut);
          return (
            <div
              key={v.id}
              className="rounded-xl border bg-card p-4 transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-mono truncate">
                        {v.reference}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(v.date_vente)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/ventes/${v.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        {v.statut !== 'annulee' && (
                          <DropdownMenuItem
                            onClick={() => handleAnnuler(v)}
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
                    <Badge className={`text-[10px] ${config.className}`}>
                      {config.label}
                    </Badge>
                    <p className="text-sm font-bold">{formatCurrency(v.total)}</p>
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