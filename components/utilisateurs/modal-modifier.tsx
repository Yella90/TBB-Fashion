'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil, User, Phone, Shield, CheckCircle2 } from 'lucide-react';

import {
  modifierUtilisateurSchema,
  type ModifierUtilisateurInput,
} from '@/lib/validations/utilisateur.schema';
import { ROLES, type Utilisateur } from '@/types/utilisateur';
import { modifierUtilisateur } from '@/lib/services/utilisateurs.actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

type Props = {
  utilisateur: Utilisateur | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ModalModifier({ utilisateur, open, onOpenChange }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ModifierUtilisateurInput>({
    resolver: zodResolver(modifierUtilisateurSchema),
    defaultValues: utilisateur
      ? {
          nom: utilisateur.nom,
          telephone: utilisateur.telephone ?? '',
          role: utilisateur.role,
          actif: utilisateur.actif,
        }
      : {
          nom: '',
          telephone: '',
          role: 'vendeur',
          actif: true,
        },
  });

  // Reset le formulaire quand l'utilisateur change
  useEffect(() => {
    if (utilisateur) {
      reset({
        nom: utilisateur.nom,
        telephone: utilisateur.telephone ?? '',
        role: utilisateur.role,
        actif: utilisateur.actif,
      });
    }
  }, [utilisateur, reset]);

  const role = watch('role');
  const actif = watch('actif');

  const onSubmit = async (data: ModifierUtilisateurInput) => {
    if (!utilisateur) return;

    const res = await modifierUtilisateur(utilisateur.id, data);
    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }
    toast.success('Utilisateur modifié ✅');
    onOpenChange(false);
    router.refresh();
  };

  if (!utilisateur) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Modifier {utilisateur.nom}
          </DialogTitle>
          <DialogDescription>{utilisateur.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Nom
            </Label>
            <Input className="h-11" {...register('nom')} />
            {errors.nom && (
              <p className="text-xs text-destructive">{errors.nom.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Téléphone
            </Label>
            <Input type="tel" className="h-11" {...register('telephone')} />
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

          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/30">
            <input
              type="checkbox"
              checked={actif}
              onChange={(e) =>
                setValue('actif', e.target.checked, { shouldDirty: true })
              }
              className="h-4 w-4 mt-0.5 rounded border-border accent-primary"
            />
            <div>
              <p className="text-sm font-medium">Compte actif</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Un compte inactif ne peut pas se connecter
              </p>
            </div>
          </label>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Enregistrer
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}