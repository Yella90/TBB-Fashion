'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, Trash2, ShoppingBag, Package,
  Truck, DollarSign, CheckCircle2, AlertCircle, X,
  Receipt, ArrowLeft, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import type { AchatInput, LigneAchatInput } from '@/lib/validations/achat.schema';
import { formatCurrency } from '@/lib/utils/format-currency';
import {
  creerAchat,
  rechercherVariantesPourAchat,
} from '@/lib/services/achats.actions';

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

type Fournisseur = {
  id: string;
  nom: string;
  contact_nom: string | null;
  telephone: string | null;
};

type Props = {
  fournisseurs: Fournisseur[];
};

export function FormulaireAchat({ fournisseurs }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('produits');

  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<any[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(true);

  const [lignes, setLignes] = useState<LigneAchatInput[]>([]);
  const [fournisseurId, setFournisseurId] = useState<string | null>(null);
  const [montantPaye, setMontantPaye] = useState(0);
  const [statut, setStatut] = useState<'recu' | 'en_attente'>('recu');
  const [notes, setNotes] = useState('');
  const [majPrixAchat, setMajPrixAchat] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal quantité + prix pour l'ajout
  const [modalOpen, setModalOpen] = useState(false);
  const [varianteEnAjout, setVarianteEnAjout] = useState<any>(null);
  const [quantiteAjout, setQuantiteAjout] = useState(1);
  const [prixAjout, setPrixAjout] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        setRechercheEnCours(true);
        try {
          const res = await rechercherVariantesPourAchat(recherche);
          setResultats(res);
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
  const reste = sousTotal - montantPaye;

  useEffect(() => {
    setMontantPaye(sousTotal);
  }, [sousTotal]);

  const ouvrirModalAjout = (v: any) => {
    setVarianteEnAjout(v);
    setQuantiteAjout(1);
    setPrixAjout(v.prix_achat || 0);
    setModalOpen(true);
  };

  const confirmerAjout = () => {
    if (!varianteEnAjout || quantiteAjout <= 0) return;

    const existante = lignes.findIndex(
      (l) => l.variante_id === varianteEnAjout.id
    );

    if (existante >= 0) {
      const nouvelles = [...lignes];
      const nouvelleQuantite = nouvelles[existante].quantite + quantiteAjout;
      nouvelles[existante] = {
        ...nouvelles[existante],
        quantite: nouvelleQuantite,
        prix_unitaire: prixAjout,
        sous_total: nouvelleQuantite * prixAjout,
      };
      setLignes(nouvelles);
    } else {
      setLignes([
        ...lignes,
        {
          variante_id: varianteEnAjout.id,
          quantite: quantiteAjout,
          prix_unitaire: prixAjout,
          sous_total: quantiteAjout * prixAjout,
          produit_nom: varianteEnAjout.produit?.nom,
          pointure: varianteEnAjout.pointure,
          couleur: varianteEnAjout.couleur,
        },
      ]);
    }

    toast.success('Article ajouté', {
      description: `${varianteEnAjout.produit?.nom} · P.${varianteEnAjout.pointure} ×${quantiteAjout}`,
    });
    setModalOpen(false);
    setVarianteEnAjout(null);
  };

  const modifierQuantite = (i: number, delta: number) => {
    const nouvelle = lignes[i].quantite + delta;
    if (nouvelle <= 0) return retirerLigne(i);
    const nouvelles = [...lignes];
    nouvelles[i] = {
      ...nouvelles[i],
      quantite: nouvelle,
      sous_total: nouvelle * nouvelles[i].prix_unitaire,
    };
    setLignes(nouvelles);
  };

  const retirerLigne = (i: number) => setLignes(lignes.filter((_, x) => x !== i));

  const handleSubmit = async () => {
    if (lignes.length === 0) {
      toast.error('Panier vide');
      return;
    }

    setIsSubmitting(true);
    const input: AchatInput = {
      fournisseur_id: fournisseurId,
      lignes,
      montant_paye: montantPaye,
      statut,
      notes,
      maj_prix_achat: majPrixAchat,
    };

    const res = await creerAchat(input);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error('Erreur', { description: res.error });
      return;
    }

    toast.success('Achat enregistré 🎉', {
      description: `Total : ${formatCurrency(sousTotal)}`,
    });

    router.push('/achats');
    router.refresh();
  };

  const getFournisseurLabel = (f: Fournisseur) => {
    return f.contact_nom ? `${f.nom} · ${f.contact_nom}` : f.nom;
  };

  return (
    <>
      <div className="pb-32 lg:pb-0">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-start gap-3">
            <Button type="button" variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5">
              <Link href="/achats"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
                Nouvel achat
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                Approvisionnement fournisseur
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:hidden">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1">
              <TabsTrigger value="produits" className="gap-1.5 text-xs">
                <Package className="h-4 w-4" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="panier" className="gap-1.5 text-xs">
                <ShoppingBag className="h-4 w-4" />
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
            {/* Produits */}
            <div className={`lg:col-span-3 space-y-4 ${activeTab === 'panier' ? 'hidden lg:block' : ''}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit…"
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
                        ? `${resultats.length} résultat${resultats.length > 1 ? 's' : ''}`
                        : `Produits disponibles (${resultats.length})`}
                    </span>
                    {rechercheEnCours && (
                      <span className="text-xs text-muted-foreground">Chargement…</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  {resultats.length === 0 && !rechercheEnCours ? (
                    <div className="text-center py-12">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="mt-3 text-sm font-medium">Aucun produit</p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {resultats.map((v: any) => {
                        const stock = v.stock?.quantite ?? 0;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => ouvrirModalAjout(v)}
                            className="group text-left rounded-xl border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.98]"
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
                                  <span className="text-xs text-muted-foreground">
                                    Achat : {formatCurrency(v.prix_achat || 0)}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px]">
                                    Stock : {stock}
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

            {/* Panier + Form */}
            <div className={`lg:col-span-2 space-y-4 ${activeTab === 'produits' ? 'hidden lg:block' : ''}`}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      Panier
                      {lignes.length > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                          {lignes.length}
                        </Badge>
                      )}
                    </CardTitle>
                    {lignes.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLignes([])}
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
                      <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="mt-3 text-sm font-medium">Panier vide</p>
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
                                  <p className="text-xs font-medium truncate">{l.produit_nom}</p>
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
                      Détails
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        Fournisseur
                      </Label>
                      <Select
                        value={fournisseurId ?? 'direct'}
                        onValueChange={(v) => setFournisseurId(v === 'direct' ? null : v)}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Achat direct</SelectItem>
                          {fournisseurs.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {getFournisseurLabel(f)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Statut</Label>
                      <Select value={statut} onValueChange={(v) => setStatut(v as any)}>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recu">Reçu (entrer en stock)</SelectItem>
                          <SelectItem value="en_attente">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(sousTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        Montant payé (FCFA)
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        value={montantPaye}
                        onChange={(e) => setMontantPaye(Number(e.target.value) || 0)}
                        className="h-11 text-base font-bold"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setMontantPaye(sousTotal)}
                        >
                          Exact
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setMontantPaye(0)}
                        >
                          0 (crédit)
                        </Button>
                      </div>
                    </div>

                    {reste > 0 && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Reste à payer au fournisseur : <strong>{formatCurrency(reste)}</strong>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <input
                        type="checkbox"
                        id="majPrix"
                        checked={majPrixAchat}
                        onChange={(e) => setMajPrixAchat(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <Label htmlFor="majPrix" className="text-xs cursor-pointer">
                        Mettre à jour les prix d&apos;achat des variantes
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm">Notes (optionnel)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
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
                      Valider l&apos;achat · {formatCurrency(sousTotal)}
                    </LoadingButton>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barre sticky mobile */}
      {lignes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-md p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total · {lignes.length} article{lignes.length > 1 ? 's' : ''}
              </p>
              <p className="text-base font-bold text-primary truncate">
                {formatCurrency(sousTotal)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('panier')}
              className="h-12 shrink-0"
              size="icon"
            >
              <ShoppingBag className="h-4 w-4" />
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

      {/* Modal quantité + prix */}
      {modalOpen && varianteEnAjout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white text-sm font-bold">
                  {varianteEnAjout.pointure}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate">
                    {varianteEnAjout.produit?.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {varianteEnAjout.produit?.marque} · {varianteEnAjout.couleur}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setModalOpen(false)}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Quantité à commander</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantiteAjout(Math.max(1, quantiteAjout - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={quantiteAjout}
                    onChange={(e) => setQuantiteAjout(Number(e.target.value) || 1)}
                    className="h-11 text-center text-lg font-bold"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantiteAjout(quantiteAjout + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Prix d&apos;achat unitaire (FCFA)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={prixAjout}
                  onChange={(e) => setPrixAjout(Number(e.target.value) || 0)}
                  className="h-11 text-base font-bold"
                />
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Sous-total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(quantiteAjout * prixAjout)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={confirmerAjout}
                  className="flex-1 h-11 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}