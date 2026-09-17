'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Truck,
  RotateCcw,
  CreditCard,
  Gift,
  Wallet,
  BarChart3,
  Settings,
  Store,
  UserCog,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermission } from '@/lib/permissions/use-permission';
import type { Permission } from '@/lib/permissions/roles';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Tableau de bord',
        href: '/tableau-de-bord',
        icon: LayoutDashboard,
      },
      {
        label: 'Ventes',
        href: '/ventes',
        icon: ShoppingCart,
        permission: 'vente:read',
      },
      {
        label: 'Achats',
        href: '/achats',
        icon: ShoppingBag,
        permission: 'achat:read',
      },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      {
        label: 'Produits',
        href: '/produits',
        icon: Package,
        permission: 'produit:read',
      },
      {
        label: 'Variantes',
        href: '/variantes',
        icon: Layers,
        permission: 'variante:read',
      },
      {
        label: 'Stock',
        href: '/stock',
        icon: Boxes,
        permission: 'stock:read',
      },
    ],
  },
  {
    title: 'Relations',
    items: [
      {
        label: 'Clients',
        href: '/clients',
        icon: Users,
        permission: 'client:read',
      },
      {
        label: 'Fournisseurs',
        href: '/fournisseurs',
        icon: Truck,
        permission: 'fournisseur:read',
      },
      {
        label: 'Retours',
        href: '/retours',
        icon: RotateCcw,
        permission: 'retour:read',
      },
    ],
  },
  {
    title: 'Gestion',
    items: [
      {
        label: 'Paiements',
        href: '/paiements',
        icon: CreditCard,
        permission: 'paiement:read',
      },
      {
        label: 'Fidélité',
        href: '/fidelite',
        icon: Gift,
      },
      {
        label: 'Finances',
        href: '/finances',
        icon: Wallet,
        permission: 'finance:read',
      },
    ],
  },
  {
    title: 'Analyse',
    items: [
      {
        label: 'Rapports',
        href: '/rapports',
        icon: BarChart3,
        permission: 'rapport:read',
      },
    ],
  },
  {
    title: 'Système',
    items: [
      {
        label: 'Boutique',
        href: '/parametres/boutique',
        icon: Store,
        permission: 'parametre:read',
      },
      {
        label: 'Utilisateurs',
        href: '/parametres/utilisateurs',
        icon: UserCog,
        permission: 'utilisateur:read',
      },
      {
        label: 'Permissions',
        href: '/parametres/permissions',
        icon: Shield,
        permission: 'parametre:read',
      },
      {
        label: 'Paramètres',
        href: '/parametres',
        icon: Settings,
        permission: 'parametre:read',
      },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can, loading } = usePermission();

  // Filtrer les sections selon les permissions
  const sectionsFiltrees = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true;
        return can(item.permission);
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full w-full flex-col bg-card">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-tbb text-white font-bold text-sm shadow-sm">
          TBB
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">TBB Fashion</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Chaussures
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <nav className="space-y-6 p-4">
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-full rounded-md bg-secondary animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading &&
            sectionsFiltrees.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== '/tableau-de-bord' &&
                        pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              active
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </nav>
      </ScrollArea>

      <div className="shrink-0 border-t p-4">
        <p className="text-[10px] text-center text-muted-foreground">
          © {new Date().getFullYear()} TBB Fashion · v1.0
        </p>
      </div>
    </div>
  );
}