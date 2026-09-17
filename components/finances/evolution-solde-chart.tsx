'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type Point = {
  date: string;
  entrees: number;
  sorties: number;
  solde: number;
};

export function EvolutionSoldeChart({
  data,
  mode,
}: {
  data: Point[];
  mode: 'resultat' | 'tresorerie';
}) {
  const titre =
    mode === 'resultat' ? 'Évolution du résultat' : 'Évolution de la trésorerie';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{titre}</CardTitle>
        <CardDescription className="text-xs">
          Cumul jour par jour (entrées − sorties)
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
                <linearGradient id="gradSolde" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
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
                width={50}
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
              <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="solde"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#gradSolde)"
                name="Solde cumulé"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}