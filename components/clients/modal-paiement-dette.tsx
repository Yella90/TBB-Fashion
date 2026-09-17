'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HandCoins, Wallet, DollarSign } from 'lucide-react';

import { MODES_PAIEMENT } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import { payerDette } from '@/lib/services/clients.actions';

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

type Props = {
  detteId: string;
  montantRestant: number;
  reference?: string;
};

export function ModalPaiementDette({
  detteId,
  montantRestant,
  reference,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState(montantRestant);
  const [mode, setMode] = useState('especes');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (montant <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (montant > montantRestant) {
      toast.error('Montant trop élevé', {
        description: `Le reste est de ${formatCurrency(montantRestant)}.`,
      });
      return;
    }

    setLoading(true);
    const res = await payerDette(detteId, montant, mode, notes);
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
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs"
        >
          <HandCoins className="h-3 w-3" />
          Payer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Paiement de dette
          </DialogTitle>
          {reference && (
            <DialogDescription>Vente {reference}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Reste à payer
            </p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(montantRestant)}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="montant"
              className="text-sm flex items-center gap-1.5"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Montant (FCFA)
            </Label>
            <Input
              id="montant"
              type="number"
              inputMode="numeric"
              min={0}
              max={montantRestant}
              step={500}
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value) || 0)}
              className="h-11 text-base font-bold"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setMontant(montantRestant)}
            >
              Tout solder ({formatCurrency(montantRestant)})
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Mode de paiement</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES_PAIEMENT.filter(
                  (m) => m.value !== 'credit' && m.value !== 'mixte'
                ).map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              placeholder="Remarques…"
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
              Encaisser
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}