'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calculator,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Info,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import type { ParametresBoutique, PeriodeFinance } from '@/types/parametres';
import { PERIODES_FINANCE } from '@/types/parametres';
import { formatCurrency } from '@/lib/utils/format-currency';

import { StatCard } from '@/components/dashboard/stat-card';
import { EvolutionSoldeChart } from '@/components/finances/evolution-solde-chart';
import { TableauTransactions } from '@/components/finances/tableau-transactions';
import { ModalTransaction } from '@/components/finances/modal-transaction';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ResultatData = {
  margeVentes: number;
  caVentes: number;
  autresRevenus: number;
  totalRevenus: number;
  charges: number;
  resultatNet: number;
};

type TresorerieData = {
  encaissementsVentes: number;
  autresRevenus: number;
  totalEntrees: number;
  decaissementsAchats: number;
  charges: number;
  totalSorties: number;
  soldeTresorerie: number;
  inclureAchats: boolean;
  baseAchats: 'paye' | 'total';
};

type EvolutionPoint = {
  date: string;
  entrees: number;
  sorties: number;
  solde: number;
};

type Transaction = any;

type Props = {
  parametres: ParametresBoutique;
  periodeInitiale: PeriodeFinance;
  resultatInitial: ResultatData;
  tresorerieInitiale: TresorerieData;
  evolutionResultat: EvolutionPoint[];
  evolutionTresorerie: EvolutionPoint[];
  transactions: Transaction[];
};

