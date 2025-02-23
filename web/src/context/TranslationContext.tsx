'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../translations/translations';

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: `${K & string}${'' | `.${DeepKeys<T[K]> & string}`}`;
    }[keyof T]
  : never;

type TranslationKey = DeepKeys<typeof translations.en>;

type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

type TranslationContextType = {
  t: TranslateFunction;
  setLanguage: (lang: 'en' | 'de') => void;
  currentLanguage: 'en' | 'de';
  isLoading: boolean;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

type TranslationProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: 'en' | 'de';
};

export function TranslationProvider({ children, defaultLanguage = 'en' }: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'de'>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    try {
      const keys = key.split('.');
      let translation: any = translations[currentLanguage];
      
      for (const k of keys) {
        translation = translation[k];
      }

      if (typeof translation !== 'string') {
        console.warn(`Translation for key ${key} is not a string:`, translation);
        return key;
      }
      
      if (params) {
        return Object.entries(params).reduce((str, [key, value]) => {
          return str.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }, translation);
      }
      
      return translation;
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }, [currentLanguage]);

  const setLanguage = useCallback((lang: 'en' | 'de') => {
    setIsLoading(true);
    setCurrentLanguage(lang);
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  return (
    <TranslationContext.Provider value={{ t, setLanguage, currentLanguage, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
