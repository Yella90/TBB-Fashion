'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ShoppingCart,
  XCircle,
  MoreHorizontal,
  FileText,
} from 'lucide-react';

import type { VenteAvecDetails } from '@/types/vente';
import type { ParametresBoutique } from '@/types/parametres';
import { STATUTS_VENTE } from '@/types/vente';
import { formatCurrency } from '@/lib/utils/format-currency';
import { annulerVente } from '@/lib/services/ventes.actions';
import { useConfirm } from '@/components/ui/confirm-provider';
import { TicketVente } from '@/components/ventes/ticket-vente';
import { ModalPaiement } from '@/components/ventes/modal-paiement';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export function FicheVenteEntete({
  vente,
  parametres,
  retours = [],
}: {
  vente: VenteAvecDetails;
  parametres: ParametresBoutique | null;
  retours?: RetourTicket[];
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const statutConfig =
    STATUTS_VENTE.find((s) => s.value === vente.statut) ?? STATUTS_VENTE[0];

  const peutEncaisser =
    vente.statut !== 'annulee' &&
    vente.statut !== 'payee' &&
    vente.reste_a_payer > 0;

  const peutAnnuler = vente.statut !== 'annulee';

  const handleAnnuler = () => {
    confirm({
      title: 'Annuler cette vente ?',
      description: `La vente ${vente.reference} sera marquee comme annulee et le stock sera restaure. Cette action est irreversible.`,
      confirmLabel: 'Annuler la vente',
      cancelLabel: 'Retour',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await annulerVente(vente.id);
        if (!res.success) {
          toast.error('Erreur', { description: res.error });
          return;
        }
        toast.success('Vente annulee', {
          description: 'Le stock a ete restaure.',
        });
        router.refresh();
      },
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/ventes"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Ventes
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px] font-mono">
          {vente.reference}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl gradient-tbb text-white shadow-md">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight font-mono truncate">
                {vente.reference}
              </h1>
              <Badge className={statutConfig.className}>
                {statutConfig.label}
              </Badge>
              {retours.length > 0 && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0">
                  {retours.length} retour{retours.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {formatDate(vente.date_vente)}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              Total : {formatCurrency(vente.total)}
            </p>
            {vente.utilisateur && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Vendeur :{' '}
                <strong className="text-foreground">
                  {vente.utilisateur.nom}
                </strong>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <TicketVente
            vente={vente}
            parametres={parametres}
            retours={retours}
          />

          {peutEncaisser && <ModalPaiement vente={vente} />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {peutAnnuler && (
                <DropdownMenuItem
                  onClick={handleAnnuler}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuler la vente
                </DropdownMenuItem>
              )}
              {!peutAnnuler && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  Aucune action
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}