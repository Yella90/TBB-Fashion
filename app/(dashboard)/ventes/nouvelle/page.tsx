import { listerClients } from '@/lib/services/clients.service';
import { FormulaireVente } from '@/components/ventes/formulaire-vente';

export const metadata = { title: 'Nouvelle vente · TBB Fashion' };

export default async function NouvelleVentePage() {
  const clients = await listerClients({ limite: 200 });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <FormulaireVente clients={clients} />
    </div>
  );
}