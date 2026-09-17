'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type DataPoint = { date: string; ventes: number; benefices: number };

export function VentesChart({ data }: { data: DataPoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Ventes & bénéfices</CardTitle>
        <CardDescription className="text-xs">Évolution des 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height={280} minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBenefices" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={40} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, '']}
              />
              <Area type="monotone" dataKey="ventes" stroke="var(--primary)" strokeWidth={2.5} fill="url(#gradVentes)" name="Ventes" />
              <Area type="monotone" dataKey="benefices" stroke="var(--foreground)" strokeWidth={2} fill="url(#gradBenefices)" name="Bénéfices" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}