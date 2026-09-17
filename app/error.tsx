'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur application:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive shadow-lg">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Une erreur est survenue
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nous sommes désolés. Veuillez réessayer ou retourner à
          l&apos;accueil.
        </p>

        {error.digest && (
          <p className="mt-3 text-[10px] font-mono text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded inline-block">
            Code : {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/tableau-de-bord">
              <Home className="h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}