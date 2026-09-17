export function formatCurrency(
  amount: number,
  options: { compact?: boolean; showSymbol?: boolean } = {}
): string {
  const { compact = false, showSymbol = true } = options;

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M${showSymbol ? ' FCFA' : ''}`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k${showSymbol ? ' FCFA' : ''}`;
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${formatted} FCFA` : formatted;
}