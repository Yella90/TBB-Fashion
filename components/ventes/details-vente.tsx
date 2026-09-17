import {
  User,
  Phone,
  MapPin,
  Receipt,
  DollarSign,
  Package,
  Calendar,
  CreditCard,
} from 'lucide-react';

import type { VenteAvecDetails } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DetailsVente({ vente }: { vente: VenteAvecDetails }) {
  const clientNom = vente.client
    ? [vente.client.nom, vente.client.prenom].filter(Boolean).join(' ')
    : 'Client de passage';

  const modePaiementLabels: Record<string, string> = {
    especes: 'Espèces',
    mobile_money: 'Mobile Money',
    carte: 'Carte',
    virement: 'Virement',
    credit: 'Crédit',
    mixte: 'Mixte',
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Colonne gauche */}
      <div className="lg:col-span-2 space-y-4">
        {/* Articles */}
        <Card>
          <CardHeader className="pb-3 bg-secondary/30 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Articles ({vente.lignes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop */}
            <div className="hidden md:block divide-y">
              {vente.lignes.map((ligne) => (
                <div
                  key={ligne.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-xs font-bold">
                    {ligne.variante?.pointure ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {ligne.variante?.produit?.nom ?? 'Produit'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ligne.variante?.couleur} · {formatCurrency(ligne.prix_unitaire)} × {ligne.quantite}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(ligne.sous_total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {vente.lignes.map((ligne) => (
                <div key={ligne.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-sm font-bold">
                      {ligne.variante?.pointure ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ligne.variante?.produit?.nom ?? 'Produit'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ligne.variante?.couleur}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {formatCurrency(ligne.sous_total)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(ligne.prix_unitaire)} × {ligne.quantite}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {vente.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {vente.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Colonne droite */}
      <div className="space-y-4">
        {/* Client */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">{clientNom}</p>
            {vente.client?.telephone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {vente.client.telephone}
              </p>
            )}
            {!vente.client && (
              <p className="text-xs text-muted-foreground italic">
                Aucun client enregistré
              </p>
            )}
          </CardContent>
        </Card>

        {/* Paiement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatCurrency(vente.sous_total)}</span>
            </div>
            {vente.remise > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remise</span>
                <span className="text-red-600 dark:text-red-400">
                  - {formatCurrency(vente.remise)}
                </span>
              </div>
            )}
            {vente.tva > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatCurrency(vente.tva)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">
                {formatCurrency(vente.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payé</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(vente.montant_paye)}
              </span>
            </div>
            {vente.reste_a_payer > 0 && (
              <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Reste à payer</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(vente.reste_a_payer)}
                </span>
              </div>
            )}
            {vente.mode_paiement && (
              <div className="flex items-center justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" />
                  Mode
                </span>
                <Badge variant="secondary" className="font-normal">
                  {modePaiementLabels[vente.mode_paiement] ?? vente.mode_paiement}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infos supplémentaires */}
        {vente.points_fidelite_gagnes && vente.points_fidelite_gagnes > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Fidélité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Points gagnés par le client
              </p>
              <p className="text-lg font-bold text-primary">
                +{vente.points_fidelite_gagnes} points
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}