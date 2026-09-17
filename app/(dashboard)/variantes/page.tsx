import Link from 'next/link';
import { Layers, Plus, Package, AlertTriangle } from 'lucide-react';
import { listerStock } from '@/lib/services/stock.service';
import { TableauStock } from '@/components/stock/tableau-stock';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Variantes · TBB Fashion' };

export default async function VariantesPage() {
  const variantes = await listerStock({ limite: 500 });

  const totalVariantes = variantes.length;
  const enStock = variantes.filter((v) => (v.stock?.quantite ?? 0) > 0).length;
  const enAlerte = variantes.filter((v) => {
    const q = v.stock?.quantite ?? 0;
    return q > 0 && q <= (v.stock?.seuil_alerte ?? 5);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Variantes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Toutes les combinaisons pointure × couleur
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/produits/nouveau">
            <Plus className="h-4 w-4" />
            Ajouter via un produit
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3">
        <StatCard
          label="Total variantes"
          value={String(totalVariantes)}
          icon={<Layers className="h-5 w-5" />}
          description="pointures × couleurs"
        />
        <StatCard
          label="En stock"
          value={String(enStock)}
          icon={<Package className="h-5 w-5" />}
          description={`${totalVariantes - enStock} en rupture`}
        />
        <StatCard
          label="Stock faible"
          value={String(enAlerte)}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="a reapprovisionner"
        />
      </div>

      {variantes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Aucune variante pour le moment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Les variantes sont creees automatiquement lors de la creation d&apos;un produit.
          </p>
          <Button asChild className="mt-4 gap-1">
            <Link href="/produits/nouveau">
              <Plus className="h-4 w-4" />
              Creer un produit
            </Link>
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Toutes les variantes
            </CardTitle>
            <CardDescription className="text-xs">
              {totalVariantes} variante{totalVariantes > 1 ? 's' : ''} au total
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableauStock variantes={variantes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}