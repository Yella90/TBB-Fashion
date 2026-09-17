'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Pencil,
  Trash2,
  MoreHorizontal,
  Power,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Gift,
} from 'lucide-react';

import type { ClientAvecHistorique } from '@/types/client';
import {
  supprimerClient,
  toggleActifClient,
} from '@/lib/services/clients.actions';
import { useConfirm } from '@/components/ui/confirm-provider';
import { formatCurrency } from '@/lib/utils/format-currency';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(client: ClientAvecHistorique) {
  const parts = [client.nom, client.prenom].filter(Boolean).join(' ').trim();
  if (!parts) return '??';
  const words = parts.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function FicheClientEntete({ client }: { client: ClientAvecHistorique }) {
  const router = useRouter();
  const confirm = useConfirm();

  const nomComplet = [client.nom, client.prenom].filter(Boolean).join(' ');

  const handleSupprimer = () => {
    confirm({
      title: `Supprimer ${client.nom} ?`,
      description:
        'Si le client a des ventes enregistrées, il sera désactivé au lieu d’être supprimé.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await supprimerClient(client.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(res.message ?? 'Client supprimé');
        router.push('/clients');
        router.refresh();
      },
    });
  };

  const handleToggle = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/clients"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clients
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{nomComplet}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full gradient-tbb text-white text-lg sm:text-xl font-bold shadow-md">
            {getInitials(client)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {nomComplet}
              </h1>
              <Badge
                className={
                  client.actif
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                }
              >
                {client.actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              {client.telephone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {client.telephone}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </span>
              )}
              {client.ville && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.ville}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {client.total_dettes > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Dette : {formatCurrency(client.total_dettes)}
                </span>
              )}
              {client.solde_avoir > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  <Gift className="h-3.5 w-3.5" />
                  Avoir : {formatCurrency(client.solde_avoir)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" asChild className="gap-1.5 flex-1 sm:flex-initial">
            <Link href={`/clients/${client.id}/modifier`}>
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
                onClick={handleToggle}
                className="cursor-pointer"
              >
                <Power className="mr-2 h-4 w-4" />
                {client.actif ? 'Désactiver' : 'Activer'}
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