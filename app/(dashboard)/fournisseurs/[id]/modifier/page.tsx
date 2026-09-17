import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormulaireFournisseur } from '@/components/fournisseurs/formulaire-fournisseur';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('fournisseurs')
    .select('nom')
    .eq('id', id)
    .single();
  return {
    title: data ? `Modifier ${data.nom} · TBB Fashion` : 'Modifier fournisseur',
  };
}

export default async function ModifierFournisseurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: fournisseur } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('id', id)
    .single();

  if (!fournisseur) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireFournisseur fournisseur={fournisseur} />
    </div>
  );
}