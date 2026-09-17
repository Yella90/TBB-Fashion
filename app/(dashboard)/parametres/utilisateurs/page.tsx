import Link from 'next/link';
import { ArrowLeft, Users, Shield, UserCheck, UserX, UserCog } from 'lucide-react';

import {
  listerUtilisateurs,
  getStatsUtilisateurs,
  getUtilisateurActuel,
} from '@/lib/services/utilisateurs.service';
import { TableauUtilisateurs } from '@/components/utilisateurs/tableau-utilisateurs';
import { ModalInvitation } from '@/components/utilisateurs/modal-invitation';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Utilisateurs · TBB Fashion' };

export default async function ParametresUtilisateursPage() {
  const [utilisateurs, stats, actuel] = await Promise.all([
    listerUtilisateurs(),
    getStatsUtilisateurs(),
    getUtilisateurActuel(),
  ]);

  const isAdmin = actuel?.role === 'admin';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 shrink-0 mt-0.5"
          >
            <Link href="/parametres">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
              Utilisateurs
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
              Gérez les comptes et les rôles de votre équipe
            </p>
          </div>
        </div>
        {isAdmin && <ModalInvitation />}
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 flex items-start gap-2">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Seul un administrateur peut inviter ou modifier des utilisateurs.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total comptes"
          value={String(stats.total)}
          icon={<Users className="h-5 w-5" />}
          description={`${stats.actifs} actifs`}
        />
        <StatCard
          label="Administrateurs"
          value={String(stats.admins)}
          icon={<Shield className="h-5 w-5" />}
          description="accès complet"
        />
        <StatCard
          label="Gérants"
          value={String(stats.gerants)}
          icon={<UserCog className="h-5 w-5" />}
          description="gestion"
        />
        <StatCard
          label="Vendeurs"
          value={String(stats.vendeurs)}
          icon={<UserCheck className="h-5 w-5" />}
          description="vente uniquement"
        />
      </div>

      {/* Tableau */}
      <TableauUtilisateurs
        utilisateurs={utilisateurs}
        utilisateurActuelId={actuel?.id ?? null}
      />
    </div>
  );
}