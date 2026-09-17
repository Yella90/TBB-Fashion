'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  Pencil,
  Trash2,
  MoreHorizontal,
  Power,
} from 'lucide-react';

import type { ProduitAvecVariantes } from '@/types/produit';
import { CATEGORIES } from '@/types/produit';
import {
  supprimerProduit,
  toggleActifProduit,
} from '@/lib/services/produits.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function FicheProduitEntete({
  produit,
}: {
  produit: ProduitAvecVariantes;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const categorieLabel =
    CATEGORIES.find((c) => c.value === produit.categorie)?.label ??
    produit.categorie;

  const handleSupprimer = () => {
    confirm({
      title: 'Supprimer ce produit ?',
      description: `« ${produit.nom} » et ses ${produit.variantes.length} variante(s) seront définitivement supprimés.`,
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await supprimerProduit(produit.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success('Produit supprimé');
        router.push('/produits');
        router.refresh();
      },
    });
  };

  const handleToggleActif = () => {
    confirm({
      title: produit.actif ? 'Désactiver ce produit ?' : 'Activer ce produit ?',
      description: produit.actif
        ? 'Le produit n\'apparaîtra plus dans les ventes, mais les données seront conservées.'
        : 'Le produit redeviendra disponible à la vente.',
      confirmLabel: produit.actif ? 'Désactiver' : 'Activer',
      onConfirm: async () => {
        const res = await toggleActifProduit(produit.id, !produit.actif);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(produit.actif ? 'Produit désactivé' : 'Produit activé');
        router.refresh();
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Fil d'ariane + retour */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/produits"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Produits
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{produit.nom}</span>
      </div>

      {/* En-tête principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl gradient-tbb text-white shadow-md">
            <Package className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {produit.nom}
              </h1>
              <Badge
                className={
                  produit.actif
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                }
              >
                {produit.actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="font-mono">{produit.reference}</span>
              {produit.marque && (
                <>
                  <span className="text-border">•</span>
                  <span>{produit.marque}</span>
                </>
              )}
              <span className="text-border">•</span>
              <span>{categorieLabel}</span>
              {produit.type && (
                <>
                  <span className="text-border">•</span>
                  <span className="capitalize">{produit.type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActif}
            className="gap-1.5 hidden sm:flex"
          >
            <Power className="h-4 w-4" />
            {produit.actif ? 'Désactiver' : 'Activer'}
          </Button>

          <Button size="sm" asChild className="gap-1.5 flex-1 sm:flex-initial">
            <Link href={`/produits/${produit.id}/modifier`}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleToggleActif}
                className="cursor-pointer sm:hidden"
              >
                <Power className="mr-2 h-4 w-4" />
                {produit.actif ? 'Désactiver' : 'Activer'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onClick={handleSupprimer}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}