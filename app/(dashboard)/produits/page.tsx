import Link from 'next/link';
import { Package, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { listerProduits } from '@/lib/services/produits.service';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { TableauProduits } from '@/components/produits/tableau-produits';

export const metadata = { title: 'Produits · TBB Fashion' };

export default async function ProduitsPage() {
  const produits = await listerProduits({ actifSeulement: false });

  const actifs = produits.filter((p) => p.actif).length;
  const inactifs = produits.length - actifs;
  const categories = new Set(produits.map((p) => p.categorie)).size;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Produits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gérez votre catalogue de chaussures
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 sm:w-auto w-full">
          <Link href="/produits/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total produits"
          value={String(produits.length)}
          icon={<Package className="h-5 w-5" />}
          description="dans le catalogue"
        />
        <StatCard
          label="Produits actifs"
          value={String(actifs)}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`${inactifs} inactifs`}
        />
        <StatCard
          label="Catégories"
          value={String(categories)}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Homme, Femme, Enfant…"
        />
      </div>

      {/* Liste */}
      {produits.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucun produit pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Commencez par ajouter votre premier modèle de chaussures.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/produits/nouveau">
              <Plus className="h-4 w-4" />
              Ajouter un produit
            </Link>
          </Button>
        </div>
      ) : (
        <TableauProduits produits={produits} />
      )}
    </div>
  );
}