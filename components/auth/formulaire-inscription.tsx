
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import {
  inscriptionSchema,
  type InscriptionInput,
} from '@/lib/validations/auth.schema';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function FormulaireInscription() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InscriptionInput>({
    resolver: zodResolver(inscriptionSchema),
  });

  const onSubmit = async (data: InscriptionInput) => {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nom: data.nom,
        },
      },
    });

    if (error) {
      toast.error('Inscription impossible', {
        description:
          error.message === 'User already registered'
            ? 'Cet email est déjà utilisé.'
            : error.message,
      });
      return;
    }

    toast.success('Compte créé 🎉', {
      description: 'Vous pouvez maintenant vous connecter.',
    });

    router.push('/connexion');
  };

  return (
    <div className="space-y-8">
      {/* En-tête mobile */}
      <div className="flex flex-col items-start lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-tbb text-white font-bold text-sm shadow-sm">
          TBB
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez TBB Fashion en quelques secondes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="nom">Nom complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="nom"
              type="text"
              placeholder="Ex : Aminata Keita"
              autoComplete="name"
              className="pl-9"
              {...register('nom')}
            />
          </div>
          {errors.nom && (
            <p className="text-xs text-destructive">{errors.nom.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              className="pl-9"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className="pl-9 pr-10"
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmation"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className="pl-9"
              {...register('confirmation')}
            />
          </div>
          {errors.confirmation && (
            <p className="text-xs text-destructive">
              {errors.confirmation.message}
            </p>
          )}
        </div>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="w-full h-10"
        >
          Créer mon compte
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link
          href="/connexion"
          className="font-medium text-primary hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}


