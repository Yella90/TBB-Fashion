import Link from 'next/link';
import {
  Store,
  Calculator,
  Users,
  Shield,
  ChevronRight,
  Settings,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Paramètres · TBB Fashion' };

const sections = [
  {
    href: '/parametres/boutique',
    icon: Store,
    title: 'Boutique',
    description: 'Nom, adresse, devise, logo, TVA',
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/parametres/finances',
    icon: Calculator,
    title: 'Configuration financière',
    description: 'Mode de calcul, achats, périodes, résultat vs trésorerie',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    href: '/parametres/utilisateurs',
    icon: Users,
    title: 'Utilisateurs',
    description: 'Comptes, rôles (admin, gérant, vendeur), activation',
    color: 'from-amber-500 to-amber-600',
  },
  {
    href: '/parametres/permissions',
    icon: Shield,
    title: 'Permissions',
    description: 'Droits d\'accès par rôle et par module',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function ParametresPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white shadow-md">
          <Settings className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Paramètres
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configuration générale de TBB Fashion
          </p>
        </div>
      </div>

      {/* Grille des sections */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group"
            >
              <Card className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} text-white shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold truncate">
                          {section.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Info version */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            À propos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Application</span>
            <span className="font-medium text-foreground">TBB Fashion</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Version</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              v1.0
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Devise</span>
            <span className="font-medium text-foreground">FCFA</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}