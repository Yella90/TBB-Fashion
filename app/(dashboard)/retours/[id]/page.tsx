import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  Package,
  User,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

import { getRetour } from '@/lib/services/retours.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  STATUTS_RETOUR,
  MOTIFS_RETOUR,
  TYPES_REMBOURSEMENT,
} from '@/types/retour';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const retour = await getRetour(id);
  return {
    title: retour
      ? `Retour ${retour.reference} · TBB Fashion`
      : 'Retour · TBB Fashion',
  };
}

export default async function RetourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const retour = await getRetour(id);

  if (!retour) notFound();

  const statut =
    STATUTS_RETOUR.find((s) => s.value === retour.statut) ?? STATUTS_RETOUR[0];
  const motif =
    MOTIFS_RETOUR.find((m) => m.value === retour.motif)?.label ?? retour.motif;
  const typeRemb =
    TYPES_REMBOURSEMENT.find((t) => t.value === retour.type_remboursement)
      ?.label ?? retour.type_remboursement;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const clientNom = retour.client
    ? [retour.client.nom, retour.client.prenom].filter(Boolean).join(' ')
    : 'Client de passage';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/retours"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retours
        </Link>
        <span>/</span>
        <span className="font-mono">{retour.reference}</span>
      </div>

      {/* En-tête */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-tbb text-white shadow-md">
          <RotateCcw className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">
              {retour.reference}
            </h1>
            <Badge className={statut.className}>{statut.label}</Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {formatDate(retour.date_retour)}
          </p>
          {retour.montant_rembourse > 0 && (
            <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
              Montant rembourse : {formatCurrency(retour.montant_rembourse)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Infos */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{clientNom}</p>
              {retour.client?.telephone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />
                  {retour.client.telephone}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Motif</p>
                <p className="text-sm font-medium">{motif}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remboursement</p>
                <p className="text-sm font-medium">{typeRemb}</p>
              </div>
              {retour.vente && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Vente d&apos;origine
                  </p>
                  <Link
                    href={`/ventes/${retour.vente.id}`}
                    className="text-sm font-mono text-primary hover:underline"
                  >
                    {retour.vente.reference}
                  </Link>
                </div>
              )}
              {retour.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {retour.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Articles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Articles retournes ({retour.lignes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {retour.lignes.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-xs font-bold">
                      {l.variante?.pointure}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {l.variante?.produit?.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.variante?.couleur} - {formatCurrency(l.prix_unitaire)} x{' '}
                        {l.quantite}
                      </p>
                    </div>
                    <p className="text-sm font-bold shrink-0">
                      {formatCurrency(l.sous_total)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}