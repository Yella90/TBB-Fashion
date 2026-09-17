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

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Tableau de bord', href: '/tableau-de-bord', icon: LayoutDashboard },
      { label: 'Ventes', href: '/ventes', icon: ShoppingCart },
      { label: 'Achats', href: '/achats', icon: ShoppingBag },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Produits', href: '/produits', icon: Package },
      { label: 'Variantes', href: '/variantes', icon: Layers },
      { label: 'Stock', href: '/stock', icon: Boxes },
    ],
  },
  {
    title: 'Relations',
    items: [
      { label: 'Clients', href: '/clients', icon: Users },
      { label: 'Fournisseurs', href: '/fournisseurs', icon: Truck },
      { label: 'Retours', href: '/retours', icon: RotateCcw },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { label: 'Paiements', href: '/paiements', icon: CreditCard },
      { label: 'Fidélité', href: '/fidelite', icon: Gift },
      { label: 'Finances', href: '/finances', icon: Wallet },
    ],
  },
  {
    title: 'Analyse',
    items: [{ label: 'Rapports', href: '/rapports', icon: BarChart3 }],
  },
  {
    title: 'Système',
    items: [
      { label: 'Boutique', href: '/parametres/boutique', icon: Store },
      { label: 'Utilisateurs', href: '/parametres/utilisateurs', icon: UserCog },
      { label: 'Permissions', href: '/parametres/permissions', icon: Shield },
      { label: 'Paramètres', href: '/parametres', icon: Settings },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-card">
      {/* Logo / Brand (fixe en haut) */}
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

      {/* Navigation (scrollable) */}
      <ScrollArea className="flex-1 min-h-0">
        <nav className="space-y-6 p-4">
          {sections.map((section) => (
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

      {/* Footer (fixe en bas) */}
      <div className="shrink-0 border-t p-4">
        <p className="text-[10px] text-center text-muted-foreground">
          © {new Date().getFullYear()} TBB Fashion · v1.0
        </p>
      </div>
    </div>
  );
}