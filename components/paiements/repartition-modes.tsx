import { HandCoins, Wallet, CreditCard, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const ICONES: Record<string, React.ElementType> = {
  especes: Wallet,
  mobile_money: HandCoins,
  carte: CreditCard,
  virement: Building2,
};

const LABELS: Record<string, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  carte: 'Carte',
  virement: 'Virement',
};

export function RepartitionModes({
  parMode,
  totalMois,
}: {
  parMode: Record<string, { montant: number; nombre: number }>;
  totalMois: number;
}) {
  const entrees = Object.entries(parMode).sort(
    (a, b) => b[1].montant - a[1].montant
  );

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Répartition par mode
        </CardTitle>
        <CardDescription className="text-xs">
          Ce mois-ci
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {entrees.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Aucun paiement ce mois
          </div>
        ) : (
          <ul className="space-y-3">
            {entrees.map(([mode, data]) => {
              const Icone = ICONES[mode] ?? Wallet;
              const pourcentage =
                totalMois > 0 ? (data.montant / totalMois) * 100 : 0;

              return (
                <li key={mode}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {LABELS[mode] ?? mode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({data.nombre})
                      </span>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatCurrency(data.montant, { compact: true })}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pourcentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                    {pourcentage.toFixed(1)}%
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}