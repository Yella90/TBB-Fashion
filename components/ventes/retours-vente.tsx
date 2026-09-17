import Link from 'next/link';
import {
  RotateCcw,
  ArrowUpRight,
  Package,
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils/format-currency';
import { STATUTS_RETOUR, MOTIFS_RETOUR } from '@/types/retour';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type Retour = {
  id: string;
  reference: string;
  date_retour: string;
  motif: string;
  montant_rembourse: number;
  type_remboursement: string | null;
  statut: string;
  lignes: {
    id: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
    variante: {
      id: string;
      pointure: number;
      couleur: string;
      produit: {
        id: string;
        nom: string;
        marque: string | null;
      } | null;
    } | null;
  }[];
};

export function RetoursVente({ retours }: { retours: Retour[] }) {
  if (retours.length === 0) return null;

  const totalRembourse = retours.reduce(
    (s, r) => s + (r.montant_rembourse ?? 0),
    0
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Card>
      <CardHeader className="pb-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <RotateCcw className="h-4 w-4" />
              Retours ({retours.length})
            </CardTitle>
            <CardDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
              Total remboursé : {formatCurrency(totalRembourse)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {retours.map((r) => {
            const statutConfig =
              STATUTS_RETOUR.find((s) => s.value === r.statut) ??
              STATUTS_RETOUR[0];
            const motifLabel =
              MOTIFS_RETOUR.find((m) => m.value === r.motif)?.label ?? r.motif;

            return (
              <li key={r.id} className="p-4 hover:bg-secondary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/retours/${r.id}`}
                        className="text-sm font-mono font-medium text-primary hover:underline"
                      >
                        {r.reference}
                      </Link>
                      <Badge className={`text-[10px] ${statutConfig.className}`}>
                        {statutConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(r.date_retour)} · {motifLabel}
                    </p>

                    {/* Articles retournés */}
                    <ul className="mt-2 space-y-1">
                      {r.lignes.map((l) => (
                        <li
                          key={l.id}
                          className="text-xs text-muted-foreground flex items-center gap-2"
                        >
                          <Package className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {l.variante?.produit?.nom} · P.{l.variante?.pointure} ·{' '}
                            {l.variante?.couleur} × {l.quantite}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right shrink-0">
                    {r.montant_rembourse > 0 ? (
                      <>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          -{formatCurrency(r.montant_rembourse)}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {r.type_remboursement?.replace('_', ' ')}
                        </p>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Sans remboursement
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}