export type CurrencyCode = 'EUR' | 'USD' | 'MGA';

type CurrencyConfig = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  position: 'prefix' | 'suffix';
  decimals: number;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: { code: 'EUR', label: 'Euro', symbol: '€', position: 'suffix', decimals: 2 },
  USD: { code: 'USD', label: 'Dollar', symbol: '$', position: 'prefix', decimals: 2 },
  MGA: { code: 'MGA', label: 'Ariary', symbol: 'Ar', position: 'suffix', decimals: 0 },
};

export function formatAmount(value: number, currency: CurrencyCode = 'EUR'): string {
  const config = CURRENCIES[currency];
  const sign = value > 0 ? '+ ' : value < 0 ? '- ' : '';
  const absValue = Math.abs(value).toLocaleString('fr-FR', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return config.position === 'prefix'
    ? `${sign}${config.symbol} ${absValue}`
    : `${sign}${absValue} ${config.symbol}`;
}
