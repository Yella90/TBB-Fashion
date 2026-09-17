'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { PERIODES, type PeriodeRapport } from '@/types/rapport';
import { Button } from '@/components/ui/button';

export function SelecteurPeriode({
  periodeActuelle,
}: {
  periodeActuelle: PeriodeRapport;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (p: PeriodeRapport) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('periode', p);
    router.push(`/rapports?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
      {PERIODES.map((p) => (
        <Button
          key={p.value}
          variant={periodeActuelle === p.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(p.value)}
          className="h-8 text-xs shrink-0"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}