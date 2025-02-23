import translations from '../data/translations.json';

export type Language = {
  id: string;
  code: string;
  name: string;
  isDefault?: boolean;
}

export type Translation = {
  id: string;
  languageId: string;
  key: string;
  value: string;
  context?: string;
  lastUpdated: Date;
}

// Infer translation keys from our JSON structure
export type TranslationKey = keyof typeof translations.en;

// Type-safe translation function
export type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

// Type for the full translations object
export type Translations = typeof translations;

// Export the translations enum for backward compatibility
export const TranslationKeys = Object.keys(translations.en).reduce((acc, key) => {
  acc[key.toUpperCase()] = key;
  return acc;
}, {} as Record<string, string>) as Record<string, TranslationKey>;
