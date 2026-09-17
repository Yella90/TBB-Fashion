'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Boxes,
  RotateCcw,
  CreditCard,
  Gift,
  Settings,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

type Route = {
  label: string;
  href: string;
  icon: React.ElementType;
  keywords?: string[];
};

const ROUTES: Route[] = [
  { label: 'Tableau de bord', href: '/tableau-de-bord', icon: BarChart3 },
  { label: 'Ventes', href: '/ventes', icon: ShoppingCart, keywords: ['facture', 'transactions'] },
  { label: 'Nouvelle vente', href: '/ventes/nouvelle', icon: ShoppingCart, keywords: ['encaisser'] },
  { label: 'Achats', href: '/achats', icon: Truck, keywords: ['approvisionnement', 'commande'] },
  { label: 'Produits', href: '/produits', icon: Package, keywords: ['articles', 'chaussures'] },
  { label: 'Variantes', href: '/variantes', icon: Package, keywords: ['pointures', 'couleurs'] },
  { label: 'Stock', href: '/stock', icon: Boxes, keywords: ['inventaire', 'quantités'] },
  { label: 'Mouvements stock', href: '/stock/mouvements', icon: RotateCcw },
  { label: 'Alertes stock', href: '/stock/alertes', icon: Boxes },
  { label: 'Clients', href: '/clients', icon: Users, keywords: ['acheteurs'] },
  { label: 'Fournisseurs', href: '/fournisseurs', icon: Truck, keywords: ['livreurs'] },
  { label: 'Retours', href: '/retours', icon: RotateCcw, keywords: ['remboursements'] },
  { label: 'Paiements', href: '/paiements', icon: CreditCard },
  { label: 'Fidélité', href: '/fidelite', icon: Gift, keywords: ['points', 'avoir'] },
  { label: 'Finances', href: '/finances', icon: Wallet, keywords: ['trésorerie', 'caisse'] },
  { label: 'Rapports', href: '/rapports', icon: BarChart3, keywords: ['statistiques'] },
  { label: 'Boutique', href: '/parametres/boutique', icon: Settings },
  { label: 'Utilisateurs', href: '/parametres/utilisateurs', icon: Users },
  { label: 'Permissions', href: '/parametres/permissions', icon: Settings },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
];

export function RechercheGlobale() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const resultats = query.trim()
    ? ROUTES.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.label.toLowerCase().includes(q) ||
          r.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : ROUTES;

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <>
      {/* Input déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden md:flex w-full max-w-md items-center h-9 gap-2 rounded-md border border-transparent bg-secondary px-3 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors text-left"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">
          Rechercher un module, une action...
        </span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Bouton icône mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>

          {/* Champ de recherche */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Résultats */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {resultats.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour « {query} »
              </div>
            ) : (
              <ul className="space-y-0.5">
                {resultats.map((r) => {
                  const Icone = r.icon;
                  return (
                    <li key={r.href}>
                      <button
                        type="button"
                        onClick={() => onSelect(r.href)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
                      >
                        <Icone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1">{r.label}</span>
                        <kbd className="text-[10px] text-muted-foreground">
                          ↵
                        </kbd>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-[10px] text-muted-foreground">
            <span>{resultats.length} résultat{resultats.length > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border px-1 py-0.5">↵</kbd> Ouvrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border px-1 py-0.5">Échap</kbd> Fermer
              </span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}