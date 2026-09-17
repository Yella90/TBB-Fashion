import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Wallet,
  Eye,
  MapPin,
  FileText,
} from 'lucide-react';

import { getFournisseur } from '@/lib/services/fournisseurs.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { STATUTS_ACHAT } from '@/types/achat';
import { FicheFournisseurEntete } from '@/components/fournisseurs/fiche-fournisseur-entete';
import { StatCard } from '@/components/dashboard/stat-card';
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
  const fournisseur = await getFournisseur(id);
  return {
    title: fournisseur
      ? `${fournisseur.nom} · TBB Fashion`
      : 'Fournisseur · TBB Fashion',
  };
}

export default async function FournisseurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fournisseur = await getFournisseur(id);

  if (!fournisseur) notFound();

  const achatsActifs = fournisseur.achats.filter((a) => a.statut !== 'annule');
  const totalAchats = achatsActifs.reduce((s, a) => s + a.total, 0);
  const totalPaye = achatsActifs.reduce((s, a) => s + a.montant_paye, 0);
  const resteDu = Math.max(totalAchats - totalPaye, 0);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 lg:space-y-6">
      <FicheFournisseurEntete fournisseur={fournisseur} />

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total achats"
          value={formatCurrency(totalAchats, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description="cumulés"
        />
        <StatCard
          label="Achats"
          value={String(achatsActifs.length)}
          icon={<ShoppingBag className="h-5 w-5" />}
          description="commandes"
        />
        <StatCard
          label="Total payé"
          value={formatCurrency(totalPaye, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description="versé"
        />
        <StatCard
          label="Reste dû"
          value={formatCurrency(resteDu, { compact: true })}
          icon={<Wallet className="h-5 w-5" />}
          description={resteDu > 0 ? 'à régler' : 'tout est réglé'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : infos */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          {/* Coordonnées */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {fournisseur.contact_nom && (
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{fournisseur.contact_nom}</p>
                </div>
              )}
              {fournisseur.telephone && (
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{fournisseur.telephone}</p>
                </div>
              )}
              {fournisseur.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{fournisseur.email}</p>
                </div>
              )}
              {(fournisseur.adresse || fournisseur.ville) && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Adresse
                  </p>
                  <p className="font-medium">
                    {[fournisseur.adresse, fournisseur.ville, fournisseur.pays]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
              {!fournisseur.contact_nom &&
                !fournisseur.telephone &&
                !fournisseur.email &&
                !fournisseur.adresse && (
                  <p className="text-xs text-muted-foreground italic">
                    Aucune coordonnée renseignée
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Notes */}
          {fournisseur.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {fournisseur.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite : historique achats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 bg-secondary/30 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Historique des achats
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {fournisseur.achats.length} achat
                {fournisseur.achats.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {fournisseur.achats.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Aucun achat enregistré avec ce fournisseur
                </div>
              ) : (
                <ul className="divide-y">
                  {fournisseur.achats.map((a) => {
                    const statut =
                      STATUTS_ACHAT.find((s) => s.value === a.statut) ??
                      STATUTS_ACHAT[0];
                    const reste = a.total - a.montant_paye;
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/achats/${a.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold">
                            {a.reference.slice(-3)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono font-medium truncate">
                              {a.reference}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(a.date_achat)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">
                              {formatCurrency(a.total)}
                            </p>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 h-5 mt-0.5 ${statut.className}`}
                            >
                              {statut.label}
                            </Badge>
                            {reste > 0 && a.statut !== 'annule' && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                Reste : {formatCurrency(reste, { compact: true })}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}