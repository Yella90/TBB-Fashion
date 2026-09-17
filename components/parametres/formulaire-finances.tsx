'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Calculator,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Eye,
  Info,
} from 'lucide-react';
import Link from 'next/link';

import {
  parametresFinanceSchema,
  type ParametresFinanceInput,
} from '@/lib/validations/parametres.schema';
import type { ParametresBoutique } from '@/types/parametres';
import {
  MODES_FINANCE,
  BASES_ACHATS,
  MARGES_CREDIT,
  PERIODES_FINANCE,
} from '@/types/parametres';
import { updateParametresFinance } from '@/lib/services/parametres.actions';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  parametres: ParametresBoutique;
};

export function FormulaireFinances({ parametres }: Props) {
  const router = useRouter();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ParametresFinanceInput>({
    resolver: zodResolver(parametresFinanceSchema),
    defaultValues: {
      finance_mode_defaut: parametres.finance_mode_defaut,
      finance_montrer_resultat: parametres.finance_montrer_resultat,
      finance_montrer_tresorerie: parametres.finance_montrer_tresorerie,
      finance_inclure_achats: parametres.finance_inclure_achats,
      finance_base_achats: parametres.finance_base_achats,
      finance_marge_credit: parametres.finance_marge_credit,
      finance_periode_defaut: parametres.finance_periode_defaut,
      finance_toggle_visible: parametres.finance_toggle_visible,
    },
  });

  const modeDefaut = watch('finance_mode_defaut');
  const montrerResultat = watch('finance_montrer_resultat');
  const montrerTresorerie = watch('finance_montrer_tresorerie');
  const inclureAchats = watch('finance_inclure_achats');
  const baseAchats = watch('finance_base_achats');
  const margeCredit = watch('finance_marge_credit');
  const periodeDefaut = watch('finance_periode_defaut');
  const toggleVisible = watch('finance_toggle_visible');

  const onSubmit = async (data: ParametresFinanceInput) => {
    const res = await updateParametresFinance(data);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Paramètres enregistrés ✅', {
      description: 'Les calculs financiers utiliseront ces règles.',
    });

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <Button
          type="button"
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
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Configuration financière
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
            Définissez comment les finances sont calculées
          </p>
        </div>
      </div>

      {/* Bannière info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Ces paramètres s&apos;appliquent à <strong>tous les calculs financiers</strong>{' '}
          de l&apos;application (Finances, Rapports, Tableau de bord).
          Modifiez-les uniquement si vous savez ce que vous faites.
        </p>
      </div>

      {/* Affichage des onglets */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-3.5 w-3.5" />
            </div>
            Affichage
          </CardTitle>
          <CardDescription className="text-xs">
            Quels onglets sont visibles dans la page Finances
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={montrerResultat}
              onChange={(e) =>
                setValue('finance_montrer_resultat', e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-border accent-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Onglet « Résultat »</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marge sur ventes + autres revenus − charges
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={montrerTresorerie}
              onChange={(e) =>
                setValue('finance_montrer_tresorerie', e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-border accent-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Onglet « Trésorerie »</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Encaissements − décaissements réels
              </p>
            </div>
          </label>

          {!montrerResultat && !montrerTresorerie && (
            <p className="text-xs text-destructive">
              ⚠️ Au moins un onglet doit être affiché
            </p>
          )}

          {/* Mode par défaut */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-medium">
              Onglet ouvert par défaut
            </Label>
            <Select
              value={modeDefaut}
              onValueChange={(v) =>
                setValue('finance_mode_defaut', v as any, { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES_FINANCE.filter((m) =>
                  m.value === 'resultat' ? montrerResultat : montrerTresorerie
                ).map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mode de calcul */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="h-3.5 w-3.5" />
            </div>
            Mode de calcul
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Marge sur crédit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Marge sur ventes à crédit
            </Label>
            <Select
              value={margeCredit}
              onValueChange={(v) =>
                setValue('finance_marge_credit', v as any, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARGES_CREDIT.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Base des achats */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              Base des achats (trésorerie)
            </Label>
            <Select
              value={baseAchats}
              onValueChange={(v) =>
                setValue('finance_base_achats', v as any, { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASES_ACHATS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    <div>
                      <p className="font-medium">{b.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.description}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Période par défaut */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Période par défaut
            </Label>
            <Select
              value={periodeDefaut}
              onValueChange={(v) =>
                setValue('finance_periode_defaut', v as any, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODES_FINANCE.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dépenses */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/30 border-b">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            Traitement des achats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={inclureAchats}
              onChange={(e) =>
                setValue('finance_inclure_achats', e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-border accent-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Inclure les achats dans les dépenses
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applicable uniquement dans la vue « Trésorerie ».
                La vue « Résultat » utilise toujours la marge (sans double comptage).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={toggleVisible}
              onChange={(e) =>
                setValue('finance_toggle_visible', e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-border accent-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Afficher le toggle « Achats » dans l&apos;interface
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permet à l&apos;utilisateur d&apos;activer/désactiver les achats
                à la volée dans la vue Trésorerie
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Aperçu du calcul */}
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="pb-3 bg-primary/5 border-b border-primary/20">
          <CardTitle className="text-sm lg:text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-tbb text-white">
              <Calculator className="h-3.5 w-3.5" />
            </div>
            Aperçu des calculs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          {/* Vue Résultat */}
          {montrerResultat && (
            <div className="rounded-lg border p-3">
              <p className="font-semibold mb-2">📊 Vue Résultat</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  • Marge sur ventes ={' '}
                  <span className="text-foreground">
                    Σ (prix vente − prix achat) × qté
                  </span>
                </p>
                {margeCredit === 'prorata' && (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠️ Au prorata : seule la part payée est comptée
                  </p>
                )}
                <p>
                  • Autres revenus ={' '}
                  <span className="text-foreground">
                    Σ transactions (type=revenu)
                  </span>
                </p>
                <p>
                  • Charges ={' '}
                  <span className="text-foreground">
                    Σ transactions (type=dépense)
                  </span>
                </p>
                <p className="pt-1 font-medium text-foreground">
                  Résultat = Marge + Autres revenus − Charges
                </p>
              </div>
            </div>
          )}

          {/* Vue Trésorerie */}
          {montrerTresorerie && (
            <div className="rounded-lg border p-3">
              <p className="font-semibold mb-2">💰 Vue Trésorerie</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  • Encaissements ={' '}
                  <span className="text-foreground">
                    Σ ventes.montant_paye + autres revenus
                  </span>
                </p>
                <p>
                  • Décaissements ={' '}
                  <span className="text-foreground">
                    {inclureAchats
                      ? baseAchats === 'paye'
                        ? 'Σ achats.montant_paye'
                        : 'Σ achats.total'
                      : 'Σ charges uniquement'}
                  </span>
                  {inclureAchats && ' + charges'}
                </p>
                <p className="pt-1 font-medium text-foreground">
                  Solde = Encaissements − Décaissements
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pb-4">
        <Button
          type="button"
          variant="outline"
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/parametres">Annuler</Link>
        </Button>
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="gap-2 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          Enregistrer
        </LoadingButton>
      </div>
    </form>
  );
}