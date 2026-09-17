'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
} from 'lucide-react';

import type { Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/utils/format-currency';
import { supprimerTransaction } from '@/lib/services/finances.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TableauTransactions({
  transactions,
  compact = false,
}: {
  transactions: Transaction[];
  compact?: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const handleSupprimer = (t: Transaction) => {
    confirm({
      title: 'Supprimer cette transaction ?',
      description: `${t.categorie} · ${formatCurrency(t.montant)}`,
      confirmLabel: 'Supprimer',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await supprimerTransaction(t.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success('Transaction supprimée');
        router.refresh();
      },
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="mt-3 text-sm font-medium">Aucune transaction</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Les revenus et dépenses apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {transactions.map((t) => {
        const isRevenu = t.type === 'revenu';
        return (
          <li
            key={t.id}
            className={`flex items-center gap-3 ${compact ? 'px-4 py-2.5' : 'px-4 py-3'} hover:bg-secondary/30`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isRevenu
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              }`}
            >
              {isRevenu ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{t.categorie}</p>
                <Badge
                  variant="secondary"
                  className="text-[10px] shrink-0 font-normal"
                >
                  {isRevenu ? 'Revenu' : 'Dépense'}
                </Badge>
              </div>
              {t.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {t.description}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-2.5 w-2.5" />
                {formatDate(t.date_transaction)}
                {t.mode_paiement && ` · ${t.mode_paiement.replace('_', ' ')}`}
              </p>
            </div>
            <div className="text-right shrink-0 flex items-center gap-2">
              <p
                className={`text-sm font-bold ${
                  isRevenu
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isRevenu ? '+' : '-'} {formatCurrency(t.montant)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleSupprimer(t)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import { DollarSign } from 'lucide-react';