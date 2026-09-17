'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search,
  Save,
  AlertCircle,
  Package,
  CheckCircle2,
  X,
} from 'lucide-react';

import type { VarianteAvecStockComplet } from '@/types/stock';
import { ajusterStockEnMasse } from '@/lib/services/stock.actions';
import { useConfirm } from '@/components/ui/confirm-provider';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function InventaireClient({
  variantes,
}: {
  variantes: VarianteAvecStockComplet[];
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const [recherche, setRecherche] = useState('');
  const [modifs, setModifs] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [motif, setMotif] = useState('Inventaire mensuel');
  const [loading, setLoading] = useState(false);

  // Filtre
  const filtered = useMemo(() => {
    if (!recherche.trim()) return variantes;
    const terme = recherche.toLowerCase();
    return variantes.filter(
      (v) =>
        v.produit?.nom?.toLowerCase().includes(terme) ||
        v.produit?.marque?.toLowerCase().includes(terme) ||
        v.couleur.toLowerCase().includes(terme) ||
        String(v.pointure).includes(terme)
    );
  }, [variantes, recherche]);

  const setQuantite = (id: string, valeur: number) => {
    setModifs((prev) => {
      const next = { ...prev };
      if (valeur < 0) valeur = 0;
      // Si la valeur est identique à l'original, on retire la modif
      const original =
        variantes.find((v) => v.id === id)?.stock?.quantite ?? 0;
      if (valeur === original) {
        delete next[id];
      } else {
        next[id] = valeur;
      }
      return next;
    });
  };

  const nbModifs = Object.keys(modifs).length;

  const handleSave = () => {
    if (nbModifs === 0) {
      toast.info('Aucune modification à enregistrer');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const ajustements = Object.entries(modifs).map(([varianteId, q]) => ({
      varianteId,
      nouvelleQuantite: q,
    }));

    const res = await ajusterStockEnMasse(ajustements, motif);
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Inventaire enregistré 🎉', {
      description: `${res.count} variante${res.count > 1 ? 's' : ''} ajustée${res.count > 1 ? 's' : ''}.`,
    });

    setConfirmOpen(false);
    setModifs({});
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Inventaire
              </CardTitle>
              <CardDescription className="text-xs">
                Modifiez les quantités réelles et validez en une fois.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {nbModifs > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModifs({})}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </Button>
              )}
              <LoadingButton
                type="button"
                onClick={handleSave}
                disabled={nbModifs === 0}
                loading={loading}
                size="sm"
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Valider ({nbModifs})
              </LoadingButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrer par produit, marque, pointure, couleur…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Liste */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="mt-3 text-sm font-medium">Aucun résultat</p>
            </div>
          ) : (
            <ul className="divide-y rounded-lg border">
              {filtered.map((v) => {
                const q = v.stock?.quantite ?? 0;
                const valeur = modifs[v.id] ?? q;
                const diff = valeur - q;
                return (
                  <li key={v.id} className="p-3 hover:bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                        {v.pointure}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {v.produit?.nom}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {v.produit?.marque} · {v.couleur}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-muted-foreground">
                            Actuel
                          </p>
                          <p className="text-sm font-medium">{q}</p>
                        </div>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={valeur}
                          onChange={(e) =>
                            setQuantite(v.id, Number(e.target.value) || 0)
                          }
                          className={`h-9 w-20 text-center font-bold ${
                            diff !== 0
                              ? diff > 0
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : ''
                          }`}
                        />
                        {diff !== 0 && (
                          <Badge
                            className={`text-[10px] shrink-0 ${
                              diff > 0
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0'
                            }`}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Confirmer l&apos;inventaire
            </DialogTitle>
            <DialogDescription>
              {nbModifs} variante{nbModifs > 1 ? 's' : ''} sera
              {nbModifs > 1 ? 'ont' : ''} ajustée{nbModifs > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto rounded-lg border divide-y">
              {Object.entries(modifs).map(([id, q]) => {
                const v = variantes.find((x) => x.id === id);
                if (!v) return null;
                const avant = v.stock?.quantite ?? 0;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 p-2 text-xs"
                  >
                    <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md bg-secondary text-[10px] font-bold">
                      {v.pointure}
                    </div>
                    <span className="flex-1 truncate font-medium">
                      {v.produit?.nom} · {v.couleur}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {avant} → <strong className="text-foreground">{q}</strong>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motif" className="text-sm">
                Motif
              </Label>
              <Textarea
                id="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Cette action crée des mouvements d&apos;ajustement tracés dans
                l&apos;historique.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <LoadingButton onClick={handleConfirm} loading={loading} className="gap-1.5">
              <Save className="h-4 w-4" />
              Enregistrer
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}