import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Truck, Package } from 'lucide-react';

import { getAchat } from '@/lib/services/achats.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { STATUTS_ACHAT } from '@/types/achat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achat = await getAchat(id);
  return {
    title: achat ? `Achat ${achat.reference} · TBB Fashion` : 'Achat',
  };
}

export default async function AchatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achat = await getAchat(id);

  if (!achat) notFound();

  const statut =
    STATUTS_ACHAT.find((s) => s.value === achat.statut) ?? STATUTS_ACHAT[0];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/achats" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Achats
        </Link>
        <span>/</span>
        <span className="font-mono">{achat.reference}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-tbb text-white">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {achat.reference}
              </h1>
              <Badge className={statut.className}>{statut.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(achat.date_achat)}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              Total : {formatCurrency(achat.total)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achat.fournisseur ? (
              <>
                <p className="text-sm font-medium">{achat.fournisseur.nom}</p>
                {achat.fournisseur.contact_nom && (
                  <p className="text-xs text-muted-foreground">
                    {achat.fournisseur.contact_nom}
                  </p>
                )}
                {achat.fournisseur.telephone && (
                  <p className="text-xs text-muted-foreground">
                    {achat.fournisseur.telephone}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Achat direct</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatCurrency(achat.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payé</span>
              <span>{formatCurrency(achat.montant_paye)}</span>
            </div>
            {achat.total - achat.montant_paye > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium border-t pt-2">
                <span>Reste</span>
                <span>{formatCurrency(achat.total - achat.montant_paye)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Articles ({achat.lignes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {achat.lignes.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                  {l.variante?.pointure}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {l.variante?.produit?.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.variante?.couleur} · {formatCurrency(l.prix_unitaire)} × {l.quantite}
                  </p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  {formatCurrency(l.sous_total)}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {achat.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {achat.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}