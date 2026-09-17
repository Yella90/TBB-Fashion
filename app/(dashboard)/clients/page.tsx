import Link from 'next/link';
import { Users, Plus, Wallet, Star, UserCheck } from 'lucide-react';

import { listerClients, getStatsClients } from '@/lib/services/clients.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauClients } from '@/components/clients/tableau-clients';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Clients · TBB Fashion' };

export default async function ClientsPage() {
  const [clients, stats] = await Promise.all([
    listerClients({ limite: 200, actifSeulement: false }),
    getStatsClients(),
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Clients
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Fichier client, dettes et fidélité
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/clients/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau client
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clients actifs"
          value={String(stats.total)}
          icon={<UserCheck className="h-5 w-5" />}
          description="dans le fichier"
        />
        <StatCard
          label="Dettes totales"
          value={formatCurrency(stats.totalDettes, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description="à recouvrer"
        />
        <StatCard
          label="Points fidélité"
          value={stats.totalPoints.toLocaleString('fr-FR')}
          icon={<Star className="h-5 w-5" />}
          description={`${stats.nbFideles} client${stats.nbFideles > 1 ? 's' : ''} fidèle${stats.nbFideles > 1 ? 's' : ''}`}
        />
        <StatCard
          label="Total clients"
          value={String(clients.length)}
          icon={<Users className="h-5 w-5" />}
          description="actifs + inactifs"
        />
      </div>

      {/* Liste */}
      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun client pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez votre premier client pour commencer.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/clients/nouveau">
              <Plus className="h-4 w-4" />
              Ajouter un client
            </Link>
          </Button>
        </div>
      ) : (
        <TableauClients clients={clients} />
      )}
    </div>
  );
}