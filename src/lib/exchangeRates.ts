import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyCode } from './currency';

const STORAGE_KEY = 'poketo:exchange_rates';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6h

type RatesCache = {
  rates: Record<CurrencyCode, number>; // taux par rapport à l'EUR
  fetchedAt: number;
};

async function readCache(): Promise<RatesCache | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCache(cache: RatesCache) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

/**
 * Récupère les taux de change actuels par rapport à l'EUR (taux "pivot").
 * Cache local de 6h pour limiter les appels réseau.
 */
export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const cached = await readCache();
  const now = Date.now();

  if (cached && now - cached.fetchedAt < CACHE_DURATION_MS) {
    return cached.rates;
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR');
    const json = await response.json();

    if (json.result !== 'success') throw new Error('rate fetch failed');

    const rates: Record<CurrencyCode, number> = {
      EUR: 1,
      USD: json.rates.USD,
      MGA: json.rates.MGA,
    };

    await writeCache({ rates, fetchedAt: now });
    return rates;
  } catch {
    if (cached) return cached.rates;
    return { EUR: 1, USD: 1.08, MGA: 4700 };
  }
}

/**
 * Convertit un montant d'une devise source vers une devise cible,
 * en passant par l'EUR comme pivot.
 * ex: convertAmount(100, 'USD', 'MGA', rates)
 */
export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (from === to) return amount;
  const rateFrom = rates[from] ?? 1;
  const rateTo = rates[to] ?? 1;
  const amountInEUR = amount / rateFrom;
  return amountInEUR * rateTo;
}