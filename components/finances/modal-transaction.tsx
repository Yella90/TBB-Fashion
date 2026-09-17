'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

import {
  transactionSchema,
  type TransactionInput,
} from '@/lib/validations/finance.schema';
import {
  CATEGORIES_REVENU,
  CATEGORIES_DEPENSE,
  MODES_PAIEMENT_FINANCE,
} from '@/types/finance';
import { creerTransaction } from '@/lib/services/finances.actions';

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
  typeParDefaut?: 'revenu' | 'depense';
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline';
};

export function ModalTransaction({
  typeParDefaut = 'depense',
  triggerLabel,
  triggerVariant = 'default',
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'revenu' | 'depense'>(typeParDefaut);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: typeParDefaut,
      categorie: '',
      montant: 0,
      description: '',
      mode_paiement: 'especes',
    },
  });

  const categorie = watch('categorie');
  const modePaiement = watch('mode_paiement');
  const categories =
    type === 'revenu' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;

  const onChangeType = (t: 'revenu' | 'depense') => {
    setType(t);
    setValue('type', t);
    setValue('categorie', '');
  };

  const onSubmit = async (data: TransactionInput) => {
    const res = await creerTransaction({ ...data, type });
    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success(
      type === 'revenu' ? 'Revenu enregistré ✅' : 'Dépense enregistrée ✅'
    );
    setOpen(false);
    reset();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {triggerLabel ?? 'Nouvelle transaction'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Nouvelle transaction
          </DialogTitle>
          <DialogDescription>
            Enregistrez un revenu ou une dépense
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeType('revenu')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                type === 'revenu'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Revenu
            </button>
            <button
              type="button"
              onClick={() => onChangeType('depense')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                type === 'depense'
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Dépense
            </button>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label className="text-sm">Catégorie</Label>
            <Select
              value={categorie}
              onValueChange={(v) =>
                setValue('categorie', v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categorie && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.categorie.message}
              </p>
            )}
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="montant" className="text-sm">
              Montant (FCFA)
            </Label>
            <Input
              id="montant"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="0"
              className="h-11 text-base font-bold"
              {...register('montant', { valueAsNumber: true })}
            />
            {errors.montant && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.montant.message}
              </p>
            )}
          </div>

          {/* Mode de paiement */}
          <div className="space-y-2">
            <Label className="text-sm">Mode de paiement</Label>
            <Select
              value={modePaiement}
              onValueChange={(v) =>
                setValue('mode_paiement', v as any)
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES_PAIEMENT_FINANCE.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Description (optionnel)
            </Label>
            <Textarea
              id="description"
              rows={2}
              className="resize-none"
              placeholder="Détails de la transaction…"
              {...register('description')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <LoadingButton type="submit" loading={isSubmitting}>
              Enregistrer
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}