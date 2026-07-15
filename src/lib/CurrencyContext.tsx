import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { CurrencyCode } from './currency';
import { getExchangeRates, convertAmount } from './exchangeRates';

const STORAGE_KEY = 'pokly:currency';

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  ready: boolean;
  /** Convertit un montant depuis sa devise d'origine vers la devise sélectionnée */
  convert: (amount: number, fromCurrency: CurrencyCode) => number;
  ratesReady: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'EUR',
  setCurrency: () => {},
  ready: false,
  convert: (v) => v,
  ratesReady: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR');
  const [ready, setReady] = useState(false);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({ EUR: 1, USD: 1, MGA: 1 });
  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'EUR' || stored === 'USD' || stored === 'MGA') {
        setCurrencyState(stored);
      }
      setReady(true);
    });

    getExchangeRates().then((r) => {
      setRates(r);
      setRatesReady(true);
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    AsyncStorage.setItem(STORAGE_KEY, code);
  };

  const convert = (amount: number, fromCurrency: CurrencyCode) =>
    convertAmount(amount, fromCurrency, currency, rates);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, ready, convert, ratesReady }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}