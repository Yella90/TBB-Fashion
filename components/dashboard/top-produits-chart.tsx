'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type DataPoint = { nom: string; quantite: number };

export function TopProduitsChart({ data }: { data: DataPoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top 5 produits vendus</CardTitle>
        <CardDescription className="text-xs">Ce mois-ci</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height={280} minWidth={0}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis
                type="category"
                dataKey="nom"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [`${Number(value)} paires`, '']}
                cursor={{ fill: 'var(--secondary)' }}
              />
              <Bar dataKey="quantite" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}