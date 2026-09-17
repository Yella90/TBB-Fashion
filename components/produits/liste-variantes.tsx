'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Palette,
  Ruler,
} from 'lucide-react';

import type { VarianteAvecStock } from '@/types/produit';
import { formatCurrency } from '@/lib/utils/format-currency';
import { ajusterStock } from '@/lib/services/produits.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';

type StockStatus = 'rupture' | 'alerte' | 'ok';

function getStockStatus(
  quantite: number,
  seuil: number
): StockStatus {
  if (quantite === 0) return 'rupture';
  if (quantite <= seuil) return 'alerte';
  return 'ok';
}

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  rupture: {
    label: 'Rupture',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
    icon: XCircle,
  },
  alerte: {
    label: 'Stock faible',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
    icon: AlertTriangle,
  },
  ok: {
    label: 'En stock',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0',
    icon: CheckCircle2,
  },
};

export function ListeVariantes({
  variantes,
  produitNom,
}: {
  variantes: VarianteAvecStock[];
  produitNom: string;
}) {
  const sorted = [...variantes].sort((a, b) => {
    if (a.pointure !== b.pointure) return a.pointure - b.pointure;
    return a.couleur.localeCompare(b.couleur);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3 gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Variantes ({variantes.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Pointures × couleurs et stock disponible
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aucune variante pour ce produit
          </div>
        ) : (
          <>
            {/* Desktop : tableau */}
            <div className="hidden md:block">
              <div className="divide-y">
                {sorted.map((v) => (
                  <LigneVariante key={v.id} variante={v} produitNom={produitNom} />
                ))}
              </div>
            </div>

            {/* Mobile : cartes */}
            <div className="md:hidden divide-y">
              {sorted.map((v) => (
                <LigneVarianteMobile
                  key={v.id}
                  variante={v}
                  produitNom={produitNom}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============ Desktop ============
function LigneVariante({
  variante,
  produitNom,
}: {
  variante: VarianteAvecStock;
  produitNom: string;
}) {
  const quantite = variante.stock?.quantite ?? 0;
  const seuil = variante.stock?.seuil_alerte ?? 5;
  const status = getStockStatus(quantite, seuil);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm font-medium">{variante.pointure}</span>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm truncate">{variante.couleur}</span>
      </div>

      <div className="text-sm text-muted-foreground w-32 shrink-0 text-right">
        {formatCurrency(variante.prix_vente)}
      </div>

      <div className="w-32 shrink-0 flex justify-end">
        <Badge className={`gap-1 ${config.className}`}>
          <StatusIcon className="h-3 w-3" />
          {quantite} / {seuil}
        </Badge>
      </div>

      <div className="w-28 shrink-0 flex justify-end">
        <AjusterStockDialog
          variante={variante}
          produitNom={produitNom}
        />
      </div>
    </div>
  );
}

// ============ Mobile ============
function LigneVarianteMobile({
  variante,
  produitNom,
}: {
  variante: VarianteAvecStock;
  produitNom: string;
}) {
  const quantite = variante.stock?.quantite ?? 0;
  const seuil = variante.stock?.seuil_alerte ?? 5;
  const status = getStockStatus(quantite, seuil);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white text-sm font-bold">
            {variante.pointure}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{variante.couleur}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(variante.prix_vente)}
            </p>
          </div>
        </div>
        <Badge className={`gap-1 shrink-0 ${config.className}`}>
          <StatusIcon className="h-3 w-3" />
          {quantite} / {seuil}
        </Badge>
      </div>

      <AjusterStockDialog
        variante={variante}
        produitNom={produitNom}
        fullWidth
      />
    </div>
  );
}

// ============ Dialog d'ajustement de stock ============
function AjusterStockDialog({
  variante,
  produitNom,
  fullWidth = false,
}: {
  variante: VarianteAvecStock;
  produitNom: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'entree' | 'sortie'>('entree');
  const [quantite, setQuantite] = useState(0);
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  const quantiteActuelle = variante.stock?.quantite ?? 0;
  const quantiteFinale =
    type === 'entree'
      ? quantiteActuelle + quantite
      : quantiteActuelle - quantite;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantite <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    if (quantiteFinale < 0) {
      toast.error('Le stock final ne peut pas être négatif');
      return;
    }

    setLoading(true);
    const delta = type === 'entree' ? quantite : -quantite;
    const res = await ajusterStock(
      variante.id,
      delta,
      motif || (type === 'entree' ? 'Entrée manuelle' : 'Sortie manuelle')
    );
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success(
      type === 'entree' ? 'Stock ajouté' : 'Stock retiré',
      {
        description: `Nouveau stock : ${quantiteFinale}`,
      }
    );

    setOpen(false);
    setQuantite(0);
    setMotif('');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={fullWidth ? 'w-full gap-1.5' : 'gap-1.5'}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajuster stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuster le stock</DialogTitle>
          <DialogDescription>
            {produitNom} · Pointure {variante.pointure} · {variante.couleur}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock actuel */}
          <div className="rounded-lg bg-secondary/50 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Stock actuel
            </span>
            <span className="text-lg font-bold">{quantiteActuelle}</span>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-sm">Type d&apos;opération</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('entree')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  type === 'entree'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Plus className="h-4 w-4" />
                Entrée
              </button>
              <button
                type="button"
                onClick={() => setType('sortie')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  type === 'sortie'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Minus className="h-4 w-4" />
                Sortie
              </button>
            </div>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantite" className="text-sm">
              Quantité
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setQuantite(Math.max(0, quantite - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantite"
                type="number"
                inputMode="numeric"
                min={0}
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className="h-11 text-center text-lg font-bold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setQuantite(quantite + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {quantite > 0 && (
              <p className="text-xs text-muted-foreground">
                Stock final :{' '}
                <strong
                  className={
                    quantiteFinale < 0 ? 'text-destructive' : 'text-foreground'
                  }
                >
                  {quantiteFinale}
                </strong>
              </p>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="motif" className="text-sm">
              Motif (optionnel)
            </Label>
            <Textarea
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Réapprovisionnement fournisseur, vente directe..."
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <LoadingButton type="submit" loading={loading}>
              Confirmer
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}