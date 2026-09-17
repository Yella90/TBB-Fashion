'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Shield,
  Phone,
  Mail,
  Power,
  PowerOff,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';

import { ROLES, type Utilisateur } from '@/types/utilisateur';
import { toggleActifUtilisateur } from '@/lib/services/utilisateurs.actions';
import { useConfirm } from '@/components/ui/confirm-provider';
import { ModalModifier } from '@/components/utilisateurs/modal-modifier';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(nom: string) {
  const parts = nom.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TableauUtilisateurs({
  utilisateurs,
  utilisateurActuelId,
}: {
  utilisateurs: Utilisateur[];
  utilisateurActuelId: string | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [utilisateurASelectionne, setUtilisateurASelectionne] =
    useState<Utilisateur | null>(null);

  const handleModifier = (u: Utilisateur) => {
    setUtilisateurASelectionne(u);
    setModalOpen(true);
  };

  const handleToggle = (u: Utilisateur) => {
    confirm({
      title: u.actif ? 'Désactiver ce compte ?' : 'Activer ce compte ?',
      description: u.actif
        ? `${u.nom} ne pourra plus se connecter.`
        : `${u.nom} pourra à nouveau se connecter.`,
      onConfirm: async () => {
        const res = await toggleActifUtilisateur(u.id, !u.actif);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success(u.actif ? 'Compte désactivé' : 'Compte activé');
        router.refresh();
      },
    });
  };

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilisateurs.map((u) => {
              const roleConfig =
                ROLES.find((r) => r.value === u.role) ?? ROLES[2];
              const isMe = u.id === utilisateurActuelId;

              return (
                <TableRow key={u.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="gradient-tbb text-white text-xs font-semibold">
                          {getInitials(u.nom)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate flex items-center gap-2">
                          {u.nom}
                          {isMe && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] h-4 px-1.5"
                            >
                              Vous
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.telephone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        {u.telephone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${roleConfig.className}`}>
                      <Shield className="h-3 w-3" />
                      {roleConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.actif
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0'
                      }
                    >
                      {u.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleModifier(u)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        {!isMe && (
                          <DropdownMenuItem
                            onClick={() => handleToggle(u)}
                            className="cursor-pointer"
                          >
                            {u.actif ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activer
                              </>
                            )}
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

      {/* Modal global, contrôlé par l'état */}
      <ModalModifier
        utilisateur={utilisateurASelectionne}
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setUtilisateurASelectionne(null);
        }}
      />
    </>
  );
}