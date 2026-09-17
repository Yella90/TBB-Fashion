'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HandCoins, Wallet, DollarSign } from 'lucide-react';

import type { VenteAvecDetails } from '@/types/vente';
import { MODES_PAIEMENT } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import { ajouterPaiement } from '@/lib/services/ventes.actions';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ModalPaiement({ vente }: { vente: VenteAvecDetails }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState(vente.reste_a_payer);
  const [mode, setMode] = useState('especes');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (montant <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (montant > vente.reste_a_payer) {
      toast.error('Montant trop élevé', {
        description: `Le reste à payer est de ${formatCurrency(vente.reste_a_payer)}.`,
      });
      return;
    }

    setLoading(true);
    const res = await ajouterPaiement(vente.id, montant, mode, notes);
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Paiement enregistré ✅', {
      description: `${formatCurrency(montant)} encaissé.`,
    });

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <HandCoins className="h-4 w-4" />
          Encaisser un paiement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Ajouter un paiement
          </DialogTitle>
          <DialogDescription>
            Vente {vente.reference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info reste */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Reste à payer
            </p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(vente.reste_a_payer)}
            </p>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="montant" className="text-sm flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Montant (FCFA)
            </Label>
            <Input
              id="montant"
              type="number"
              inputMode="numeric"
              min={0}
              max={vente.reste_a_payer}
              step={500}
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value) || 0)}
              className="h-11 text-base font-bold"
            />
            <div className="flex gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMontant(vente.reste_a_payer)}
              >
                Tout solder ({formatCurrency(vente.reste_a_payer)})
              </Button>
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Mode de paiement</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES_PAIEMENT.filter((m) => m.value !== 'credit' && m.value !== 'mixte').map(
                  (m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
              placeholder="Remarques sur le paiement…"
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
            <LoadingButton type="submit" loading={loading} className="gap-1.5">
              <HandCoins className="h-4 w-4" />
              Encaisser {formatCurrency(montant)}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}