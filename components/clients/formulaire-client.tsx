'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react';
import Link from 'next/link';

import {
  clientSchema,
  type ClientInput,
} from '@/lib/validations/client.schema';
import { GENRES } from '@/types/client';
import type { Client } from '@/types/client';
import { creerClient, modifierClient } from '@/lib/services/clients.actions';

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

type Props = {
  client?: Client;
};

export function FormulaireClient({ client }: Props) {
  const router = useRouter();
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          nom: client.nom,
          prenom: client.prenom ?? '',
          telephone: client.telephone ?? '',
          email: client.email ?? '',
          adresse: client.adresse ?? '',
          ville: client.ville ?? '',
          date_naissance: client.date_naissance ?? '',
          genre: client.genre,
          notes: client.notes ?? '',
        }
      : {
          nom: '',
          prenom: '',
          telephone: '',
          email: '',
          adresse: '',
          ville: '',
          date_naissance: '',
          genre: null,
          notes: '',
        },
  });

  const genre = watch('genre');

  const onSubmit = async (data: ClientInput) => {
    const res = isEdit
      ? await modifierClient(client!.id, data)
      : await creerClient(data);

    if (!res.success) {
      toast.error(
        isEdit ? 'Impossible de modifier le client' : 'Impossible de créer le client',
        { description: res.error }
      );
      return;
    }

    toast.success(isEdit ? 'Client mis à jour ✅' : 'Client créé 🎉', {
      description: isEdit
        ? 'Les informations ont été enregistrées.'
        : 'Vous pouvez maintenant lui associer des ventes.',
    });

    router.push('/clients');
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
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            {isEdit ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Modification de ${client!.nom}`
              : 'Ajoutez un client à votre fichier'}
          </p>
        </div>
      </div>

      {/* Identité */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </div>
            Identité
          </CardTitle>
          <CardDescription className="text-xs">
            Nom, prénom et informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm font-medium">
                Nom <span className="text-primary">*</span>
              </Label>
              <Input
                id="nom"
                placeholder="Ex : Keita"
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
              <Label htmlFor="prenom" className="text-sm font-medium">
                Prénom
              </Label>
              <Input
                id="prenom"
                placeholder="Ex : Aminata"
                className="h-11"
                {...register('prenom')}
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Genre</Label>
              <Select
                value={genre ?? ''}
                onValueChange={(v) =>
                  setValue('genre', v as ClientInput['genre'], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_naissance" className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date de naissance
              </Label>
              <Input
                id="date_naissance"
                type="date"
                className="h-11"
                {...register('date_naissance')}
              />
            </div>
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
            Contact
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
                placeholder="Ex : aminata@exemple.com"
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
              placeholder="Ex : Quartier Hamdallaye ACI 2000"
              className="h-11"
              {...register('adresse')}
            />
          </div>

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
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base">Notes internes</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            placeholder="Remarques, préférences du client, etc."
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
          <Link href="/clients">Annuler</Link>
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
              Créer le client
            </>
          )}
        </LoadingButton>
      </div>
    </form>
  );
}