'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2, Eye, Package } from 'lucide-react';

import type { Produit } from '@/types/produit';
import { CATEGORIES } from '@/types/produit';
import { formatCurrency } from '@/lib/utils/format-currency';
import { supprimerProduit } from '@/lib/services/produits.actions';
import { useConfirm } from '@/components/ui/confirm-provider';
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

export function TableauProduits({ produits }: { produits: Produit[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSupprimer = (produit: Produit) => {
    confirm({
      title: 'Supprimer ce produit ?',
      description: `« ${produit.nom} » et toutes ses variantes seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        setLoading(produit.id);
        const res = await supprimerProduit(produit.id);
        setLoading(null);

        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }

        toast.success('Produit supprimé');
        router.refresh();
      },
    });
  };

  const getCategorieLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <>
      {/* Desktop : tableau */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Prix vente</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produits.map((p) => (
              <TableRow key={p.id} className="hover:bg-secondary/50">
                <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                <TableCell className="font-medium">{p.nom}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.marque ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {getCategorieLabel(p.categorie)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(p.prix_vente)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      p.actif
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                    }
                  >
                    {p.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={loading === p.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/produits/${p.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/produits/${p.id}/modifier`}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSupprimer(p)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile : cartes */}
      <div className="grid gap-3 md:hidden">
        {produits.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-card p-4 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.nom}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {p.reference}
                      {p.marque && ` · ${p.marque}`}
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
                        <Link href={`/produits/${p.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/produits/${p.id}/modifier`}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSupprimer(p)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {getCategorieLabel(p.categorie)}
                    </Badge>
                    <Badge
                      className={
                        p.actif
                          ? 'text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                          : 'text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                      }
                    >
                      {p.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(p.prix_vente)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}