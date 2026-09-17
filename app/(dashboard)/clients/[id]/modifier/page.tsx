import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormulaireClient } from '@/components/clients/formulaire-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('clients')
    .select('nom')
    .eq('id', id)
    .single();
  return {
    title: data ? `Modifier ${data.nom} · TBB Fashion` : 'Modifier client',
  };
}

export default async function ModifierClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!client) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FormulaireClient client={client} />
    </div>
  );
}