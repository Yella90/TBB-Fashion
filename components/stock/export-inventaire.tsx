'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { LigneInventaire } from '@/types/stock';
import type { ParametresBoutique } from '@/types/parametres';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type OptionsExport = {
  afficherPrixAchat: boolean;
  afficherPrixVente: boolean;
  afficherFournisseur: boolean;
  afficherDescription: boolean;
  afficherPrixDifferencies: boolean;
  masquerVides: boolean;
};

const OPTIONS_DEFAUT: OptionsExport = {
  afficherPrixAchat: true,
  afficherPrixVente: true,
  afficherFournisseur: true,
  afficherDescription: true,
  afficherPrixDifferencies: true,
  masquerVides: false,
};

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(date: Date): string {
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const j = jours[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = mois[date.getMonth()];
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${j} ${d} ${m} ${y} à ${h}:${min}`;
}

export function ExportInventaire({
  lignes,
  parametres,
}: {
  lignes: LigneInventaire[];
  parametres: ParametresBoutique | null;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [options, setOptions] = useState<OptionsExport>(OPTIONS_DEFAUT);
  const [showOptions, setShowOptions] = useState(true);
  const exportRef = useRef<HTMLDivElement>(null);

  const nomBoutique = parametres?.nom ?? 'TBB FASHION';
  const slogan = parametres?.slogan ?? '';
  const adresse = parametres?.adresse ?? '';
  const telephone = parametres?.telephone ?? '';

  const lignesAffichees = useMemo(() => {
    if (!options.masquerVides) return lignes;
    return lignes.filter((l) => (l.stock?.quantite ?? 0) > 0);
  }, [lignes, options.masquerVides]);

  const parProduit = useMemo(() => {
    const map: Record<
      string,
      { produit: LigneInventaire['produit']; lignes: LigneInventaire[] }
    > = {};
    lignesAffichees.forEach((l) => {
      const key = l.produit?.id ?? 'inconnu';
      if (!map[key]) map[key] = { produit: l.produit, lignes: [] };
      map[key].lignes.push(l);
    });
    return Object.values(map).sort((a, b) =>
      (a.produit?.nom ?? '').localeCompare(b.produit?.nom ?? '')
    );
  }, [lignesAffichees]);

  const totaux = useMemo(() => {
    let paires = 0;
    let valeurAchat = 0;
    let valeurVente = 0;
    let totalVendu = 0;
    let caVendu = 0;

    lignesAffichees.forEach((l) => {
      const q = l.stock?.quantite ?? 0;
      paires += q;
      valeurAchat += q * l.prix_achat;
      valeurVente += q * l.prix_vente;
      totalVendu += l.total_vendu;
      caVendu += l.ca_vendu ?? 0;
    });

    return { paires, valeurAchat, valeurVente, totalVendu, caVendu };
  }, [lignesAffichees]);

  const aPrixDifferencies = useMemo(
    () =>
      options.afficherPrixDifferencies &&
      lignesAffichees.some((l) => l.prix_pratiques.length > 1),
    [lignesAffichees, options.afficherPrixDifferencies]
  );

  const handleDownloadPdf = async () => {
    const element = exportRef.current;
    if (!element) return;

    setDownloading(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default ?? html2pdfModule;

      const dateStr = new Date().toISOString().slice(0, 10);

      // Calcul hauteur réelle
      const w = element.scrollWidth;
      const h = element.scrollHeight;
      const heightMm = (h / w) * 210;

      const opt = {
        margin: 0,
        filename: `Inventaire-${nomBoutique.replace(/\s+/g, '_')}-${dateStr}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: w,
          windowHeight: h,
        },
        jsPDF: {
          unit: 'mm',
          format: [210, Math.max(heightMm, 297)],
          orientation: 'portrait',
        },
      };

      await html2pdf().set(opt).from(element).save();

      toast.success('PDF téléchargé', {
        description: `Inventaire-${dateStr}.pdf`,
      });
    } catch (err: any) {
      console.error('Erreur PDF:', err);
      toast.error('Impossible de générer le PDF', {
        description: err?.message ?? 'Erreur inconnue',
      });
    } finally {
      setDownloading(false);
    }
  };

  const styles = {
    container: {
      width: '210mm',
      maxWidth: '100%',
      padding: '12mm',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '10px',
      lineHeight: 1.4,
      color: '#111111',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
    } as React.CSSProperties,
    header: {
      textAlign: 'center' as const,
      paddingBottom: '8px',
      borderBottom: '2px solid #111111',
      marginBottom: '10px',
    },
    h1: {
      fontSize: '22px',
      fontWeight: 'bold' as const,
      margin: 0,
      color: '#111111',
    },
    slogan: {
      fontSize: '11px',
      color: '#666666',
      margin: '3px 0 0 0',
      fontStyle: 'italic' as const,
    },
    headerInfo: {
      fontSize: '9px',
      color: '#555555',
      margin: '4px 0 0 0',
    },
    docTitle: {
      textAlign: 'center' as const,
      margin: '14px 0 4px 0',
    },
    docTitleMain: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
      margin: 0,
      color: '#111111',
    },
    docDate: {
      fontSize: '9px',
      color: '#777777',
      margin: '4px 0 0 0',
      textAlign: 'center' as const,
    },
    table: {
      width: '100%',
      fontSize: '9px',
      borderCollapse: 'collapse' as const,
      marginTop: '10px',
      color: '#111111',
    },
    th: {
      padding: '6px 5px',
      fontWeight: 'bold' as const,
      fontSize: '8px',
      textTransform: 'uppercase' as const,
      borderTop: '2px solid #111111',
      borderBottom: '1px solid #111111',
      backgroundColor: '#f5f5f5',
      color: '#111111',
      textAlign: 'left' as const,
    },
    thRight: {
      padding: '6px 5px',
      fontWeight: 'bold' as const,
      fontSize: '8px',
      textTransform: 'uppercase' as const,
      borderTop: '2px solid #111111',
      borderBottom: '1px solid #111111',
      backgroundColor: '#f5f5f5',
      color: '#111111',
      textAlign: 'right' as const,
    },
    thCenter: {
      padding: '6px 5px',
      fontWeight: 'bold' as const,
      fontSize: '8px',
      textTransform: 'uppercase' as const,
      borderTop: '2px solid #111111',
      borderBottom: '1px solid #111111',
      backgroundColor: '#f5f5f5',
      color: '#111111',
      textAlign: 'center' as const,
    },
    produitRow: {
      backgroundColor: '#fafafa',
    },
    produitCell: {
      padding: '8px 5px 4px 5px',
      borderBottom: '1px solid #dddddd',
      color: '#111111',
    },
    produitNom: {
      fontSize: '11px',
      fontWeight: 'bold' as const,
      color: '#111111',
    },
    produitMeta: {
      fontSize: '8px',
      color: '#666666',
      marginTop: '2px',
    },
    produitDesc: {
      fontSize: '8px',
      color: '#444444',
      fontStyle: 'italic' as const,
      marginTop: '3px',
      lineHeight: 1.3,
    },
    td: {
      padding: '5px',
      borderBottom: '1px dotted #cccccc',
      color: '#111111',
      verticalAlign: 'middle' as const,
      fontSize: '9px',
    },
    tdRight: {
      padding: '5px',
      borderBottom: '1px dotted #cccccc',
      color: '#111111',
      textAlign: 'right' as const,
      verticalAlign: 'middle' as const,
      fontSize: '9px',
    },
    tdCenter: {
      padding: '5px',
      borderBottom: '1px dotted #cccccc',
      color: '#111111',
      textAlign: 'center' as const,
      verticalAlign: 'middle' as const,
      fontSize: '9px',
    },
    varianteMain: {
      fontSize: '9px',
      fontWeight: 'bold' as const,
      color: '#111111',
    },
    varianteSub: {
      fontSize: '8px',
      color: '#777777',
      marginTop: '1px',
    },
    stockBadge: {
      display: 'inline-block' as const,
      padding: '1px 6px',
      borderRadius: '3px',
      fontWeight: 'bold' as const,
      fontSize: '9px',
    },
    stockOk: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    stockFaible: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    stockRupture: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    asterisk: {
      color: '#dc2626',
      fontWeight: 'bold' as const,
      fontSize: '11px',
      marginLeft: '2px',
    },
    totauxSection: {
      marginTop: '16px',
      paddingTop: '12px',
      borderTop: '2px solid #111111',
    },
    totauxTitle: {
      fontSize: '11px',
      fontWeight: 'bold' as const,
      color: '#111111',
      marginBottom: '8px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
    },
    totauxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '6px',
    },
    totalBox: {
      padding: '10px 6px',
      border: '1px solid #dddddd',
      borderRadius: '4px',
      textAlign: 'center' as const,
      backgroundColor: '#fafafa',
    },
    totalBoxHighlight: {
      padding: '10px 6px',
      border: '1px solid #111111',
      borderRadius: '4px',
      textAlign: 'center' as const,
      backgroundColor: '#f5f5f5',
    },
    totalLabel: {
      fontSize: '7px',
      color: '#666666',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.3px',
    },
    totalValue: {
      fontSize: '13px',
      fontWeight: 'bold' as const,
      color: '#111111',
    },
    legendSection: {
      marginTop: '12px',
      padding: '8px 10px',
      backgroundColor: '#fef3c7',
      border: '1px solid #fcd34d',
      borderRadius: '4px',
      fontSize: '8px',
      color: '#78350f',
    },
    legendTitle: {
      fontWeight: 'bold' as const,
      marginBottom: '3px',
      fontSize: '9px',
    },
    legendList: {
      margin: '4px 0 0 12px',
      padding: 0,
      listStyle: 'disc' as const,
    },
    footer: {
      marginTop: '16px',
      paddingTop: '8px',
      borderTop: '1px dashed #cccccc',
      fontSize: '8px',
      textAlign: 'center' as const,
      color: '#888888',
    },
  };

  const getStockStyle = (q: number, seuil: number) => {
    if (q === 0) return { ...styles.stockBadge, ...styles.stockRupture };
    if (q <= seuil) return { ...styles.stockBadge, ...styles.stockFaible };
    return { ...styles.stockBadge, ...styles.stockOk };
  };

  const nbColonnes =
    2 +
    (options.afficherFournisseur ? 1 : 0) +
    (options.afficherPrixAchat ? 1 : 0) +
    (options.afficherPrixVente ? 1 : 0) +
    1; // Vendu

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileSpreadsheet className="h-4 w-4" />
          Exporter inventaire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Export inventaire (A4)
          </DialogTitle>
          <DialogDescription>
            {lignesAffichees.length} variante
            {lignesAffichees.length > 1 ? 's' : ''} — personnalisez puis
            téléchargez le PDF
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-secondary/30 p-3">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex w-full items-center justify-between gap-2 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Options d&apos;affichage
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {showOptions ? 'Masquer' : 'Afficher'}
            </Badge>
          </button>

          {showOptions && (
            <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.afficherPrixAchat}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      afficherPrixAchat: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Prix d&apos;achat</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.afficherPrixVente}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      afficherPrixVente: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Prix de vente</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.afficherFournisseur}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      afficherFournisseur: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Fournisseur</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.afficherDescription}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      afficherDescription: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Description</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.afficherPrixDifferencies}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      afficherPrixDifferencies: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Prix différenciés</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm rounded-md border bg-background p-2 hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={options.masquerVides}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      masquerVides: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Masquer les vides</span>
              </label>
            </div>
          )}
        </div>

        <div
          className="flex-1 overflow-y-auto rounded-lg p-4"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="inventaire-export" ref={exportRef} style={styles.container}>
              <div style={styles.header}>
                <h1 style={styles.h1}>{nomBoutique.toUpperCase()}</h1>
                {slogan && <p style={styles.slogan}>{slogan}</p>}
                {(adresse || telephone) && (
                  <p style={styles.headerInfo}>
                    {adresse}
                    {adresse && telephone && ' · '}
                    {telephone && `Tél : ${telephone}`}
                  </p>
                )}
              </div>

              <div style={styles.docTitle}>
                <h2 style={styles.docTitleMain}>Inventaire complet</h2>
              </div>
              <p style={styles.docDate}>
                Généré le {fmtDate(new Date())}
                {options.masquerVides && ' · Variantes en stock uniquement'}
              </p>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '28%' }}>
                      Produit / Variante
                    </th>
                    {options.afficherFournisseur && (
                      <th style={{ ...styles.th, width: '16%' }}>
                        Fournisseur
                      </th>
                    )}
                    {options.afficherPrixAchat && (
                      <th style={{ ...styles.thRight, width: '13%' }}>
                        Prix achat
                      </th>
                    )}
                    {options.afficherPrixVente && (
                      <th style={{ ...styles.thRight, width: '13%' }}>
                        Prix vente
                      </th>
                    )}
                    <th style={{ ...styles.thCenter, width: '12%' }}>Stock</th>
                    <th style={{ ...styles.thCenter, width: '10%' }}>Vendu</th>
                  </tr>
                </thead>
                <tbody>
                  {parProduit.map(({ produit, lignes: varlignes }) => {
                    const produitVendu = varlignes.reduce(
                      (s, l) => s + l.total_vendu,
                      0
                    );
                    const produitStock = varlignes.reduce(
                      (s, l) => s + (l.stock?.quantite ?? 0),
                      0
                    );

                    return (
                      <React.Fragment key={`p-${produit?.id}`}>
                        <tr style={styles.produitRow}>
                          <td
                            colSpan={nbColonnes}
                            style={styles.produitCell}
                          >
                            <div style={styles.produitNom}>
                              {produit?.nom}
                              {produit?.marque && ` · ${produit.marque}`}
                            </div>
                            <div style={styles.produitMeta}>
                              Réf. {produit?.reference} ·{' '}
                              {varlignes.length} variante
                              {varlignes.length > 1 ? 's' : ''} · Stock :{' '}
                              {produitStock} · Vendu : {produitVendu}
                            </div>
                            {options.afficherDescription &&
                              produit?.description && (
                                <div style={styles.produitDesc}>
                                  {produit.description}
                                </div>
                              )}
                          </td>
                        </tr>

                        {varlignes.map((l) => {
                          const q = l.stock?.quantite ?? 0;
                          const seuil = l.stock?.seuil_alerte ?? 5;
                          const prixDifferent =
                            options.afficherPrixDifferencies &&
                            l.prix_pratiques.length > 1;

                          return (
                            <tr key={l.variante_id}>
                              <td style={styles.td}>
                                <div style={styles.varianteMain}>
                                  Pointure {l.pointure}
                                </div>
                                <div style={styles.varianteSub}>
                                  {l.couleur}
                                </div>
                              </td>

                              {options.afficherFournisseur && (
                                <td style={styles.td}>
                                  {l.fournisseur ?? '—'}
                                </td>
                              )}

                              {options.afficherPrixAchat && (
                                <td style={styles.tdRight}>
                                  {fmt(l.prix_achat)}
                                </td>
                              )}

                              {options.afficherPrixVente && (
                                <td style={styles.tdRight}>
                                  {fmt(l.prix_vente)}
                                  {prixDifferent && (
                                    <span style={styles.asterisk}>*</span>
                                  )}
                                </td>
                              )}

                              <td style={styles.tdCenter}>
                                <span style={getStockStyle(q, seuil)}>
                                  {q}
                                </span>
                              </td>

                              <td style={styles.tdCenter}>
                                <strong>{l.total_vendu}</strong>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <div style={styles.totauxSection}>
                <div style={styles.totauxTitle}>Récapitulatif</div>
                <div style={styles.totauxGrid}>
                  <div style={styles.totalBox}>
                    <div style={styles.totalLabel}>Paires en stock</div>
                    <div style={styles.totalValue}>{fmt(totaux.paires)}</div>
                  </div>

                  {options.afficherPrixAchat && (
                    <div style={styles.totalBox}>
                      <div style={styles.totalLabel}>Valeur achat</div>
                      <div style={styles.totalValue}>
                        {fmt(totaux.valeurAchat)}
                      </div>
                    </div>
                  )}

                  {options.afficherPrixVente && (
                    <div style={styles.totalBox}>
                      <div style={styles.totalLabel}>Valeur vente</div>
                      <div style={styles.totalValue}>
                        {fmt(totaux.valeurVente)}
                      </div>
                    </div>
                  )}

                  <div style={styles.totalBox}>
                    <div style={styles.totalLabel}>Paires vendues</div>
                    <div style={styles.totalValue}>
                      {fmt(totaux.totalVendu)}
                    </div>
                  </div>

                  <div style={styles.totalBoxHighlight}>
                    <div style={styles.totalLabel}>CA total réalisé</div>
                    <div style={styles.totalValue}>{fmt(totaux.caVendu)}</div>
                  </div>
                </div>

                {aPrixDifferencies && (
                  <div style={styles.legendSection}>
                    <div style={styles.legendTitle}>
                      * Produits vendus à des prix différents
                    </div>
                    <ul style={styles.legendList}>
                      {lignesAffichees
                        .filter((l) => l.prix_pratiques.length > 1)
                        .slice(0, 30)
                        .map((l) => (
                          <li
                            key={l.variante_id}
                            style={{ marginTop: '2px' }}
                          >
                            {l.produit?.nom} · P.{l.pointure} · {l.couleur} :{' '}
                            {l.prix_pratiques.map((p) => fmt(p)).join(' / ')}{' '}
                            FCFA
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={styles.footer}>
                Document généré automatiquement par {nomBoutique} ·{' '}
                {lignesAffichees.length} variante
                {lignesAffichees.length > 1 ? 's' : ''} listée
                {lignesAffichees.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Fermer
          </Button>
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading || lignesAffichees.length === 0}
            className="gap-1.5 w-full sm:w-auto"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? 'Génération...' : 'Télécharger PDF (A4)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}