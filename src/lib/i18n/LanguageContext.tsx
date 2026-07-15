import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { LanguageCode, translate } from './translations';

const STORAGE_KEY = 'poketo:language';
const SUPPORTED: LanguageCode[] = ['fr', 'en', 'mg', 'es', 'de'];

function detectSystemLanguage(): LanguageCode {
  const locales = Localization.getLocales();
  const code = locales?.[0]?.languageCode as LanguageCode | undefined;
  return code && SUPPORTED.includes(code) ? code : 'fr';
}

type LanguageContextValue = {
  language: LanguageCode;
  isAutomatic: boolean;
  setLanguage: (code: LanguageCode | null) => void; // null = automatique (système)
  t: (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'fr',
  isAutomatic: true,
  setLanguage: () => {},
  t: (key) => translate('fr', key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(detectSystemLanguage());
  const [isAutomatic, setIsAutomatic] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && SUPPORTED.includes(stored as LanguageCode)) {
        setLanguageState(stored as LanguageCode);
        setIsAutomatic(false);
      } else {
        setLanguageState(detectSystemLanguage());
        setIsAutomatic(true);
      }
    });
  }, []);

  const setLanguage = (code: LanguageCode | null) => {
    if (code === null) {
      setIsAutomatic(true);
      setLanguageState(detectSystemLanguage());
      AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      setIsAutomatic(false);
      setLanguageState(code);
      AsyncStorage.setItem(STORAGE_KEY, code);
    }
  };

  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(language, key, vars);

  return (
    <LanguageContext.Provider value={{ language, isAutomatic, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}