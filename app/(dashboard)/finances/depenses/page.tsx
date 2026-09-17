import Link from 'next/link';
import { ArrowLeft, TrendingDown } from 'lucide-react';

import { listerTransactions, getStatsFinances } from '@/lib/services/finances.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { TableauTransactions } from '@/components/finances/tableau-transactions';
import { ModalTransaction } from '@/components/finances/modal-transaction';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Dépenses · TBB Fashion' };

export default async function DepensesPage() {
  const [transactions, stats] = await Promise.all([
    listerTransactions({ type: 'depense', limite: 200 }),
    getStatsFinances(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
          <Link href="/finances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Historique de toutes vos dépenses
          </p>
        </div>
        <ModalTransaction
          typeParDefaut="depense"
          triggerLabel="Nouvelle dépense"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2">
        <StatCard
          label="Dépenses ce mois"
          value={formatCurrency(stats.totalDepenses, { compact: true })}
          icon={<TrendingDown className="h-5 w-5" />}
          description="cumulées"
        />
        <StatCard
          label="Bénéfice net"
          value={formatCurrency(Math.abs(stats.beneficeNet), { compact: true })}
          icon={<TrendingDown className="h-5 w-5" />}
          description={
            stats.beneficeNet >= 0 ? 'positif' : 'déficit'
          }
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Transactions ({transactions.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Détail des dépenses enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableauTransactions transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}