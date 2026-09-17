import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Page introuvable · TBB Fashion' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-tbb text-white shadow-2xl">
            <span className="text-4xl font-bold">404</span>
          </div>
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link href="/tableau-de-bord">
              <Home className="h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/ventes">
              <Search className="h-4 w-4" />
              Voir les ventes
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} TBB Fashion · La chaussure qui vous
          ressemble
        </p>
      </div>
    </div>
  );
}