'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import type { VenteParJour } from '@/types/rapport';

export function VentesChart({ data }: { data: VenteParJour[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Évolution des ventes
        </CardTitle>
        <CardDescription className="text-xs">
          Chiffre d&apos;affaires et bénéfices par jour
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradVentesR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBeneficesR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
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
              />
              <Area
                type="monotone"
                dataKey="ventes"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#gradVentesR)"
                name="CA"
              />
              <Area
                type="monotone"
                dataKey="benefices"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#gradBeneficesR)"
                name="Bénéfices"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}