import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { CurrencyCode } from './currency';

const STORAGE_KEY = 'pokly:currency';

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  ready: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'EUR',
  setCurrency: () => {},
  ready: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'EUR' || stored === 'USD' || stored === 'MGA') {
        setCurrencyState(stored);
      }
      setReady(true);
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    AsyncStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, ready }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
