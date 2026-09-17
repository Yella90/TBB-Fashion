import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Wallet,
  Smartphone,
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'TBB Fashion · Gestion de boutique de chaussures',
  description:
    'Application de gestion de boutique de chaussures : ventes, stock, clients, fidélité, finances.',
};

const fonctionnalites = [
  {
    icon: ShoppingCart,
    title: 'Ventes rapides',
    description:
      'Encaissez en quelques clics. Panier intelligent, remises, paiements multiples et tickets PDF.',
  },
  {
    icon: Package,
    title: 'Stock par pointure',
    description:
      'Suivez chaque paire par pointure et couleur. Alertes automatiques de stock bas.',
  },
  {
    icon: Users,
    title: 'Clients & fidélité',
    description:
      'Fiches clients, historiques, dettes, avoirs et programme de points fidélité.',
  },
  {
    icon: Wallet,
    title: 'Finances claires',
    description:
      'Trésorerie temps réel, marge réelle, caisse journalière. Résultat ou trésorerie au choix.',
  },
  {
    icon: BarChart3,
    title: 'Rapports détaillés',
    description:
      'Top produits, meilleurs clients, évolution du CA. Exports PDF et analyses.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    description:
      'Travaillez depuis un téléphone, une tablette ou un PC. Interface pensée pour chaque écran.',
  },
];

const avantages = [
  'Interface rapide et intuitive',
  'Fonctionne sur téléphone et tablette',
  'Suivi des dettes clients',
  'Gestion des retours et avoirs',
  'Programme de fidélité intégré',
  'Exports PDF professionnels',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-tbb text-white font-bold text-sm shadow-sm">
              TBB
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">
                TBB Fashion
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Chaussures
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/connexion">Connexion</Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/inscription">
                Commencer
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                Gestion de boutique nouvelle génération
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Gérez votre boutique
                <span className="block text-primary">de chaussures</span>
                sans effort.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Ventes, stock par pointure, clients, dettes, fidélité et
                finances — tout dans une seule application, pensée pour votre
                quotidien.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/inscription">
                    Créer mon compte
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/connexion">Se connecter</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Gratuit pour commencer
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Sans installation
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Données sécurisées
                </span>
              </div>
            </div>

            {/* Mockup / Preview */}
            <div className="relative">
              <div className="rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-2xl">
                <div className="rounded-xl bg-secondary/50 p-4 space-y-4">
                  {/* Fausse stat */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-tbb text-white">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Ventes du jour</p>
                        <p className="text-[10px] text-muted-foreground">
                          Aujourd&apos;hui
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">125 000</p>
                  </div>

                  {/* Fausses lignes */}
                  <div className="space-y-2">
                    {[
                      { nom: 'Air Max 90', q: 2, prix: 45_000 },
                      { nom: 'Stan Smith', q: 1, prix: 35_000 },
                      { nom: 'Jordan 1', q: 1, prix: 45_000 },
                    ].map((item) => (
                      <div
                        key={item.nom}
                        className="flex items-center gap-2 rounded-lg bg-background p-2"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-secondary text-[10px] font-bold">
                          {item.q}×
                        </div>
                        <span className="flex-1 text-xs font-medium truncate">
                          {item.nom}
                        </span>
                        <span className="text-xs font-bold">
                          {item.prix.toLocaleString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Faux stock */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                      { l: 'Paires', v: '248' },
                      { l: 'Clients', v: '87' },
                      { l: 'Alertes', v: '3' },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-lg bg-background p-2 text-center"
                      >
                        <p className="text-[9px] text-muted-foreground uppercase">
                          {s.l}
                        </p>
                        <p className="text-sm font-bold">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="border-t bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Une seule application pour gérer toute votre boutique
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fonctionnalites.map((f) => {
              const Icone = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-tbb text-white shadow-sm">
                    <Icone className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Pensé pour les vendeurs de chaussures
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Chaque paire compte. Chaque pointure mérite son propre stock.
                TBB Fashion comprend votre métier.
              </p>

              <ul className="mt-6 space-y-3">
                {avantages.map((a) => (
                  <li key={a} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="rounded-2xl border bg-card p-6 shadow-lg">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-tbb text-white">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">TBB Fashion</p>
                    <p className="text-xs text-muted-foreground">
                      La chaussure qui vous ressemble
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Stock disponible
                    </span>
                    <span className="font-semibold">248 paires</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Clients fidèles
                    </span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Points en circulation
                    </span>
                    <span className="font-semibold">8 450</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Valeur du stock
                    </span>
                    <span className="font-semibold text-primary">
                      3 250 000 FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t bg-gradient-to-br from-primary to-primary/80 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Prêt à simplifier votre boutique ?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Créez votre compte en 30 secondes et commencez à gérer vos ventes
            comme un pro.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="gap-2 w-full sm:w-auto"
            >
              <Link href="/inscription">
                Créer mon compte
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="gap-2 w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/connexion">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded gradient-tbb text-white font-bold text-[10px]">
                TBB
              </div>
              <span>
                © {new Date().getFullYear()} TBB Fashion · Tous droits réservés
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fait avec ❤️ au Mali
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}