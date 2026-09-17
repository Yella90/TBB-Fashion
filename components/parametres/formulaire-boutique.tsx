'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Package,
  Gift,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import {
  parametresBoutiqueSchema,
  type ParametresBoutiqueInput,
} from '@/lib/validations/parametres.schema';
import type { ParametresBoutique } from '@/types/parametres';
import { updateParametresBoutique } from '@/lib/services/parametres.actions';
import { formatCurrency } from '@/lib/utils/format-currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEVISES = [
  { value: 'FCFA', label: 'FCFA (Franc CFA)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (Dollar US)' },
  { value: 'MAD', label: 'MAD (Dirham marocain)' },
  { value: 'GNF', label: 'GNF (Franc guinéen)' },
  { value: 'XOF', label: 'XOF (Franc CFA Ouest)' },
];

type Props = {
  parametres: ParametresBoutique;
};

export function FormulaireBoutique({ parametres }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ParametresBoutiqueInput>({
    resolver: zodResolver(parametresBoutiqueSchema),
    defaultValues: {
      nom: parametres.nom,
      slogan: parametres.slogan ?? '',
      adresse: parametres.adresse ?? '',
      telephone: parametres.telephone ?? '',
      email: parametres.email ?? '',
      devise: parametres.devise,
      symbole_devise: parametres.symbole_devise,
      tva: parametres.tva,
      seuil_alerte_stock: parametres.seuil_alerte_stock,
      points_fidelite_par_1000: parametres.points_fidelite_par_1000,
      valeur_point_fidelite: parametres.valeur_point_fidelite,
    },
  });

  const devise = watch('devise');
  const symbole = watch('symbole_devise');
  const tva = watch('tva');
  const points1000 = watch('points_fidelite_par_1000');
  const valeurPoint = watch('valeur_point_fidelite');

  // Quand la devise change, on suggère un symbole
  const onChangeDevise = (v: string) => {
    setValue('devise', v, { shouldDirty: true });
    setValue('symbole_devise', v, { shouldDirty: true });
  };

  const onSubmit = async (data: ParametresBoutiqueInput) => {
    const res = await updateParametresBoutique(data);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Paramètres enregistrés âœ…', {
      description: 'Les informations de la boutique ont été mises é  jour.',
    });

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 shrink-0 mt-0.5"
        >
          <Link href="/parametres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Boutique
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Informations générales et paramètres par défaut
          </p>
        </div>
      </div>

      {/* Identité */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Store className="h-3.5 w-3.5" />
            </div>
            Identité
          </CardTitle>
          <CardDescription className="text-xs">
            Nom et slogan affichés sur les tickets
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom de la boutique <span className="text-primary">*</span>
            </Label>
            <Input
              id="nom"
              placeholder="Ex : TBB Fashion"
              className="h-11"
              {...register('nom')}
            />
            {errors.nom && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.nom.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan" className="text-sm font-medium">
              Slogan
            </Label>
            <Input
              id="slogan"
              placeholder="Ex : La chaussure qui vous ressemble"
              className="h-11"
              {...register('slogan')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-3.5 w-3.5" />
            </div>
            Coordonnées
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adresse" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Adresse
            </Label>
            <Input
              id="adresse"
              placeholder="Ex : Quartier Hamdallaye ACI 2000"
              className="h-11"
              {...register('adresse')}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Téléphone
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="Ex : +223 70 00 00 00"
                className="h-11"
                {...register('telephone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex : contact@tbb-fashion.com"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devise & TVA */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            Devise & Fiscalité
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Devise <span className="text-primary">*</span>
              </Label>
              <Select value={devise} onValueChange={onChangeDevise}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVISES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbole_devise" className="text-sm font-medium">
                Symbole affiché
              </Label>
              <Input
                id="symbole_devise"
                placeholder="Ex : FCFA"
                className="h-11"
                {...register('symbole_devise')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tva" className="text-sm font-medium">
              TVA par défaut (%)
            </Label>
            <Input
              id="tva"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.5}
              placeholder="0"
              className="h-11"
              {...register('tva', { valueAsNumber: true })}
            />
            {errors.tva && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.tva.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Laissez 0 si vous ne facturez pas de TVA.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stock */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-3.5 w-3.5" />
            </div>
            Stock
          </CardTitle>
          <CardDescription className="text-xs">
            Seuil d&apos;alerte appliqué par défaut aux nouvelles variantes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label htmlFor="seuil_alerte_stock" className="text-sm font-medium">
              Seuil d&apos;alerte (nombre de paires)
            </Label>
            <Input
              id="seuil_alerte_stock"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="5"
              className="h-11"
              {...register('seuil_alerte_stock', { valueAsNumber: true })}
            />
            {errors.seuil_alerte_stock && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.seuil_alerte_stock.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              En dessous de ce nombre, la variante apparaîtra en alerte.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fidélité */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gift className="h-3.5 w-3.5" />
            </div>
            Fidélité
          </CardTitle>
          <CardDescription className="text-xs">
            Comment les points sont gagnés et utilisés
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="points_fidelite_par_1000"
                className="text-sm font-medium"
              >
                Points gagnés par 1000 {symbole}
              </Label>
              <Input
                id="points_fidelite_par_1000"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="1"
                className="h-11"
                {...register('points_fidelite_par_1000', {
                  valueAsNumber: true,
                })}
              />
              <p className="text-[10px] text-muted-foreground">
                Ex : 1 â†’ pour 1000 {symbole} dépensés, le client gagne 1 point.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="valeur_point_fidelite"
                className="text-sm font-medium"
              >
                Valeur d&apos;un point en {symbole}
              </Label>
              <Input
                id="valeur_point_fidelite"
                type="number"
                inputMode="numeric"
                min={0}
                step="any"
                placeholder="100"
                className="h-11"
                {...register('valeur_point_fidelite', {
                  valueAsNumber: true,
                })}
              />
              <p className="text-[10px] text-muted-foreground">
                Ex : 100 â†’ 1 point = 100 {symbole} de réduction.
              </p>
            </div>
          </div>

          {/* Aperçu */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-700 dark:text-emerald-400">
                <p className="font-medium">Aperçu</p>
                <p className="mt-1">
                  Un client qui achète pour{' '}
                  <strong>
                    {formatCurrency(50000, { showSymbol: true })}
                  </strong>{' '}
                  gagne{' '}
                  <strong>
                    {points1000 > 0 ? Math.floor((50000 / 1000) * points1000) : 0}{' '}
                    points
                  </strong>
                  , soit une valeur de{' '}
                  <strong>
                    {formatCurrency(
                      points1000 > 0
                        ? Math.floor((50000 / 1000) * points1000) * valeurPoint
                        : 0
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pb-4">
        <Button
          type="button"
          variant="outline"
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/parametres">Annuler</Link>
        </Button>
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="gap-2 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          Enregistrer
        </LoadingButton>
      </div>
    </form>
  );
}