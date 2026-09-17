'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import type { RepartitionPaiement } from '@/types/rapport';
import { LABELS_PAIEMENT } from '@/types/rapport';

export function PaiementsChart({ data }: { data: RepartitionPaiement[] }) {
  const chartData = data.map((p) => ({
    mode: LABELS_PAIEMENT[p.mode] ?? p.mode,
    montant: p.montant,
    nombre: p.nombre,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Modes de paiement
        </CardTitle>
        <CardDescription className="text-xs">
          Répartition du chiffre d&apos;affaires
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            Aucun paiement
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mode"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  width={45}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `${Number(value).toLocaleString('fr-FR')} FCFA`,
                    '',
                  ]}
                  cursor={{ fill: 'var(--secondary)' }}
                />
                <Bar
                  dataKey="montant"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}