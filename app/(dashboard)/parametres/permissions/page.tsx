import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Check,
  X,
  Crown,
  UserCog,
  UserCheck,
  Info,
} from 'lucide-react';

import { PERMISSIONS_PAR_ROLE } from '@/lib/permissions/roles';
import { CATEGORIES_PERMISSIONS } from '@/lib/permissions/categories';
import { ROLES } from '@/types/utilisateur';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata = { title: 'Permissions · TBB Fashion' };

const ICONES_ROLE: Record<string, React.ElementType> = {
  admin: Crown,
  gerant: UserCog,
  vendeur: UserCheck,
};

export default function PermissionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 shrink-0 mt-0.5"
        >
          <Link href="/parametres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permissions
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Matrice des droits par rôle
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          La matrice est <strong>fixe</strong> pour garantir la sécurité.
          Pour changer un rôle, allez dans{' '}
          <Link
            href="/parametres/utilisateurs"
            className="underline font-medium"
          >
            Utilisateurs
          </Link>
          .
        </p>
      </div>

      {/* Légende des rôles */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => {
          const Icone = ICONES_ROLE[r.value] ?? Shield;
          const nb = PERMISSIONS_PAR_ROLE[r.value].length;
          return (
            <Card key={r.value}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white">
                    <Icone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      <strong className="text-primary">{nb}</strong>{' '}
                      permission{nb > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrice */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">
            Matrice détaillée
          </CardTitle>
          <CardDescription className="text-xs">
            {CATEGORIES_PERMISSIONS.reduce(
              (s, c) => s + c.permissions.length,
              0
            )}{' '}
            permissions réparties en {CATEGORIES_PERMISSIONS.length} catégories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary/50 backdrop-blur">
                <tr>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground min-w-[200px]">
                    Permission
                  </th>
                  {ROLES.map((r) => (
                    <th
                      key={r.value}
                      className="text-center p-3 font-medium text-xs text-muted-foreground min-w-[100px]"
                    >
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES_PERMISSIONS.map((cat) => (
                  <>
                    <tr
                      key={cat.label}
                      className="bg-secondary/30 border-t"
                    >
                      <td
                        colSpan={4}
                        className="p-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                      >
                        {cat.label}
                      </td>
                    </tr>
                    {cat.permissions.map((perm) => (
                      <tr
                        key={perm.code}
                        className="border-t hover:bg-secondary/30"
                      >
                        <td className="p-3">
                          <p className="font-medium text-sm">{perm.label}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {perm.code}
                          </p>
                        </td>
                        {ROLES.map((r) => {
                          const a = PERMISSIONS_PAR_ROLE[r.value].includes(
                            perm.code
                          );
                          return (
                            <td key={r.value} className="text-center p-3">
                              {a ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground/50">
                                  <X className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Conseil */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Bonnes pratiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            • <strong className="text-foreground">Admin</strong> : réservé aux
            propriétaires. Donne accès aux paramètres et à la gestion des
            utilisateurs.
          </p>
          <p>
            • <strong className="text-foreground">Gérant</strong> : pour un
            responsable de boutique. Gère tout le quotidien sauf les
            utilisateurs.
          </p>
          <p>
            • <strong className="text-foreground">Vendeur</strong> : pour le
            personnel de vente. Peut créer des ventes, des clients et des
            retours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}