'use client';

import { useState, useRef } from 'react';
import { Download, Receipt, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import type { VenteAvecDetails } from '@/types/vente';
import type { ParametresBoutique } from '@/types/parametres';
import { MOTIFS_RETOUR } from '@/types/retour';
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

type Format = '80mm' | 'a4';

type RetourTicket = {
  id: string;
  reference: string;
  date_retour: string;
  motif: string;
  montant_rembourse: number;
  type_remboursement: string | null;
  statut: string;
  lignes: {
    id: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
    variante: {
      id: string;
      pointure: number;
      couleur: string;
      produit: {
        id: string;
        nom: string;
        marque: string | null;
      } | null;
    } | null;
  }[];
};

function formatMontant(montant: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
  return `${formatted} FCFA`;
}

function formatMontantCourt(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

export function TicketVente({
  vente,
  parametres,
  retours = [],
}: {
  vente: VenteAvecDetails;
  parametres: ParametresBoutique | null;
  retours?: RetourTicket[];
}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>('80mm');
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const nomBoutique = parametres?.nom ?? 'TBB FASHION';
  const slogan = parametres?.slogan ?? 'La chaussure qui vous ressemble';
  const adresse = parametres?.adresse ?? 'Bamako, Mali';
  const telephone = parametres?.telephone ?? '';
  const vendeurNom = vente.utilisateur?.nom ?? 'Vendeur';

  const clientNom = vente.client
    ? [vente.client.nom, vente.client.prenom].filter(Boolean).join(' ')
    : 'Client de passage';

  const totalRetours = retours.reduce(
    (s, r) => s + (r.montant_rembourse ?? 0),
    0
  );

  const formatDate = (date: string) => {
    const d = new Date(date);
    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${jour}/${mois}/${annee} ${h}:${m}`;
  };

  const formatDateCourte = (date: string) => {
    const d = new Date(date);
    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = String(d.getFullYear()).slice(-2);
    return `${jour}/${mois}/${annee}`;
  };

  const handleDownloadPdf = async () => {
    const element = ticketRef.current;
    if (!element) return;

    setDownloading(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default ?? html2pdfModule;

      const elementWidthPx = element.scrollWidth;
      const elementHeightPx = element.scrollHeight;

      let opt: any;

      if (format === 'a4') {
        opt = {
          margin: 10,
          filename: `Ticket-${vente.reference}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
      } else {
        const widthMm = 80;
        const heightMm =
          Math.ceil((elementHeightPx / elementWidthPx) * widthMm) + 4;
        opt = {
          margin: 0,
          filename: `Ticket-${vente.reference}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          },
          jsPDF: {
            unit: 'mm',
            format: [widthMm, heightMm],
            orientation: 'portrait',
          },
        };
      }

      await html2pdf().set(opt).from(element).save();

      toast.success('PDF telecharge', {
        description: `Ticket-${vente.reference}.pdf`,
      });
    } catch (err: any) {
      console.error('Erreur PDF:', err);
      toast.error('Impossible de generer le PDF', {
        description: err?.message ?? 'Erreur inconnue',
      });
    } finally {
      setDownloading(false);
    }
  };

  const is80 = format === '80mm';

  const styles = {
    container: {
      width: is80 ? '80mm' : '210mm',
      maxWidth: '100%',
      padding: is80 ? '4mm' : '15mm',
      fontFamily: is80 ? "'Courier New', monospace" : 'Arial, sans-serif',
      fontSize: is80 ? '11px' : '13px',
      lineHeight: 1.4,
      color: '#000000',
      backgroundColor: '#ffffff',
    } as React.CSSProperties,
    header: {
      textAlign: 'center' as const,
      paddingBottom: is80 ? '8px' : '16px',
      borderBottom: is80 ? '1px dashed #000000' : '2px solid #000000',
      marginBottom: is80 ? '0' : '16px',
    },
    h1: {
      fontSize: is80 ? '16px' : '24px',
      fontWeight: 'bold' as const,
      margin: 0,
      letterSpacing: '-0.5px',
      color: '#000000',
    },
    slogan: {
      fontSize: is80 ? '9px' : '12px',
      color: '#666666',
      margin: '4px 0 0 0',
      fontStyle: 'italic' as const,
    },
    address: {
      fontSize: is80 ? '9px' : '11px',
      margin: '4px 0 0 0',
      color: '#000000',
    },
    numeroBoutique: {
      fontSize: is80 ? '9px' : '11px',
      margin: '2px 0 0 0',
      color: '#000000',
      fontWeight: 'bold' as const,
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: is80 ? '10px' : '12px',
      marginBottom: '8px',
      color: '#000000',
    },
    sepDashed: {
      borderTop: '1px dashed #000000',
      margin: '8px 0',
    },
    table: {
      width: '100%',
      fontSize: is80 ? '10px' : '12px',
      borderCollapse: 'collapse' as const,
      color: '#000000',
    },
    thLeft: {
      textAlign: 'left' as const,
      padding: '4px 0',
      fontWeight: 'bold' as const,
      borderBottom: '1px solid #000000',
      color: '#000000',
    },
    thCenter: {
      textAlign: 'center' as const,
      padding: '4px 0',
      fontWeight: 'bold' as const,
      borderBottom: '1px solid #000000',
      color: '#000000',
    },
    thRight: {
      textAlign: 'right' as const,
      padding: '4px 0',
      fontWeight: 'bold' as const,
      borderBottom: '1px solid #000000',
      color: '#000000',
    },
    tdLeft: {
      textAlign: 'left' as const,
      padding: '4px 0',
      borderBottom: '1px dotted #cccccc',
      color: '#000000',
      verticalAlign: 'top' as const,
    },
    tdCenter: {
      textAlign: 'center' as const,
      padding: '4px 0',
      borderBottom: '1px dotted #cccccc',
      color: '#000000',
    },
    tdRight: {
      textAlign: 'right' as const,
      padding: '4px 0',
      borderBottom: '1px dotted #cccccc',
      color: '#000000',
    },
    articleSub: {
      fontSize: '9px',
      color: '#666666',
    },
    totals: {
      borderTop: '1px solid #000000',
      marginTop: '8px',
      paddingTop: '8px',
      fontSize: is80 ? '10px' : '13px',
      color: '#000000',
    },
    totalLine: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px',
    },
    totalBold: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold' as const,
      borderTop: '1px solid #000000',
      marginTop: '4px',
      paddingTop: '4px',
      fontSize: is80 ? '12px' : '16px',
      color: '#000000',
    },
    vendeur: {
      marginTop: '8px',
      paddingTop: '6px',
      borderTop: '1px dashed #000000',
      fontSize: is80 ? '10px' : '12px',
      color: '#000000',
    },
    retoursSection: {
      marginTop: '12px',
      paddingTop: '8px',
      borderTop: '2px dashed #dc2626',
      fontSize: is80 ? '10px' : '12px',
      color: '#000000',
    },
    retoursTitre: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'bold' as const,
      color: '#dc2626',
      marginBottom: '6px',
      fontSize: is80 ? '11px' : '13px',
    },
    retourCard: {
      borderTop: '1px dotted #999999',
      paddingTop: '6px',
      marginTop: '6px',
    },
    retourHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px',
      fontWeight: 'bold' as const,
    },
    retourMeta: {
      fontSize: is80 ? '9px' : '11px',
      color: '#666666',
      marginBottom: '3px',
    },
    retourLigne: {
      paddingLeft: '6px',
      borderLeft: '2px solid #eeeeee',
      fontSize: is80 ? '9px' : '11px',
      marginBottom: '2px',
      color: '#333333',
    },
    retourMontant: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold' as const,
      color: '#dc2626',
      marginTop: '4px',
      paddingTop: '4px',
      borderTop: '1px dotted #999999',
    },
    netFinal: {
      marginTop: '10px',
      paddingTop: '8px',
      borderTop: '2px solid #000000',
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold' as const,
      fontSize: is80 ? '13px' : '16px',
      color: '#000000',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '12px',
      paddingTop: '8px',
      borderTop: '1px dashed #000000',
      fontSize: is80 ? '9px' : '12px',
      color: '#000000',
    },
    footerGray: {
      color: '#666666',
      marginTop: '6px',
    },
  };

  const montantNet = vente.total - totalRetours;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Receipt className="h-4 w-4" />
          Ticket
          {retours.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold h-4 w-4">
              {retours.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Ticket de vente
          </DialogTitle>
          <DialogDescription>Reference : {vente.reference}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-2">
          <Button
            type="button"
            variant={format === '80mm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFormat('80mm')}
            className="h-8 text-xs"
          >
            80mm (Thermique)
          </Button>
          <Button
            type="button"
            variant={format === 'a4' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFormat('a4')}
            className="h-8 text-xs"
          >
            A4 (Classique)
          </Button>
        </div>

        <div
          className="flex-1 overflow-y-auto rounded-lg p-4"
          style={{ backgroundColor: '#f3f4f6' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              id="ticket-impression"
              ref={ticketRef}
              style={styles.container}
            >
              {/* En-tête boutique */}
              <div style={styles.header}>
                <h1 style={styles.h1}>{nomBoutique.toUpperCase()}</h1>
                <p style={styles.slogan}>{slogan}</p>
                <p style={styles.address}>{adresse}</p>
                {telephone && (
                  <p style={styles.numeroBoutique}>Tel : {telephone}</p>
                )}
              </div>

              {/* Infos vente */}
              <div style={styles.infoRow}>
                <div>
                  <div>
                    <strong>Ref :</strong> {vente.reference}
                  </div>
                  <div>
                    <strong>Date :</strong> {formatDate(vente.date_vente)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <strong>Client :</strong> {clientNom}
                  </div>
                  {vente.client?.telephone && (
                    <div>
                      <strong>Tel :</strong> {vente.client.telephone}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.sepDashed} />

              {/* Articles */}
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>Article</th>
                    <th style={styles.thCenter}>Qte</th>
                    <th style={styles.thRight}>PU</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vente.lignes.map((ligne) => (
                    <tr key={ligne.id}>
                      <td style={styles.tdLeft}>
                        <div style={{ fontWeight: 'bold' }}>
                          {ligne.variante?.produit?.nom ?? 'Produit'}
                        </div>
                        <div style={styles.articleSub}>
                          P.{ligne.variante?.pointure} · {ligne.variante?.couleur}
                        </div>
                      </td>
                      <td style={styles.tdCenter}>{ligne.quantite}</td>
                      <td style={styles.tdRight}>
                        {formatMontantCourt(ligne.prix_unitaire)}
                      </td>
                      <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>
                        {formatMontantCourt(ligne.sous_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div style={styles.totals}>
                <div style={styles.totalLine}>
                  <span>Sous-total</span>
                  <span>{formatMontant(vente.sous_total)}</span>
                </div>
                {vente.remise > 0 && (
                  <div style={styles.totalLine}>
                    <span>Remise</span>
                    <span>- {formatMontant(vente.remise)}</span>
                  </div>
                )}
                {vente.tva > 0 && (
                  <div style={styles.totalLine}>
                    <span>TVA</span>
                    <span>{formatMontant(vente.tva)}</span>
                  </div>
                )}
                <div style={styles.totalBold}>
                  <span>TOTAL</span>
                  <span>{formatMontant(vente.total)}</span>
                </div>
                <div style={{ ...styles.totalLine, marginTop: '4px' }}>
                  <span>Paye</span>
                  <span>{formatMontant(vente.montant_paye)}</span>
                </div>
                {vente.reste_a_payer > 0 && (
                  <div style={{ ...styles.totalLine, fontWeight: 'bold' }}>
                    <span>Reste</span>
                    <span>{formatMontant(vente.reste_a_payer)}</span>
                  </div>
                )}
                {vente.mode_paiement && (
                  <div style={{ ...styles.totalLine, color: '#666666' }}>
                    <span>Mode</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {vente.mode_paiement.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Section RETOURS */}
              {retours.length > 0 && (
                <div style={styles.retoursSection}>
                  <div style={styles.retoursTitre}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      RETOURS ({retours.length})
                    </span>
                    <span>- {formatMontant(totalRetours)}</span>
                  </div>

                  {retours.map((r) => {
                    const motifLabel =
                      MOTIFS_RETOUR.find((m) => m.value === r.motif)?.label ??
                      r.motif;
                    return (
                      <div key={r.id} style={styles.retourCard}>
                        <div style={styles.retourHeader}>
                          <span>{r.reference}</span>
                          <span>{formatDateCourte(r.date_retour)}</span>
                        </div>
                        <div style={styles.retourMeta}>
                          {motifLabel}
                          {r.type_remboursement && (
                            <span>
                              {' '}·{' '}
                              {r.type_remboursement === 'especes'
                                ? 'Remb. especes'
                                : 'Avoir'}
                            </span>
                          )}
                        </div>
                        {r.lignes.map((l) => (
                          <div key={l.id} style={styles.retourLigne}>
                            - {l.variante?.produit?.nom} · P.{l.variante?.pointure} ·{' '}
                            {l.variante?.couleur} × {l.quantite}
                          </div>
                        ))}
                        {r.montant_rembourse > 0 && (
                          <div style={styles.retourMontant}>
                            <span>Montant retourne</span>
                            <span>- {formatMontant(r.montant_rembourse)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Total net */}
                  <div style={styles.netFinal}>
                    <span>NET FINAL</span>
                    <span>{formatMontant(montantNet)}</span>
                  </div>
                </div>
              )}

              {/* Vendeur */}
              <div style={styles.vendeur}>
                <div style={styles.totalLine}>
                  <span>Servi par :</span>
                  <strong>{vendeurNom}</strong>
                </div>
              </div>

              {/* Pied */}
              <div style={styles.footer}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>
                  Merci de votre visite !
                </p>
                <p style={{ margin: '4px 0 0 0' }}>{slogan}</p>
                <p style={styles.footerGray}>Aucun echange sans ce ticket</p>
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
            disabled={downloading}
            className="gap-1.5 w-full sm:w-auto"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading
              ? 'Generation...'
              : `Telecharger PDF (${format === '80mm' ? '80mm' : 'A4'})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}