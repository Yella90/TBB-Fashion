'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, LogOut, User, Settings } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import {
  useCurrentUser,
  getInitials,
  getDisplayName,
} from '@/lib/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/layout/mode-toggle';
import { Sidebar } from '@/components/layout/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const confirm = useConfirm();
  const { user, loading } = useCurrentUser();

  const email = user?.email ?? '';
  const nom = (user?.user_metadata?.nom as string | undefined) ?? null;
  const displayName = getDisplayName(nom, email);
  const initials = getInitials(nom, email);

  const handleLogout = () => {
    confirm({
      title: 'Se déconnecter ?',
      description:
        'Vous serez redirigé vers la page de connexion. Toutes vos modifications non enregistrées seront perdues.',
      confirmLabel: 'Se déconnecter',
      cancelLabel: 'Annuler',
      variant: 'destructive',
      onConfirm: async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          toast.error('Erreur lors de la déconnexion', {
            description: error.message,
          });
          return;
        }

        toast.success('À bientôt 👋', {
          description: 'Vous êtes déconnecté.',
        });

        router.push('/connexion');
        router.refresh();
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 md:px-6">
      {/* Menu mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Recherche */}
      <div className="relative hidden md:flex flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit, client, vente…"
          className="pl-9 h-9 bg-secondary border-transparent focus-visible:bg-background"
        />
      </div>

      {/* Spacer mobile */}
      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Avatar className="h-8 w-8">
                {loading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <AvatarFallback className="gradient-tbb text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {email}
                    </span>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/parametres" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/parametres" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}