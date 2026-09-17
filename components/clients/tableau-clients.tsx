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
  User,
  Phone,
  Mail,
  MapPin,
  Star,
} from 'lucide-react';

import type { Client } from '@/types/client';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  supprimerClient,
  toggleActifClient,
} from '@/lib/services/clients.actions';
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

function getInitials(client: Client) {
  const parts = [client.nom, client.prenom].filter(Boolean).join(' ').trim();
  if (!parts) return '??';
  const words = parts.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TableauClients({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSupprimer = (client: Client) => {
    confirm({
      title: `Supprimer ${client.nom} ?`,
      description:
        'Si le client a des ventes enregistrées, il sera désactivé au lieu d’être supprimé.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        setLoading(client.id);
        const res = await supprimerClient(client.id);
        setLoading(null);

        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }

        toast.success(res.message ?? 'Client supprimé');
        router.refresh();
      },
    });
  };

  const handleToggle = (client: Client) => {
    confirm({
      title: client.actif ? 'Désactiver ce client ?' : 'Activer ce client ?',
      description: client.actif
        ? 'Le client n’apparaîtra plus dans les sélections.'
        : 'Le client redeviendra disponible.',
      onConfirm: async () => {
        const res = await toggleActifClient(client.id, !client.actif);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(client.actif ? 'Client désactivé' : 'Client activé');
        router.refresh();
      },
    });
  };

  const nomComplet = (c: Client) =>
    [c.nom, c.prenom].filter(Boolean).join(' ');

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Total achats</TableHead>
              <TableHead className="text-right">Dettes</TableHead>
              <TableHead className="text-center">Fidélité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-tbb text-white text-xs font-bold">
                      {getInitials(c)}
                    </div>
                    <span className="font-medium">{nomComplet(c)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    {c.telephone && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {c.telephone}
                      </p>
                    )}
                    {c.email && (
                      <p className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[180px]">
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </p>
                    )}
                    {!c.telephone && !c.email && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(c.total_achats)}
                </TableCell>
                <TableCell className="text-right">
                  {c.total_dettes > 0 ? (
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {formatCurrency(c.total_dettes)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {c.points_fidelite > 0 ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 font-normal"
                    >
                      <Star className="h-3 w-3 text-amber-500" />
                      {c.points_fidelite}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      c.actif
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                    }
                  >
                    {c.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={loading === c.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/clients/${c.id}`}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir la fiche
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/clients/${c.id}/modifier`}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggle(c)}
                        className="cursor-pointer"
                      >
                        {c.actif ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSupprimer(c)}
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
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="rounded-xl border bg-card p-4 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-tbb text-white text-sm font-bold">
                {getInitials(c)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{nomComplet(c)}</p>
                    {c.telephone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {c.telephone}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      c.actif
                        ? 'text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 shrink-0'
                        : 'text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0 shrink-0'
                    }
                  >
                    {c.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Achats : <strong className="text-foreground">{formatCurrency(c.total_achats, { compact: true })}</strong>
                  </span>
                  {c.total_dettes > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Dette : {formatCurrency(c.total_dettes, { compact: true })}
                    </span>
                  )}
                </div>

                {c.points_fidelite > 0 && (
                  <div className="mt-1.5">
                    <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
                      <Star className="h-2.5 w-2.5 text-amber-500" />
                      {c.points_fidelite} points
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}