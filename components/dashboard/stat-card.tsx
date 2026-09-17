import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
  description?: string;
};

export function StatCard({ label, value, trend, icon, description }: Props) {
  const isUp = (trend ?? 0) >= 0;

  return (
    <Card className="relative overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {value}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium rounded-full px-2 py-0.5',
                    isUp
                      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
                      : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
                  )}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isUp ? '+' : ''}
                  {trend}%
                </span>
              )}
              {description && (
                <span className="text-muted-foreground truncate">
                  {description}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-tbb text-white shadow-sm">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}