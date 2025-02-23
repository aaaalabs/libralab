import { translations } from '../translations/translations';

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

// Recursively flatten nested object keys
type FlattenKeys<T extends Record<string, any>, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? FlattenKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

// Infer translation keys from our translations structure
export type TranslationKey = FlattenKeys<typeof translations.en>;

// Type-safe translation function
export type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

// Type for the full translations object
export type Translations = typeof translations;

// Create a flattened object of translation keys
function flattenKeys(obj: Record<string, any>, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenKeys(obj[key], newKey));
    } else {
      acc[key.toUpperCase()] = newKey;
    }
    return acc;
  }, {} as Record<string, string>);
}

// Export the translations enum for backward compatibility
export const TranslationKeys = flattenKeys(translations.en) as Record<string, TranslationKey>;
