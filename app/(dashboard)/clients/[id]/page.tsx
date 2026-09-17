import { notFound } from 'next/navigation';
import { getClient } from '@/lib/services/clients.service';
import { FicheClientEntete } from '@/components/clients/fiche-client-entete';
import { OngletsClient } from '@/components/clients/onglets-client';
import { formatCurrency } from '@/lib/utils/format-currency';
import { StatCard } from '@/components/dashboard/stat-card';
import { ShoppingCart, Wallet, Star, TrendingUp, Gift } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  const nom = client ? [client.nom, client.prenom].filter(Boolean).join(' ') : null;
  return {
    title: nom ? `${nom} · TBB Fashion` : 'Client · TBB Fashion',
  };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 lg:space-y-6">
      <FicheClientEntete client={client} />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total achats"
          value={formatCurrency(client.total_achats, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description="cumulés"
        />
        <StatCard
          label="Ventes"
          value={String(client.ventes.length)}
          icon={<ShoppingCart className="h-5 w-5" />}
          description="transactions"
        />
        <StatCard
          label="Dettes"
          value={formatCurrency(client.total_dettes, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description={
            client.total_dettes > 0 ? 'à recouvrer' : 'aucune dette'
          }
        />
        <StatCard
          label="Avoir"
          value={formatCurrency(client.solde_avoir, { compact: true })}
          icon={<Gift className="h-5 w-5" />}
          description={
            client.solde_avoir > 0 ? 'crédit disponible' : 'aucun avoir'
          }
        />
        <StatCard
          label="Points fidélité"
          value={String(client.points_fidelite)}
          icon={<Star className="h-5 w-5" />}
          description={`≈ ${formatCurrency(client.points_fidelite * 100, { compact: true })}`}
        />
      </div>

      <OngletsClient client={client} />
    </div>
  );
}