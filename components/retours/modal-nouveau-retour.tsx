'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  RotateCcw,
  Package,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

import type { RetourInput } from '@/lib/validations/retour.schema';
import {
  MOTIFS_RETOUR,
  TYPES_REMBOURSEMENT,
  type MotifRetour,
  type TypeRemboursement,
} from '@/types/retour';
import { formatCurrency } from '@/lib/utils/format-currency';
import { creerRetour } from '@/lib/services/retours.actions';

import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LigneRetournable = {
  variante_id: string;
  quantite: number;
  quantite_restante: number;
  deja_retourne: number;
  prix_unitaire: number;
  sous_total: number;
  produit_nom: string;
  marque: string | null;
  pointure: number;
  couleur: string;
};

type Props = {
  venteId: string;
  clientId: string | null;
  lignes: LigneRetournable[];
};

export function ModalNouveauRetour({ venteId, clientId, lignes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [selection, setSelection] = useState<Record<string, number>>({});
  const [motif, setMotif] = useState<MotifRetour>('mauvaise_taille');
  const [typeRemboursement, setTypeRemboursement] =
    useState<TypeRemboursement>('especes');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const lignesChoisies = useMemo(() => {
    return Object.entries(selection)
      .filter(([_, q]) => q > 0)
      .map(([varianteId, quantite]) => {
        const ligne = lignes.find((l) => l.variante_id === varianteId);
        if (!ligne) return null;
        return {
          variante_id: varianteId,
          quantite,
          prix_unitaire: ligne.prix_unitaire,
          sous_total: quantite * ligne.prix_unitaire,
          produit_nom: ligne.produit_nom,
          pointure: ligne.pointure,
          couleur: ligne.couleur,
          quantite_max: ligne.quantite_restante,
        };
      })
      .filter(Boolean) as any[];
  }, [selection, lignes]);

  const montantTotal = lignesChoisies.reduce((s, l) => s + l.sous_total, 0);

  const changerQuantite = (varianteId: string, delta: number) => {
    const ligne = lignes.find((l) => l.variante_id === varianteId);
    if (!ligne) return;
    const actuelle = selection[varianteId] ?? 0;
    const nouvelle = Math.max(
      0,
      Math.min(actuelle + delta, ligne.quantite_restante)
    );
    setSelection({ ...selection, [varianteId]: nouvelle });
  };

  const setQuantite = (varianteId: string, valeur: number) => {
    const ligne = lignes.find((l) => l.variante_id === varianteId);
    if (!ligne) return;
    const bornee = Math.max(0, Math.min(valeur, ligne.quantite_restante));
    setSelection({ ...selection, [varianteId]: bornee });
  };

  const reset = () => {
    setSelection({});
    setMotif('mauvaise_taille');
    setTypeRemboursement('especes');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (lignesChoisies.length === 0) {
      toast.error('Selectionnez au moins un article');
      return;
    }

    setLoading(true);
    const input: RetourInput = {
      vente_id: venteId,
      client_id: clientId,
      motif,
      description,
      type_remboursement: typeRemboursement,
      montant_rembourse: montantTotal,
      lignes: lignesChoisies,
    };

    const res = await creerRetour(input);
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Retour enregistre', {
      description: `Montant : ${formatCurrency(montantTotal)}`,
    });

    setOpen(false);
    reset();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Retourner un article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Nouveau retour
          </DialogTitle>
          <DialogDescription>
            Selectionnez les articles a retourner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selection des lignes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Articles ({lignes.length})
            </Label>
            <ul className="divide-y rounded-lg border max-h-64 overflow-y-auto">
              {lignes.map((l) => {
                const q = selection[l.variante_id] ?? 0;
                return (
                  <li key={l.variante_id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-xs font-bold">
                        {l.pointure}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {l.produit_nom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {l.couleur} · {formatCurrency(l.prix_unitaire)}
                          {l.deja_retourne > 0 && (
                            <span className="ml-2 text-amber-600 dark:text-amber-400">
                              ({l.deja_retourne} deja retourne)
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Max : {l.quantite_restante}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => changerQuantite(l.variante_id, -1)}
                          disabled={q === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={l.quantite_restante}
                          value={q}
                          onChange={(e) =>
                            setQuantite(
                              l.variante_id,
                              Number(e.target.value) || 0
                            )
                          }
                          className="h-7 w-14 text-center text-xs font-bold"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => changerQuantite(l.variante_id, 1)}
                          disabled={q >= l.quantite_restante}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label className="text-sm">Motif du retour</Label>
            <Select
              value={motif}
              onValueChange={(v) => setMotif(v as MotifRetour)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTIFS_RETOUR.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type remboursement */}
          <div className="space-y-2">
            <Label className="text-sm">Type de remboursement</Label>
            <Select
              value={typeRemboursement}
              onValueChange={(v) =>
                setTypeRemboursement(v as TypeRemboursement)
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES_REMBOURSEMENT.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-sm">
              Description (optionnel)
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
              placeholder="Details sur le retour..."
            />
          </div>

          {/* Recap */}
          {lignesChoisies.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Articles selectionnes ({lignesChoisies.length})
                </p>
                <ul className="space-y-1">
                  {lignesChoisies.map((l) => (
                    <li
                      key={l.variante_id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate">
                        {l.produit_nom} - P.{l.pointure} x{l.quantite}
                      </span>
                      <span className="font-medium shrink-0 ml-2">
                        {formatCurrency(l.sous_total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Montant total retourne</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(montantTotal)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Ce montant sera d&apos;abord deduit de la dette en cours (s&apos;il y en a).
                  L&apos;excedent sera rembourse selon le type choisi.
                </p>
              </div>

              {typeRemboursement === 'especes' && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Un remboursement especes sera enregistre en sortie de caisse.
                  </p>
                </div>
              )}
            </div>
          )}
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
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            disabled={lignesChoisies.length === 0}
            className="gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Valider le retour
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}