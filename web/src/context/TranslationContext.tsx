'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../data/translations.json';
import type { TranslationKey, TranslateFunction } from '../types/i18n';

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

export function TranslationProvider({ children, defaultLanguage = 'de' }: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'de'>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[currentLanguage][key];
    if (!translation) return key;

    if (typeof translation !== 'string') {
      console.warn(`Translation for key ${key} is not a string:`, translation);
      return key;
    }
    
    if (params) {
      return Object.entries(params).reduce((acc, [key, value]) => {
        return acc.replace(`{${key}}`, String(value));
      }, translation);
    }
    
    return translation;
  }, [currentLanguage]);

  const setLanguage = useCallback((lang: 'en' | 'de') => {
    setIsLoading(true);
    setCurrentLanguage(lang);
    setIsLoading(false);
  }, []);

  return (
    <TranslationContext.Provider value={{ t, setLanguage, currentLanguage, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
