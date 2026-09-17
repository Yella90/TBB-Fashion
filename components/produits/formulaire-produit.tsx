'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, Package, Tag, DollarSign, Layers, ArrowLeft, ArrowRight,
  RefreshCw, CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import {
  produitCompletSchema,
  type ProduitCompletInput,
} from '@/lib/validations/produit.schema';
import { CATEGORIES, TYPES, SAISONS } from '@/types/produit';
import { generateReference } from '@/lib/utils/generate-reference';
import { creerProduitComplet } from '@/lib/services/produits.actions';
import { VarianteProduit } from '@/components/produits/variante-produit';
import { formatCurrency } from '@/lib/utils/format-currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';

export function FormulaireProduit() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('infos');

  const methods = useForm<ProduitCompletInput>({
    resolver: zodResolver(produitCompletSchema),
    defaultValues: {
      reference: generateReference('TBB'),
      nom: '',
      marque: '',
      description: '',
      categorie: 'homme',
      type: 'basket',
      saison: 'toutes',
      prix_achat: 0,
      prix_vente: 0,
      variantes: [
        { pointure: 40, couleur: '', prix_vente: 0, stock_initial: 0 },
      ],
    },
  });

  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
    watch, setValue,
  } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: 'variantes' });

  const nom = watch('nom');
  const prixVente = watch('prix_vente');
  const prixAchat = watch('prix_achat');
  const variantes = watch('variantes');
  const categorie = watch('categorie');

  const stockTotal = useMemo(
    () => variantes?.reduce((s, v) => s + (Number(v.stock_initial) || 0), 0) ?? 0,
    [variantes]
  );

  const valeurStock = useMemo(
    () => stockTotal * (Number(prixAchat) || 0),
    [stockTotal, prixAchat]
  );

  const regenererReference = () => {
    setValue('reference', generateReference('TBB'));
    toast.info('Référence régénérée');
  };

  const onSubmit = async (data: ProduitCompletInput) => {
    const res = await creerProduitComplet(data);
    if (!res.success) {
      toast.error('Impossible de créer le produit', { description: res.error });
      return;
    }
    toast.success('Produit créé 🎉', { description: 'Vous pouvez maintenant le retrouver dans le catalogue.' });
    router.push('/produits');
    router.refresh();
  };

  const ajouterVariante = () =>
    append({ pointure: 40, couleur: '', prix_vente: watch('prix_vente') || 0, stock_initial: 0 });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full overflow-x-hidden pb-28 lg:pb-0">
        <div className="w-full space-y-4 lg:space-y-6">
          {/* EN-TÊTE */}
          <div className="flex items-start gap-3 sm:items-center">
            <Button type="button" variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 mt-0.5 sm:mt-0">
              <Link href="/produits"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight break-words">
                Nouveau produit
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 break-words">
                Ajoutez un modèle et ses variantes
              </p>
            </div>
          </div>

          {/* TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12 p-1 sticky top-16 z-20 bg-background/95 backdrop-blur-md border rounded-lg overflow-hidden">
              <TabsTrigger value="infos" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate">Infos</span>
              </TabsTrigger>
              <TabsTrigger value="variantes" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers className="h-4 w-4 shrink-0" />
                <span className="truncate">Variantes</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold shrink-0">
                  {fields.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* ONGLET INFOS */}
            <TabsContent value="infos" className="mt-4 w-full space-y-4">
              {/* Identification */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                    Identification
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Référence, nom et marque du modèle
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Référence */}
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-sm font-medium">
                      Référence
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="reference"
                        placeholder="TBB-2024-0001"
                        className="h-11 font-mono text-sm flex-1 min-w-0"
                        {...register('reference')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        onClick={regenererReference}
                        title="Régénérer"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.reference && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.reference.message}
                      </p>
                    )}
                  </div>

                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-sm font-medium">
                      Nom du modèle <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="nom"
                      placeholder="Ex : Air Max 90"
                      className="h-11"
                      {...register('nom')}
                    />
                    {errors.nom && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.nom.message}
                      </p>
                    )}
                  </div>

                  {/* Marque */}
                  <div className="space-y-2">
                    <Label htmlFor="marque" className="text-sm font-medium">
                      Marque
                    </Label>
                    <Input
                      id="marque"
                      placeholder="Ex : Nike, Adidas…"
                      className="h-11"
                      {...register('marque')}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Description (optionnel)"
                      rows={3}
                      className="resize-none"
                      {...register('description')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Classification */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Catégorie <span className="text-primary">*</span>
                      </Label>
                      <Select
                        defaultValue="homme"
                        onValueChange={(v) =>
                          setValue('categorie', v as ProduitCompletInput['categorie'])
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Type</Label>
                      <Select
                        defaultValue="basket"
                        onValueChange={(v) =>
                          setValue('type', v as ProduitCompletInput['type'])
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Saison</Label>
                      <Select
                        defaultValue="toutes"
                        onValueChange={(v) =>
                          setValue('saison', v as ProduitCompletInput['saison'])
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SAISONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prix */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    Prix par défaut
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Utilisé comme valeur par défaut pour les variantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prix_achat" className="text-sm font-medium">
                        Prix d&apos;achat (FCFA) <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="prix_achat"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        placeholder="0"
                        className="h-11 w-full"
                        {...register('prix_achat', { valueAsNumber: true })}
                      />
                      {errors.prix_achat && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.prix_achat.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prix_vente" className="text-sm font-medium">
                        Prix de vente (FCFA) <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="prix_vente"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        placeholder="0"
                        className="h-11 w-full"
                        {...register('prix_vente', { valueAsNumber: true })}
                      />
                      {errors.prix_vente && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.prix_vente.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {Number(prixVente) > 0 && Number(prixAchat) > 0 && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Marge :{' '}
                        <strong>{formatCurrency(Number(prixVente) - Number(prixAchat))}</strong>{' '}
                        ({(((Number(prixVente) - Number(prixAchat)) / Number(prixAchat)) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="hidden sm:flex justify-end">
                <Button type="button" onClick={() => setActiveTab('variantes')} className="gap-2">
                  Suivant : Variantes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* ONGLET VARIANTES */}
            <TabsContent value="variantes" className="mt-4 w-full space-y-4">
              {(nom || stockTotal > 0) && (
                <Card className="overflow-hidden border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-tbb text-white">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold truncate">
                          {nom || 'Nouveau produit'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="capitalize">{categorie}</span>
                          <span className="text-border">•</span>
                          <span>
                            <strong className="text-foreground">{fields.length}</strong>{' '}
                            variante{fields.length > 1 ? 's' : ''}
                          </span>
                          {stockTotal > 0 && (
                            <>
                              <span className="text-border">•</span>
                              <span>
                                <strong className="text-foreground">{stockTotal}</strong>{' '}
                                paires
                              </span>
                            </>
                          )}
                        </div>
                        {valeurStock > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Valeur stock :{' '}
                            <strong className="text-foreground">
                              {formatCurrency(valeurStock)}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 border-b">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        Variantes
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Combinaisons pointure × couleur
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={ajouterVariante}
                      className="gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">Ajouter</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {errors.variantes?.root && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors.variantes.root.message}
                      </p>
                    </div>
                  )}

                  {fields.map((field, index) => (
                    <VarianteProduit
                      key={field.id}
                      index={index}
                      onRemove={() => remove(index)}
                      canRemove={fields.length > 1}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={ajouterVariante}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.99]"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une variante
                  </button>
                </CardContent>
              </Card>

              <div className="hidden sm:flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('infos')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Créer le produit
                </LoadingButton>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* BARRE STICKY MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-md p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            {activeTab === 'variantes' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('infos')}
                  className="h-11 w-11 shrink-0"
                  size="icon"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1 h-11 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Créer le produit</span>
                </LoadingButton>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setActiveTab('variantes')}
                className="flex-1 h-11 gap-2"
              >
                <span className="truncate">Suivant : Variantes</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}