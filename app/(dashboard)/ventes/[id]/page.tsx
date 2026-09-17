import { notFound } from 'next/navigation';
import { getVente } from '@/lib/services/ventes.service';
import {
  getLignesRetournables,
  listerRetoursParVente,
} from '@/lib/services/retours.service';
import { getParametresBoutique } from '@/lib/services/parametres.service';
import { FicheVenteEntete } from '@/components/ventes/fiche-vente-entete';
import { DetailsVente } from '@/components/ventes/details-vente';
import { RetoursVente } from '@/components/ventes/retours-vente';
import { ModalNouveauRetour } from '@/components/retours/modal-nouveau-retour';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vente = await getVente(id);
  return {
    title: vente
      ? `Vente ${vente.reference} · TBB Fashion`
      : 'Vente · TBB Fashion',
  };
}

export default async function VenteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vente = await getVente(id);

  if (!vente) {
    notFound();
  }

  const [lignesRetournables, retours, parametres] = await Promise.all([
    getLignesRetournables(id),
    listerRetoursParVente(id),
    getParametresBoutique(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 lg:space-y-6">
      <FicheVenteEntete
        vente={vente}
        parametres={parametres}
        retours={retours}
      />

      {lignesRetournables.length > 0 && vente.statut !== 'annulee' && (
        <div className="flex justify-end">
          <ModalNouveauRetour
            venteId={vente.id}
            clientId={vente.client_id}
            lignes={lignesRetournables}
          />
        </div>
      )}

      <DetailsVente vente={vente} />

      {retours.length > 0 && <RetoursVente retours={retours} />}
    </div>
  );
}