'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  Pencil,
  Trash2,
  MoreHorizontal,
  Power,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

import type { FournisseurAvecHistorique } from '@/types/fournisseur';
import {
  supprimerFournisseur,
  toggleActifFournisseur,
} from '@/lib/services/fournisseurs.actions';
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

export function FicheFournisseurEntete({
  fournisseur,
}: {
  fournisseur: FournisseurAvecHistorique;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const handleSupprimer = () => {
    confirm({
      title: `Supprimer ${fournisseur.nom} ?`,
      description:
        'Si le fournisseur a des achats enregistrés, il sera désactivé au lieu d’être supprimé.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await supprimerFournisseur(fournisseur.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(res.message ?? 'Fournisseur supprimé');
        router.push('/fournisseurs');
        router.refresh();
      },
    });
  };

  const handleToggle = () => {
    confirm({
      title: fournisseur.actif
        ? 'Désactiver ce fournisseur ?'
        : 'Activer ce fournisseur ?',
      description: fournisseur.actif
        ? 'Il n’apparaîtra plus dans les sélections d’achat.'
        : 'Il redeviendra disponible pour les achats.',
      onConfirm: async () => {
        const res = await toggleActifFournisseur(
          fournisseur.id,
          !fournisseur.actif
        );
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(
          fournisseur.actif ? 'Fournisseur désactivé' : 'Fournisseur activé'
        );
        router.refresh();
      },
    });
  };

  const localisation = [fournisseur.ville, fournisseur.pays]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/fournisseurs"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Fournisseurs
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{fournisseur.nom}</span>
      </div>

      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl gradient-tbb text-white shadow-md">
            <Truck className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {fournisseur.nom}
              </h1>
              <Badge
                className={
                  fournisseur.actif
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                }
              >
                {fournisseur.actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {fournisseur.contact_nom && (
              <p className="mt-1 text-sm text-muted-foreground">
                Contact : {fournisseur.contact_nom}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              {fournisseur.telephone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {fournisseur.telephone}
                </span>
              )}
              {fournisseur.email && (
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Mail className="h-3.5 w-3.5" />
                  {fournisseur.email}
                </span>
              )}
              {localisation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {localisation}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button size="sm" asChild className="gap-1.5">
            <Link href={`/achats/nouvelle?fournisseur=${fournisseur.id}`}>
              <ShoppingBag className="h-4 w-4" />
              Nouvel achat
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/fournisseurs/${fournisseur.id}/modifier`}>
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
              <DropdownMenuItem onClick={handleToggle} className="cursor-pointer">
                <Power className="mr-2 h-4 w-4" />
                {fournisseur.actif ? 'Désactiver' : 'Activer'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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