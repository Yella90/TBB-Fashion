'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Truck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

import type { Fournisseur } from '@/types/fournisseur';
import {
  supprimerFournisseur,
  toggleActifFournisseur,
} from '@/lib/services/fournisseurs.actions';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TableauFournisseurs({
  fournisseurs,
}: {
  fournisseurs: Fournisseur[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSupprimer = (f: Fournisseur) => {
    confirm({
      title: `Supprimer ${f.nom} ?`,
      description:
        'Si le fournisseur a des achats enregistrés, il sera désactivé au lieu d’être supprimé.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        setLoading(f.id);
        const res = await supprimerFournisseur(f.id);
        setLoading(null);

        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(res.message ?? 'Fournisseur supprimé');
        router.refresh();
      },
    });
  };

  const handleToggle = (f: Fournisseur) => {
    confirm({
      title: f.actif ? 'Désactiver ce fournisseur ?' : 'Activer ce fournisseur ?',
      description: f.actif
        ? 'Il n’apparaîtra plus dans les sélections d’achat.'
        : 'Il redeviendra disponible pour les achats.',
      onConfirm: async () => {
        const res = await toggleActifFournisseur(f.id, !f.actif);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(f.actif ? 'Fournisseur désactivé' : 'Fournisseur activé');
        router.refresh();
      },
    });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fournisseurs.map((f) => (
              <TableRow key={f.id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{f.nom}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    {f.contact_nom && (
                      <p className="font-medium text-foreground">{f.contact_nom}</p>
                    )}
                    {f.telephone && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {f.telephone}
                      </p>
                    )}
                    {f.email && (
                      <p className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[180px]">
                        <Mail className="h-3 w-3" />
                        {f.email}
                      </p>
                    )}
                    {!f.contact_nom && !f.telephone && !f.email && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {f.ville || f.pays ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {[f.ville, f.pays].filter(Boolean).join(', ')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      f.actif
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                    }
                  >
                    {f.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={loading === f.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/fournisseurs/${f.id}`}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir la fiche
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/fournisseurs/${f.id}/modifier`}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggle(f)}
                        className="cursor-pointer"
                      >
                        {f.actif ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSupprimer(f)}
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

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {fournisseurs.map((f) => (
          <Link
            key={f.id}
            href={`/fournisseurs/${f.id}`}
            className="rounded-xl border bg-card p-4 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{f.nom}</p>
                    {f.contact_nom && (
                      <p className="text-xs text-muted-foreground truncate">
                        {f.contact_nom}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      f.actif
                        ? 'text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 shrink-0'
                        : 'text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0 shrink-0'
                    }
                  >
                    {f.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {f.telephone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {f.telephone}
                    </span>
                  )}
                  {f.ville && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {f.ville}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}