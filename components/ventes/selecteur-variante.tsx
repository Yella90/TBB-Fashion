'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Package } from 'lucide-react';

import { formatCurrency } from '@/lib/utils/format-currency';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export type VarianteSelection = {
  variante_id: string;
  produit_nom: string;
  produit_marque: string | null;
  pointure: number;
  couleur: string;
  prix_unitaire: number;
  stock_disponible: number;
};

type Props = {
  variante: VarianteSelection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantite: number, prixUnitaire: number) => void;
};

export function SelecteurVariante({
  variante,
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);

  useEffect(() => {
    if (variante) {
      setQuantite(1);
      setPrixUnitaire(variante.prix_unitaire);
    }
  }, [variante]);

  if (!variante) return null;

  const sousTotal = quantite * prixUnitaire;
  const stockDispo = variante.stock_disponible;
  const depasseStock = quantite > stockDispo;

  const handleConfirm = () => {
    if (quantite <= 0 || depasseStock) return;
    onConfirm(quantite, prixUnitaire);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">
              {variante.produit_nom}
              {variante.produit_marque && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  · {variante.produit_marque}
                </span>
              )}
            </span>
          </DialogTitle>
          <DialogDescription>
            Pointure {variante.pointure} · {variante.couleur}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Stock dispo */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Stock disponible
            </span>
            <Badge
              className={
                stockDispo === 0
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0'
                  : stockDispo <= 5
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
              }
            >
              {stockDispo} en stock
            </Badge>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label className="text-sm">Quantité</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                disabled={quantite <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={stockDispo}
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value) || 1)}
                className="h-11 text-center text-lg font-bold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setQuantite(quantite + 1)}
                disabled={quantite >= stockDispo}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {depasseStock && (
              <p className="text-xs text-destructive">
                Quantité supérieure au stock disponible ({stockDispo}).
              </p>
            )}
          </div>

          {/* Prix unitaire (modifiable pour négociation) */}
          <div className="space-y-2">
            <Label htmlFor="prix" className="text-sm">
              Prix unitaire (FCFA)
            </Label>
            <Input
              id="prix"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              value={prixUnitaire}
              onChange={(e) => setPrixUnitaire(Number(e.target.value) || 0)}
              className="h-11"
            />
            {prixUnitaire !== variante.prix_unitaire && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Prix modifié (initial : {formatCurrency(variante.prix_unitaire)})
              </p>
            )}
          </div>

          {/* Sous-total */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sous-total</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(sousTotal)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={depasseStock || quantite <= 0 || stockDispo === 0}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}