'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Eye,
  Plus,
  Minus,
  Package,
  Ruler,
  Palette,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

import type { VarianteAvecStockComplet } from '@/types/stock';
import { getStatutStock, STATUT_STOCK_CONFIG } from '@/types/stock';
import { formatCurrency } from '@/lib/utils/format-currency';
import { ajusterStockVariante } from '@/lib/services/stock.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TableauStock({
  variantes,
}: {
  variantes: VarianteAvecStockComplet[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<VarianteAvecStockComplet | null>(null);
  const [open, setOpen] = useState(false);

  const handleAdjust = (v: VarianteAvecStockComplet) => {
    setSelected(v);
    setOpen(true);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Pointure</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead className="text-right">Valeur</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantes.map((v) => {
              const q = v.stock?.quantite ?? 0;
              const seuil = v.stock?.seuil_alerte ?? 5;
              const statut = getStatutStock(q, seuil);
              const config = STATUT_STOCK_CONFIG[statut];
              return (
                <TableRow key={v.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{v.produit?.nom}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.produit?.marque} · {v.produit?.reference}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {v.pointure}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{v.couleur}</TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(q * v.prix_achat, { compact: true })}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-bold">{q}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={config.className}>{config.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAdjust(v)}
                          className="cursor-pointer"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Ajuster le stock
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/produits/${v.produit_id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le produit
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {variantes.map((v) => {
          const q = v.stock?.quantite ?? 0;
          const seuil = v.stock?.seuil_alerte ?? 5;
          const statut = getStatutStock(q, seuil);
          const config = STATUT_STOCK_CONFIG[statut];
          return (
            <div
              key={v.id}
              className="rounded-xl border bg-card p-4 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-sm font-bold">
                  {v.pointure}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{v.produit?.nom}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.produit?.marque} · {v.couleur}
                      </p>
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${config.className}`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      Valeur :{' '}
                      <strong className="text-foreground">
                        {formatCurrency(q * v.prix_achat, { compact: true })}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{q}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleAdjust(v)}
                      >
                        <Package className="h-3.5 w-3.5" />
                        Ajuster
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal ajustement */}
      {selected && (
        <ModalAjustement
          variante={selected}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            setOpen(false);
            setSelected(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ============ Modal d'ajustement ============
function ModalAjustement({
  variante,
  open,
  onOpenChange,
  onSuccess,
}: {
  variante: VarianteAvecStockComplet;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const quantiteActuelle = variante.stock?.quantite ?? 0;
  const [nouvelleQuantite, setNouvelleQuantite] = useState(quantiteActuelle);
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  const delta = nouvelleQuantite - quantiteActuelle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nouvelleQuantite < 0) {
      toast.error('Quantité invalide');
      return;
    }

    setLoading(true);
    const res = await ajusterStockVariante(
      variante.id,
      nouvelleQuantite,
      motif || 'Ajustement manuel'
    );
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Stock ajusté', {
      description: `Nouvelle quantité : ${nouvelleQuantite}`,
    });

    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Ajuster le stock
          </DialogTitle>
          <DialogDescription>
            {variante.produit?.nom} · Pointure {variante.pointure} ·{' '}
            {variante.couleur}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Stock actuel
            </span>
            <span className="text-2xl font-bold">{quantiteActuelle}</span>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Nouvelle quantité</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() =>
                  setNouvelleQuantite(Math.max(0, nouvelleQuantite - 1))
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={nouvelleQuantite}
                onChange={(e) =>
                  setNouvelleQuantite(Number(e.target.value) || 0)
                }
                className="h-11 text-center text-lg font-bold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setNouvelleQuantite(nouvelleQuantite + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {delta !== 0 && (
              <p
                className={`text-xs font-medium flex items-center gap-1 ${
                  delta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {delta > 0 ? (
                  <Plus className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {delta > 0 ? '+' : ''}
                {delta} par rapport à l&apos;actuel
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motif" className="text-sm">
              Motif (optionnel)
            </Label>
            <Textarea
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Inventaire, casse, don, erreur de saisie…"
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <LoadingButton type="submit" loading={loading}>
              Valider
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}