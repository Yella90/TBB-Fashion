'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Package,
  User, UserX, DollarSign, CheckCircle2, AlertCircle, X,
  Receipt, ArrowLeft, Gift,
} from 'lucide-react';
import Link from 'next/link';

import type { VenteInput, LigneVenteInput } from '@/lib/validations/vente.schema';
import { MODES_PAIEMENT } from '@/types/vente';
import type { ModePaiement } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  creerVente,
  rechercherVariantesPourVente,
} from '@/lib/services/ventes.actions';

import {
  SelecteurVariante,
  type VarianteSelection,
} from '@/components/ventes/selecteur-variante';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs';

type Client = {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  solde_avoir?: number;
};

type Props = {
  clients: Client[];
};

export function FormulaireVente({ clients }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('produits');

  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<any[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(true);

  const [varianteSelectionnee, setVarianteSelectionnee] =
    useState<VarianteSelection | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [lignes, setLignes] = useState<LigneVenteInput[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('especes');
  const [remiseGlobale, setRemiseGlobale] = useState(0);
  const [montantPaye, setMontantPaye] = useState(0);
  const [avoirUtilise, setAvoirUtilise] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        setRechercheEnCours(true);
        try {
          const res = await rechercherVariantesPourVente(recherche);
          setResultats(res);
        } catch (err) {
          console.error('Erreur recherche:', err);
          setResultats([]);
        } finally {
          setRechercheEnCours(false);
        }
      },
      recherche.length < 2 ? 0 : 300
    );
    return () => clearTimeout(timer);
  }, [recherche]);

  const sousTotal = useMemo(
    () => lignes.reduce((s, l) => s + l.sous_total, 0),
    [lignes]
  );
  const total = sousTotal - remiseGlobale;
  const totalCouvert = montantPaye + avoirUtilise;
  const reste = total - totalCouvert;
  const monnaie = totalCouvert - total;

  // Solde avoir du client sélectionné
  const clientSelectionne = clients.find((c) => c.id === clientId);
  const soldeAvoirClient = clientSelectionne?.solde_avoir ?? 0;

  // Reset avoir si pas de client
  useEffect(() => {
    if (!clientId) setAvoirUtilise(0);
  }, [clientId]);

  // Recalculer montant payé quand total change
  useEffect(() => {
    const dejaCouvert = avoirUtilise;
    setMontantPaye(Math.max(total - dejaCouvert, 0));
  }, [total, avoirUtilise]);

  const ouvrirModalVariante = (v: any) => {
    setVarianteSelectionnee({
      variante_id: v.id,
      produit_nom: v.produit?.nom ?? 'Produit',
      produit_marque: v.produit?.marque ?? null,
      pointure: v.pointure,
      couleur: v.couleur,
      prix_unitaire: v.prix_vente,
      stock_disponible: v.stock?.quantite ?? 0,
    });
    setModalOpen(true);
  };

  const ajouterAuPanier = (quantite: number, prixUnitaire: number) => {
    if (!varianteSelectionnee) return;

    const existante = lignes.findIndex(
      (l) => l.variante_id === varianteSelectionnee.variante_id
    );

    if (existante >= 0) {
      const nouvelleQuantite = lignes[existante].quantite + quantite;
      if (nouvelleQuantite > varianteSelectionnee.stock_disponible) {
        toast.error('Stock insuffisant', {
          description: `Il ne reste que ${varianteSelectionnee.stock_disponible} en stock.`,
        });
        return;
      }
      const nouvelles = [...lignes];
      nouvelles[existante] = {
        ...nouvelles[existante],
        quantite: nouvelleQuantite,
        sous_total: nouvelleQuantite * prixUnitaire,
      };
      setLignes(nouvelles);
    } else {
      setLignes([
        ...lignes,
        {
          variante_id: varianteSelectionnee.variante_id,
          quantite,
          prix_unitaire: prixUnitaire,
          remise: 0,
          sous_total: quantite * prixUnitaire,
          produit_nom: varianteSelectionnee.produit_nom,
          pointure: varianteSelectionnee.pointure,
          couleur: varianteSelectionnee.couleur,
          stock_disponible: varianteSelectionnee.stock_disponible,
        },
      ]);
    }

    toast.success('Article ajoute', {
      description: `${varianteSelectionnee.produit_nom} · ${varianteSelectionnee.pointure} x${quantite}`,
    });

    setModalOpen(false);
    setVarianteSelectionnee(null);
  };

  const modifierQuantite = (index: number, delta: number) => {
    const ligne = lignes[index];
    const nouvelleQuantite = ligne.quantite + delta;

    if (nouvelleQuantite <= 0) {
      retirerLigne(index);
      return;
    }

    if (
      ligne.stock_disponible !== undefined &&
      nouvelleQuantite > ligne.stock_disponible
    ) {
      toast.error('Stock insuffisant', {
        description: `Maximum ${ligne.stock_disponible} disponible.`,
      });
      return;
    }

    const nouvelles = [...lignes];
    nouvelles[index] = {
      ...ligne,
      quantite: nouvelleQuantite,
      sous_total: nouvelleQuantite * ligne.prix_unitaire,
    };
    setLignes(nouvelles);
  };

  const retirerLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const viderPanier = () => {
    if (lignes.length === 0) return;
    setLignes([]);
    setAvoirUtilise(0);
    setMontantPaye(0);
    toast.info('Panier vide');
  };

  const handleSubmit = async () => {
    if (lignes.length === 0) {
      toast.error('Panier vide', {
        description: 'Ajoutez au moins un article.',
      });
      return;
    }

    if (avoirUtilise > soldeAvoirClient) {
      toast.error('Avoir insuffisant');
      return;
    }

    if (reste > 0 && !clientId) {
      toast.error('Client requis', {
        description: 'Sélectionnez un client pour une vente à crédit.',
      });
      return;
    }

    setIsSubmitting(true);

    const input: VenteInput = {
      client_id: clientId,
      lignes,
      remise: remiseGlobale,
      tva: 0,
      mode_paiement: modePaiement,
      montant_paye: montantPaye,
      avoir_utilise: avoirUtilise,
      notes,
    };

    const res = await creerVente(input);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error('Erreur lors de la vente', { description: res.error });
      return;
    }

    toast.success('Vente enregistree 🎉', {
      description: `Total : ${formatCurrency(total)}`,
    });

    router.push('/ventes');
    router.refresh();
  };

  const getClientLabel = (c: Client) => {
    const nom = [c.nom, c.prenom].filter(Boolean).join(' ');
    return c.telephone ? `${nom} · ${c.telephone}` : nom;
  };

  return (
    <>
      <div className="pb-32 lg:pb-0">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 shrink-0 mt-0.5"
            >
              <Link href="/ventes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
                Nouvelle vente
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                Selectionnez les articles puis encaissez
              </p>
            </div>
            {lignes.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={viderPanier}
                className="gap-1.5 text-muted-foreground shrink-0 hidden sm:flex"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vider
              </Button>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="lg:hidden"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 p-1">
              <TabsTrigger value="produits" className="gap-1.5 text-xs">
                <Package className="h-4 w-4" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="panier" className="gap-1.5 text-xs">
                <ShoppingCart className="h-4 w-4" />
                Panier
                {lignes.length > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px] font-bold ml-1">
                    {lignes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
            {/* PRODUITS */}
            <div
              className={`lg:col-span-3 space-y-4 ${
                activeTab === 'panier' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit, une marque, une reference..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-9 h-12 text-sm"
                />
                {recherche && (
                  <button
                    type="button"
                    onClick={() => setRecherche('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Card className="lg:min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {recherche.length >= 2
                        ? `${resultats.length} resultat${resultats.length > 1 ? 's' : ''}`
                        : `Produits disponibles (${resultats.length})`}
                    </span>
                    {rechercheEnCours && (
                      <span className="text-xs text-muted-foreground">
                        Chargement...
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  {resultats.length === 0 && !rechercheEnCours ? (
                    <div className="text-center py-12">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="mt-3 text-sm font-medium">
                        {recherche.length >= 2
                          ? 'Aucun resultat'
                          : 'Aucun produit disponible'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {resultats.map((v: any) => {
                        const stock = v.stock?.quantite ?? 0;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => ouvrirModalVariante(v)}
                            disabled={stock === 0}
                            className="group text-left rounded-xl border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold">
                                {v.pointure}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {v.produit?.nom ?? 'Produit'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {v.produit?.marque && `${v.produit.marque} · `}
                                  {v.couleur}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-primary">
                                    {formatCurrency(v.prix_vente)}
                                  </span>
                                  <Badge
                                    className={`text-[10px] ${
                                      stock === 0
                                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0'
                                        : stock <= 3
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0'
                                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0'
                                    }`}
                                  >
                                    {stock} en stock
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* PANIER + PAIEMENT */}
            <div
              className={`lg:col-span-2 space-y-4 ${
                activeTab === 'produits' ? 'hidden lg:block' : ''
              }`}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Panier
                      {lignes.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] font-bold"
                        >
                          {lignes.length}
                        </Badge>
                      )}
                    </CardTitle>
                    {lignes.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={viderPanier}
                        className="gap-1 text-muted-foreground h-7"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {lignes.length === 0 ? (
                    <div className="p-8 text-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="mt-3 text-sm font-medium">Panier vide</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ajoutez des articles depuis la recherche.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y max-h-[340px] overflow-y-auto">
                      {lignes.map((l, i) => (
                        <li key={i} className="p-3 hover:bg-secondary/30">
                          <div className="flex items-start gap-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white text-xs font-bold">
                              {l.pointure}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {l.produit_nom ?? 'Produit'}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {l.couleur} · {formatCurrency(l.prix_unitaire)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                  onClick={() => retirerLigne(i)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => modifierQuantite(i, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs font-semibold w-6 text-center">
                                    {l.quantite}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => modifierQuantite(i, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span className="text-xs font-bold">
                                  {formatCurrency(l.sous_total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {lignes.length > 0 && (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 bg-secondary/30 border-b">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Encaissement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Client */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Client
                      </Label>
                      <Select
                        value={clientId ?? 'passage'}
                        onValueChange={(v) =>
                          setClientId(v === 'passage' ? null : v)
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Choisir un client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passage">
                            <span className="flex items-center gap-2">
                              <UserX className="h-3.5 w-3.5" />
                              Client de passage
                            </span>
                          </SelectItem>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {getClientLabel(c)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {clientSelectionne && soldeAvoirClient > 0 && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-2 flex items-center gap-2">
                          <Gift className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            Avoir disponible :{' '}
                            <strong>{formatCurrency(soldeAvoirClient)}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Totaux */}
                    <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Sous-total
                        </span>
                        <span className="font-medium">
                          {formatCurrency(sousTotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">
                          Remise
                        </span>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={500}
                          value={remiseGlobale}
                          onChange={(e) =>
                            setRemiseGlobale(Number(e.target.value) || 0)
                          }
                          className="h-7 text-right text-xs w-24"
                        />
                      </div>

                      <div className="border-t pt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>

                    {/* Mode paiement */}
                    <div className="space-y-2">
                      <Label className="text-sm">Mode de paiement</Label>
                      <Select
                        value={modePaiement}
                        onValueChange={(v) =>
                          setModePaiement(v as ModePaiement)
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MODES_PAIEMENT.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Avoir à utiliser */}
                    {clientSelectionne && soldeAvoirClient > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-1.5">
                          <Gift className="h-3.5 w-3.5 text-blue-500" />
                          Avoir à utiliser (max {formatCurrency(Math.min(soldeAvoirClient, total))})
                        </Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={Math.min(soldeAvoirClient, total)}
                          step={500}
                          value={avoirUtilise}
                          onChange={(e) => {
                            const val = Math.min(
                              Math.max(Number(e.target.value) || 0, 0),
                              Math.min(soldeAvoirClient, total)
                            );
                            setAvoirUtilise(val);
                          }}
                          className="h-11 text-base font-bold"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setAvoirUtilise(
                                Math.min(soldeAvoirClient, total)
                              )
                            }
                          >
                            Utiliser tout l&apos;avoir
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setAvoirUtilise(0)}
                          >
                            Aucun
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Montant payé */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        Montant paye (FCFA)
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        value={montantPaye}
                        onChange={(e) =>
                          setMontantPaye(Number(e.target.value) || 0)
                        }
                        className="h-11 text-base font-bold"
                      />

                      <div className="flex gap-1.5 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setMontantPaye(Math.max(total - avoirUtilise, 0))
                          }
                        >
                          Exact
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setMontantPaye(
                              Math.ceil((total - avoirUtilise) / 1000) * 1000
                            )
                          }
                        >
                          Arrondi
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setMontantPaye(0)}
                        >
                          0 (credit)
                        </Button>
                      </div>
                    </div>

                    {/* Reste / Monnaie */}
                    {reste > 0 && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-400">
                          <p>
                            Reste a payer :{' '}
                            <strong>{formatCurrency(reste)}</strong>
                          </p>
                          {!clientId && (
                            <p className="mt-1">
                              ⚠️ Selectionnez un client pour enregistrer la
                              dette
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {monnaie > 0 && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-700 dark:text-emerald-400">
                          Monnaie a rendre
                        </span>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(monnaie)}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm">
                        Notes (optionnel)
                      </Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Remarques sur la vente..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <LoadingButton
                      type="button"
                      loading={isSubmitting}
                      onClick={handleSubmit}
                      className="w-full h-12 gap-2 hidden lg:flex"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Valider la vente · {formatCurrency(total)}
                    </LoadingButton>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {lignes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-md p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total · {lignes.length} article{lignes.length > 1 ? 's' : ''}
              </p>
              <p className="text-base font-bold text-primary truncate">
                {formatCurrency(total)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('panier')}
              className="h-12 shrink-0"
              size="icon"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <LoadingButton
              type="button"
              loading={isSubmitting}
              onClick={handleSubmit}
              className="h-12 gap-1.5 shrink-0 px-4"
            >
              <CheckCircle2 className="h-4 w-4" />
              Valider
            </LoadingButton>
          </div>
        </div>
      )}

      <SelecteurVariante
        variante={varianteSelectionnee}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={ajouterAuPanier}
      />
    </>
  );
}