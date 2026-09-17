'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react';
import Link from 'next/link';

import {
  fournisseurSchema,
  type FournisseurInput,
} from '@/lib/validations/fournisseur.schema';
import type { Fournisseur } from '@/types/fournisseur';
import {
  creerFournisseur,
  modifierFournisseur,
} from '@/lib/services/fournisseurs.actions';

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

type Props = {
  fournisseur?: Fournisseur;
};

export function FormulaireFournisseur({ fournisseur }: Props) {
  const router = useRouter();
  const isEdit = !!fournisseur;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FournisseurInput>({
    resolver: zodResolver(fournisseurSchema),
    defaultValues: fournisseur
      ? {
          nom: fournisseur.nom,
          contact_nom: fournisseur.contact_nom ?? '',
          telephone: fournisseur.telephone ?? '',
          email: fournisseur.email ?? '',
          adresse: fournisseur.adresse ?? '',
          ville: fournisseur.ville ?? '',
          pays: fournisseur.pays ?? 'Mali',
          notes: fournisseur.notes ?? '',
        }
      : {
          nom: '',
          contact_nom: '',
          telephone: '',
          email: '',
          adresse: '',
          ville: '',
          pays: 'Mali',
          notes: '',
        },
  });

  const onSubmit = async (data: FournisseurInput) => {
    const res = isEdit
      ? await modifierFournisseur(fournisseur!.id, data)
      : await creerFournisseur(data);

    if (!res.success) {
      toast.error(
        isEdit
          ? 'Impossible de modifier le fournisseur'
          : 'Impossible de créer le fournisseur',
        { description: res.error }
      );
      return;
    }

    toast.success(
      isEdit ? 'Fournisseur mis à jour ✅' : 'Fournisseur créé 🎉',
      {
        description: isEdit
          ? 'Les informations ont été enregistrées.'
          : 'Vous pouvez maintenant lui associer des achats.',
      }
    );

    router.push('/fournisseurs');
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
          <Link href="/fournisseurs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Modification de ${fournisseur!.nom}`
              : 'Ajoutez un fournisseur à votre répertoire'}
          </p>
        </div>
      </div>

      {/* Identité */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-3.5 w-3.5" />
            </div>
            Identité
          </CardTitle>
          <CardDescription className="text-xs">
            Nom de l&apos;entreprise et contact principal
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom du fournisseur <span className="text-primary">*</span>
            </Label>
            <Input
              id="nom"
              placeholder="Ex : Nike Distribution"
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
            <Label htmlFor="contact_nom" className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Nom du contact
            </Label>
            <Input
              id="contact_nom"
              placeholder="Ex : Moussa Traoré"
              className="h-11"
              {...register('contact_nom')}
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
                placeholder="Ex : contact@nike.ml"
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

      {/* Adresse */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adresse" className="text-sm font-medium">
              Adresse
            </Label>
            <Input
              id="adresse"
              placeholder="Ex : Zone Industrielle, Rue 123"
              className="h-11"
              {...register('adresse')}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ville" className="text-sm font-medium">
                Ville
              </Label>
              <Input
                id="ville"
                placeholder="Ex : Bamako"
                className="h-11"
                {...register('ville')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pays" className="text-sm font-medium">
                Pays
              </Label>
              <Input
                id="pays"
                placeholder="Ex : Mali"
                className="h-11"
                {...register('pays')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base">Notes internes</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            placeholder="Conditions de paiement, délais de livraison, etc."
            rows={3}
            className="resize-none"
            {...register('notes')}
          />
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
          <Link href="/fournisseurs">Annuler</Link>
        </Button>
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="gap-2 w-full sm:w-auto"
        >
          {isEdit ? (
            <>
              <Save className="h-4 w-4" />
              Enregistrer
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Créer le fournisseur
            </>
          )}
        </LoadingButton>
      </div>
    </form>
  );
}