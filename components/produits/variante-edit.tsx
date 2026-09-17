'use client';

import { useFormContext, Controller } from 'react-hook-form';
import {
  Trash2,
  Ruler,
  Palette,
  Package,
  DollarSign,
  Sparkles,
} from 'lucide-react';

import type { ProduitEditInput } from '@/lib/validations/produit.schema';
import { POINTURES_STANDARD } from '@/types/produit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COULEURS_COURANTES = [
  'Noir','Blanc','Rouge','Bleu','Gris','Beige',
  'Marron','Vert','Jaune','Rose','Marine','Doré',
  'Argenté','Multicolore',
];

type Props = {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  isExisting: boolean;
  stockActuel?: number;
};

export function VarianteEdit({
  index,
  onRemove,
  canRemove,
  isExisting,
  stockActuel,
}: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProduitEditInput>();

  const varianteErrors = errors.variantes?.[index];

  return (
    <div className="relative rounded-xl border bg-card transition-colors hover:border-primary/40">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b bg-secondary/20 px-3 py-2 rounded-t-xl">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md text-white text-[10px] font-bold shrink-0 ${
              isExisting ? 'bg-secondary-foreground/70' : 'gradient-tbb'
            }`}
          >
            {index + 1}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            Variante {index + 1}
          </span>
          {isExisting ? (
            <Badge
              variant="secondary"
              className="text-[10px] font-normal h-5 px-1.5 shrink-0"
            >
              Existante
            </Badge>
          ) : (
            <Badge className="text-[10px] font-normal h-5 px-1.5 shrink-0 bg-primary text-primary-foreground">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              Nouvelle
            </Badge>
          )}
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Retirer cette variante"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Champs */}
      <div className="p-3 sm:p-4">
        <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-4">
          {/* Pointure */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              Pointure
            </Label>
            <Controller
              control={control}
              name={`variantes.${index}.pointure`}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {POINTURES_STANDARD.map((p) => (
                      <SelectItem key={p} value={String(p)}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {varianteErrors?.pointure && (
              <p className="text-[10px] text-destructive leading-tight">
                {varianteErrors.pointure.message}
              </p>
            )}
          </div>

          {/* Couleur */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Palette className="h-3.5 w-3.5" />
              Couleur
            </Label>
            <Input
              list="couleurs-list"
              placeholder="Ex : Noir"
              className="h-10 w-full"
              {...register(`variantes.${index}.couleur`)}
            />
            {varianteErrors?.couleur && (
              <p className="text-[10px] text-destructive leading-tight">
                {varianteErrors.couleur.message}
              </p>
            )}
          </div>

          {/* Prix de vente */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              Prix vente
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="0"
              className="h-10 w-full"
              {...register(`variantes.${index}.prix_vente`, {
                valueAsNumber: true,
              })}
            />
            {varianteErrors?.prix_vente && (
              <p className="text-[10px] text-destructive leading-tight">
                {varianteErrors.prix_vente.message}
              </p>
            )}
          </div>

          {/* Stock : lecture seule si existante, éditable si nouvelle */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              {isExisting ? 'Stock actuel' : 'Stock initial'}
            </Label>

            {isExisting ? (
              <div className="flex h-10 items-center justify-between rounded-md border bg-secondary/50 px-3 text-sm">
                <span className="font-medium">{stockActuel ?? 0}</span>
                <span className="text-[10px] text-muted-foreground">
                  via fiche produit
                </span>
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                className="h-10 w-full"
                {...register(`variantes.${index}.stock_initial`, {
                  valueAsNumber: true,
                })}
              />
            )}
            {varianteErrors?.stock_initial && (
              <p className="text-[10px] text-destructive leading-tight">
                {varianteErrors.stock_initial.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden input pour l'id (variantes existantes) */}
      {isExisting && (
        <input
          type="hidden"
          {...register(`variantes.${index}.id` as const)}
        />
      )}

      <datalist id="couleurs-list">
        {COULEURS_COURANTES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}