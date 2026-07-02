export function formatAmount(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const absValue = Math.abs(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign} ${absValue} €`;
}