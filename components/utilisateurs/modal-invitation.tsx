'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  UserPlus,
  Mail,
  User,
  Phone,
  Shield,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

import {
  invitationSchema,
  type InvitationInput,
} from '@/lib/validations/utilisateur.schema';
import { ROLES } from '@/types/utilisateur';
import { inviterUtilisateur } from '@/lib/services/utilisateurs.actions';

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
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ModalInvitation() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<{
    email: string;
    motDePasse: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvitationInput>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      role: 'vendeur',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: InvitationInput) => {
    const res = await inviterUtilisateur(data);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    setCreated({
      email: data.email,
      motDePasse: res.motDePasseTemporaire!,
    });
    reset();
    router.refresh();
  };

  const handleClose = () => {
    setOpen(false);
    setCreated(null);
    setCopied(false);
  };

  const copierMotDePasse = () => {
    if (!created) return;
    navigator.clipboard.writeText(
      `Email : ${created.email}\nMot de passe : ${created.motDePasse}`
    );
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Inviter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Inviter un utilisateur
              </DialogTitle>
              <DialogDescription>
                Un mot de passe temporaire sera généré. L&apos;utilisateur pourra
                le changer après sa première connexion.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Nom complet
                </Label>
                <Input
                  id="nom"
                  placeholder="Ex : Aminata Keita"
                  className="h-11"
                  {...register('nom')}
                />
                {errors.nom && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.nom.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex : aminata@tbb-fashion.com"
                  className="h-11"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-sm flex items-center gap-1.5">
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
                <Label className="text-sm flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Rôle
                </Label>
                <Select
                  value={role}
                  onValueChange={(v) =>
                    setValue('role', v as any, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div>
                          <p className="font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.description}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <LoadingButton type="submit" loading={isSubmitting}>
                  Inviter
                </LoadingButton>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-5 w-5" />
                Utilisateur créé
              </DialogTitle>
              <DialogDescription>
                Transmettez ces identifiants à l&apos;utilisateur.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-lg border bg-secondary/30 p-3 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-mono font-medium">
                    {created.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Mot de passe temporaire
                  </p>
                  <p className="text-sm font-mono font-bold">
                    {created.motDePasse}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  L&apos;utilisateur devra changer ce mot de passe à sa première
                  connexion.
                </p>
              </div>

              <Button
                onClick={copierMotDePasse}
                variant="outline"
                className="w-full gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier les identifiants
                  </>
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fermer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}