export function OngletsFinances({
  parametres,
  periodeInitiale,
  resultatInitial,
  tresorerieInitiale,
  evolutionResultat,
  evolutionTresorerie,
  transactions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vues visibles
  const vuesDisponibles: ('resultat' | 'tresorerie')[] = [];
  if (parametres.finance_montrer_resultat) vuesDisponibles.push('resultat');
  if (parametres.finance_montrer_tresorerie) vuesDisponibles.push('tresorerie');

  // Mode actif (depuis l'URL ou défaut)
  const modeUrl = searchParams.get('mode');
  const modeDefaut =
    vuesDisponibles.includes(parametres.finance_mode_defaut as any)
      ? parametres.finance_mode_defaut
      : vuesDisponibles[0];

  const [mode, setMode] = useState<'resultat' | 'tresorerie'>(
    vuesDisponibles.includes(modeUrl as any)
      ? (modeUrl as 'resultat' | 'tresorerie')
      : modeDefaut
  );

  const [periode, setPeriode] = useState<PeriodeFinance>(periodeInitiale);

  // Toggle achats (local au client, synchronisé avec les params)
  const [inclureAchats, setInclureAchats] = useState(
    tresorerieInitiale.inclureAchats
  );

  // Données actuelles
  const [resultat, setResultat] = useState(resultatInitial);
  const [tresorerie, setTresorerie] = useState(tresorerieInitiale);
  const [evolutionRes, setEvolutionRes] =
    useState<EvolutionPoint[]>(evolutionResultat);
  const [evolutionTre, setEvolutionTre] =
    useState<EvolutionPoint[]>(evolutionTresorerie);

  const [refreshing, setRefreshing] = useState(false);

  // Recharger au changement de période ou toggle
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setRefreshing(true);
      try {
        const res = await fetch(
          `/api/finances/stats?periode=${periode}&mode=${mode}&inclureAchats=${inclureAchats}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.resultat) {
          setResultat(data.resultat);
          setEvolutionRes(data.evolutionResultat ?? []);
        }
        if (data.tresorerie) {
          setTresorerie(data.tresorerie);
          setEvolutionTre(data.evolutionTresorerie ?? []);
        }
      } catch (err) {
        console.error('Erreur refresh:', err);
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [periode, mode, inclureAchats]);

  // On synchronise le toggle avec la valeur reçue du serveur
  useEffect(() => {
    setInclureAchats(tresorerieInitiale.inclureAchats);
  }, [tresorerieInitiale.inclureAchats]);

  const evolution = mode === 'resultat' ? evolutionRes : evolutionTre;

  const periodeLabel =
    PERIODES_FINANCE.find((p) => p.value === periode)?.label ?? periode;

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Finances
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {parametres.finance_mode_defaut === 'resultat'
              ? 'Résultat analytique'
              : 'Trésorerie temps réel'}{' '}
            · {periodeLabel}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {refreshing && (
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          )}
          <ModalTransaction />
        </div>
      </div>

      {/* Filtre période */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
        {PERIODES_FINANCE.map((p) => (
          <Button
            key={p.value}
            variant={periode === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriode(p.value)}
            className="h-8 text-xs shrink-0"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Onglets */}
      {vuesDisponibles.length > 1 ? (
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as 'resultat' | 'tresorerie')}
        >
          <TabsList className="grid w-full grid-cols-2 h-12 p-1">
            <TabsTrigger value="resultat" className="gap-1.5 text-xs sm:text-sm">
              <Calculator className="h-4 w-4" />
              Résultat
            </TabsTrigger>
            <TabsTrigger value="tresorerie" className="gap-1.5 text-xs sm:text-sm">
              <Wallet className="h-4 w-4" />
              Trésorerie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resultat" className="mt-4 space-y-5">
            <VueResultatContenu
              data={resultat}
              parametres={parametres}
            />
            <EvolutionSoldeChart data={evolutionRes} mode="resultat" />
          </TabsContent>

          <TabsContent value="tresorerie" className="mt-4 space-y-5">
            <VueTresorerieContenu
              data={tresorerie}
              parametres={parametres}
              inclureAchats={inclureAchats}
              onToggleAchats={setInclureAchats}
            />
            <EvolutionSoldeChart data={evolutionTre} mode="tresorerie" />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-5">
          {vuesDisponibles[0] === 'resultat' ? (
            <>
              <VueResultatContenu data={resultat} parametres={parametres} />
              <EvolutionSoldeChart data={evolutionRes} mode="resultat" />
            </>
          ) : (
            <>
              <VueTresorerieContenu
                data={tresorerie}
                parametres={parametres}
                inclureAchats={inclureAchats}
                onToggleAchats={setInclureAchats}
              />
              <EvolutionSoldeChart data={evolutionTre} mode="tresorerie" />
            </>
          )}
        </div>
      )}

      {/* Dernières transactions */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Dernières transactions
              </CardTitle>
              <CardDescription className="text-xs">
                {transactions.length} transaction
                {transactions.length > 1 ? 's' : ''} manuelle
                {transactions.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <ModalTransaction
              triggerLabel="Ajouter"
              triggerVariant="outline"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TableauTransactions transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Vue RÉSULTAT
// ============================================
function VueResultatContenu({
  data,
  parametres,
}: {
  data: ResultatData;
  parametres: ParametresBoutique;
}) {
  const positif = data.resultatNet >= 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Marge sur ventes"
          value={formatCurrency(data.margeVentes, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`sur ${formatCurrency(data.caVentes, { compact: true })} de CA`}
        />
        <StatCard
          label="Autres revenus"
          value={formatCurrency(data.autresRevenus, { compact: true })}
          icon={<DollarSign className="h-5 w-5" />}
          description="manuels"
        />
        <StatCard
          label="Charges"
          value={formatCurrency(data.charges, { compact: true })}
          icon={<TrendingDown className="h-5 w-5" />}
          description="dépenses d'exploitation"
        />
        <StatCard
          label={positif ? 'Résultat net' : 'Déficit'}
          value={formatCurrency(Math.abs(data.resultatNet), { compact: true })}
          icon={<Calculator className="h-5 w-5" />}
          description={positif ? 'bénéfice' : 'à surveiller'}
        />
      </div>

      {/* Détail du calcul */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Détail du calcul
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Marge sur ventes
                {parametres.finance_marge_credit === 'prorata' && (
                  <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400">
                    (au prorata)
                  </span>
                )}
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                + {formatCurrency(data.margeVentes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Autres revenus</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                + {formatCurrency(data.autresRevenus)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total revenus</span>
              <span className="font-semibold">
                {formatCurrency(data.totalRevenus)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">Charges</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                − {formatCurrency(data.charges)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-base">
              <span className="font-bold">Résultat net</span>
              <span
                className={`font-bold ${
                  positif
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(data.resultatNet)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Vue TRÉSORERIE
// ============================================
function VueTresorerieContenu({
  data,
  parametres,
  inclureAchats,
  onToggleAchats,
}: {
  data: TresorerieData;
  parametres: ParametresBoutique;
  inclureAchats: boolean;
  onToggleAchats: (v: boolean) => void;
}) {
  const positif = data.soldeTresorerie >= 0;

  return (
    <div className="space-y-4">
      {/* Toggle achats */}
      {parametres.finance_toggle_visible && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Inclure les achats</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Base :{' '}
                  {data.baseAchats === 'paye' ? 'montant payé' : 'montant total'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleAchats(!inclureAchats)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                inclureAchats ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
                  inclureAchats ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Encaissements"
          value={formatCurrency(data.totalEntrees, { compact: true })}
          icon={<TrendingUp className="h-5 w-5" />}
          description="ventes + autres"
        />
        <StatCard
          label="Achats"
          value={
            inclureAchats
              ? formatCurrency(data.decaissementsAchats, { compact: true })
              : '—'
          }
          icon={<ShoppingBag className="h-5 w-5" />}
          description={inclureAchats ? data.baseAchats : 'exclus'}
        />
        <StatCard
          label="Charges"
          value={formatCurrency(data.charges, { compact: true })}
          icon={<TrendingDown className="h-5 w-5" />}
          description="dépenses"
        />
        <StatCard
          label={positif ? 'Solde trésorerie' : 'Déficit'}
          value={formatCurrency(Math.abs(data.soldeTresorerie), {
            compact: true,
          })}
          icon={<Wallet className="h-5 w-5" />}
          description={positif ? 'cash disponible' : 'à surveiller'}
        />
      </div>

      {/* Détail du calcul */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Détail du calcul
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Encaissements ventes
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                + {formatCurrency(data.encaissementsVentes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Autres revenus</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                + {formatCurrency(data.autresRevenus)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total entrées</span>
              <span className="font-semibold">
                {formatCurrency(data.totalEntrees)}
              </span>
            </div>

            {inclureAchats && (
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">
                  Achats
                  <span className="ml-2 text-[10px]">
                    ({data.baseAchats === 'paye' ? 'payé' : 'total'})
                  </span>
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  − {formatCurrency(data.decaissementsAchats)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">Charges</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                − {formatCurrency(data.charges)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total sorties</span>
              <span className="font-semibold">
                {formatCurrency(data.totalSorties)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-base">
              <span className="font-bold">Solde trésorerie</span>
              <span
                className={`font-bold ${
                  positif
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(data.soldeTresorerie)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}