import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Layers,
  Boxes,
  TrendingUp,
  DollarSign,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

import { getProduit } from '@/lib/services/produits.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { FicheProduitEntete } from '@/components/produits/fiche-produit-entete';
import { ListeVariantes } from '@/components/produits/liste-variantes';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produit = await getProduit(id);
  return {
    title: produit ? `${produit.nom} · TBB Fashion` : 'Produit · TBB Fashion',
  };
}

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produit = await getProduit(id);

  if (!produit) {
    notFound();
  }

  // Stats
  const stockTotal = produit.variantes.reduce(
    (sum, v) => sum + (v.stock?.quantite ?? 0),
    0
  );

  const valeurStock = produit.variantes.reduce(
    (sum, v) => sum + (v.stock?.quantite ?? 0) * v.prix_achat,
    0
  );

  const enAlerte = produit.variantes.filter(
    (v) => (v.stock?.quantite ?? 0) <= (v.stock?.seuil_alerte ?? 5)
  ).length;

  const margeUnitaire = produit.prix_vente - produit.prix_achat;
  const margePourcent =
    produit.prix_achat > 0
      ? (margeUnitaire / produit.prix_achat) * 100
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 lg:space-y-6">
      {/* En-tête */}
      <FicheProduitEntete produit={produit} />

      {/* Stats principales */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Variantes"
          value={String(produit.variantes.length)}
          icon={<Layers className="h-5 w-5" />}
          description="pointures × couleurs"
        />
        <StatCard
          label="Stock total"
          value={String(stockTotal)}
          icon={<Boxes className="h-5 w-5" />}
          description="paires disponibles"
        />
        <StatCard
          label="Valeur du stock"
          value={formatCurrency(valeurStock, { compact: true })}
          icon={<DollarSign className="h-5 w-5" />}
          description="prix d'achat"
        />
        <StatCard
          label="Alertes"
          value={String(enAlerte)}
          icon={<Boxes className="h-5 w-5" />}
          description={enAlerte === 0 ? 'stock sain' : 'variantes en alerte'}
        />
      </div>

      {/* Contenu en 2 colonnes */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Colonne gauche : infos + description */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          {/* Prix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Tarification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Prix d&apos;achat
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(produit.prix_achat)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Prix de vente
                </span>
                <span className="text-sm font-bold">
                  {formatCurrency(produit.prix_vente)}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Marge unitaire
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(margeUnitaire)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {margePourcent.toFixed(1)}% de marge
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Catégorie</span>
                <Badge variant="secondary" className="font-normal capitalize">
                  {produit.categorie}
                </Badge>
              </div>
              {produit.type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <Badge variant="secondary" className="font-normal capitalize">
                    {produit.type}
                  </Badge>
                </div>
              )}
              {produit.saison && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Saison</span>
                  <Badge variant="secondary" className="font-normal capitalize">
                    {produit.saison}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {produit.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {produit.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between gap-2"
                asChild
              >
                <Link href={`/ventes/nouvelle?produit=${produit.id}`}>
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Vendre ce produit
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-2"
                asChild
              >
                <Link href={`/achats/nouvelle?produit=${produit.id}`}>
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Réapprovisionner
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : variantes */}
        <div className="lg:col-span-2">
          <ListeVariantes
            variantes={produit.variantes}
            produitNom={produit.nom}
          />
        </div>
      </div>
    </div>
  );
}