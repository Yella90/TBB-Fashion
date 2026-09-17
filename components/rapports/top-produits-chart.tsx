'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import type { TopProduit } from '@/types/rapport';

export function TopProduitsChart({ data }: { data: TopProduit[] }) {
  const chartData = data.map((p) => ({
    nom: p.nom.length > 15 ? p.nom.slice(0, 15) + '…' : p.nom,
    quantite: p.quantite,
    ca: p.ca,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Top produits
        </CardTitle>
        <CardDescription className="text-xs">
          Les {data.length} produits les plus vendus
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            Aucune vente sur cette période
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} paires`, '']}
                  cursor={{ fill: 'var(--secondary)' }}
                />
                <Bar
                  dataKey="quantite"
                  fill="var(--primary)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}