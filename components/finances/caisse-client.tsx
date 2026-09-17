'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  HandCoins,
  Unlock,
  Lock,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import type { Caisse } from '@/types/finance';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  ouvrirCaisse,
  cloturerCaisse,
} from '@/lib/services/finances.actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export function CaisseClient({
  caisse,
  historique,
}: {
  caisse: Caisse | null;
  historique: Caisse[];
}) {
  const router = useRouter();
  const [fondOuverture, setFondOuverture] = useState(0);
  const [soldeReel, setSoldeReel] = useState(caisse?.solde_theorique ?? 0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const estOuverte = caisse && caisse.solde_reel === null;

  const handleOuvrir = async () => {
    setLoading(true);
    const res = await ouvrirCaisse(fondOuverture);
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }
    toast.success('Caisse ouverte pour aujourd\'hui');
    router.refresh();
  };

  const handleCloturer = async () => {
    setLoading(true);
    const res = await cloturerCaisse({
      fond_ouverture: caisse?.fond_ouverture ?? 0,
      solde_reel: soldeReel,
      notes,
    });
    setLoading(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }
    toast.success('Caisse clôturée ✅');
    setNotes('');
    router.refresh();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-5">
      {/* Caisse du jour */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-primary" />
            Caisse du jour
          </CardTitle>
          <CardDescription className="text-xs">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!caisse ? (
            /* Pas de caisse ouverte → ouvrir */
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <Unlock className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="mt-3 text-sm font-medium">
                  Aucune caisse ouverte
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Commencez votre journée en enregistrant le fond de caisse.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fond" className="text-sm">
                  Fond de caisse (FCFA)
                </Label>
                <Input
                  id="fond"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={fondOuverture}
                  onChange={(e) => setFondOuverture(Number(e.target.value) || 0)}
                  className="h-11 text-base font-bold"
                />
              </div>

              <Button
                onClick={handleOuvrir}
                disabled={loading}
                className="w-full h-12 gap-2"
              >
                <Unlock className="h-4 w-4" />
                Ouvrir la caisse
              </Button>
            </div>
          ) : estOuverte ? (
            /* Caisse ouverte → clôturer */
            <div className="space-y-4">
              {/* Récap */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Fond d&apos;ouverture
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {formatCurrency(caisse.fond_ouverture)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Solde théorique
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatCurrency(caisse.solde_theorique)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Entrées</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(caisse.entrees)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border p-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Sorties</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(caisse.sorties)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="soldeReel" className="text-sm">
                  Solde réel en caisse (FCFA)
                </Label>
                <Input
                  id="soldeReel"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={soldeReel}
                  onChange={(e) => setSoldeReel(Number(e.target.value) || 0)}
                  className="h-11 text-base font-bold"
                />

                {soldeReel !== caisse.solde_theorique && (
                  <div
                    className={`rounded-lg p-3 flex items-center gap-2 ${
                      soldeReel > caisse.solde_theorique
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900'
                    }`}
                  >
                    <AlertCircle
                      className={`h-4 w-4 shrink-0 ${
                        soldeReel > caisse.solde_theorique
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    />
                    <p
                      className={`text-xs ${
                        soldeReel > caisse.solde_theorique
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      Écart :{' '}
                      <strong>
                        {soldeReel > caisse.solde_theorique ? '+' : ''}
                        {formatCurrency(soldeReel - caisse.solde_theorique)}
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesCaisse" className="text-sm">
                  Notes (optionnel)
                </Label>
                <Textarea
                  id="notesCaisse"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  placeholder="Remarques sur la journée…"
                />
              </div>

              <LoadingButton
                onClick={handleCloturer}
                loading={loading}
                className="w-full h-12 gap-2"
              >
                <Lock className="h-4 w-4" />
                Clôturer la caisse
              </LoadingButton>
            </div>
          ) : (
            /* Caisse déjà clôturée */
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Caisse clôturée
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Solde théorique</p>
                  <p className="text-base font-bold">
                    {formatCurrency(caisse.solde_theorique)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Solde réel</p>
                  <p className="text-base font-bold">
                    {formatCurrency(caisse.solde_reel ?? 0)}
                  </p>
                </div>
              </div>

              {caisse.ecart !== null && caisse.ecart !== 0 && (
                <div
                  className={`rounded-lg p-3 text-center ${
                    caisse.ecart > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/30'
                      : 'bg-red-50 dark:bg-red-950/30'
                  }`}
                >
                  <p className="text-xs text-muted-foreground">Écart</p>
                  <p
                    className={`text-lg font-bold ${
                      caisse.ecart > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {caisse.ecart > 0 ? '+' : ''}
                    {formatCurrency(caisse.ecart)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      {historique.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Historique</CardTitle>
            <CardDescription className="text-xs">
              {historique.length} dernière{historique.length > 1 ? 's' : ''} caisse{historique.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {historique.map((c) => {
                const ecart = c.ecart ?? 0;
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize truncate">
                        {formatDate(c.date_jour)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Entrées : {formatCurrency(c.entrees, { compact: true })} ·
                        Sorties : {formatCurrency(c.sorties, { compact: true })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">
                        {formatCurrency(c.solde_reel ?? c.solde_theorique)}
                      </p>
                      {ecart !== 0 && (
                        <p
                          className={`text-[10px] font-medium ${
                            ecart > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          Écart : {ecart > 0 ? '+' : ''}
                          {formatCurrency(ecart, { compact: true })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}