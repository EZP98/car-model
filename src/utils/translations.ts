/**
 * Translation Utilities
 * Centralized functions for handling multi-language content
 */

/**
 * Supported languages in the application
 */
export const SUPPORTED_LANGUAGES = ['it', 'en', 'es', 'fr', 'ja', 'zh', 'zh-TW'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Get a translated field from an object with fallback chain:
 * 1. Requested language (e.g., title_en)
 * 2. Italian fallback (title_it)
 * 3. Base field (title)
 * 4. Empty string
 *
 * @param item - Object containing the fields
 * @param fieldName - Base field name (e.g., 'title', 'description')
 * @param language - Target language code (e.g., 'en', 'it', 'zh-TW')
 * @param fallbackField - Optional custom fallback field name
 * @returns Translated string or empty string
 *
 * @example
 * const collection = { title: 'Base', title_it: 'Titolo', title_en: 'Title' };
 * getTranslatedField(collection, 'title', 'en') // Returns 'Title'
 * getTranslatedField(collection, 'title', 'fr') // Returns 'Titolo' (falls back to Italian)
 * getTranslatedField(collection, 'description', 'en') // Returns '' (no field exists)
 */
export const getTranslatedField = <T extends Record<string, any>>(
  item: T,
  fieldName: string,
  language: string,
  fallbackField?: string
): string => {
  // Map zh-TW to zh_tw for database column naming
  const langSuffix = language === 'zh-TW' ? 'zh_tw' : language;
  const translatedFieldName = `${fieldName}_${langSuffix}`;

  // Try to get the translated field
  if (item[translatedFieldName]) {
    return item[translatedFieldName];
  }

  // Fallback to Italian
  const italianFieldName = `${fieldName}_it`;
  if (item[italianFieldName]) {
    return item[italianFieldName];
  }

  // Fallback to the base field or provided fallback
  return item[fallbackField || fieldName] || '';
};

/**
 * Check if a translation exists for a specific field and language
 *
 * @param item - Object containing the fields
 * @param fieldName - Base field name
 * @param language - Target language code
 * @returns true if translation exists, false otherwise
 */
export const hasTranslation = <T extends Record<string, any>>(
  item: T,
  fieldName: string,
  language: string
): boolean => {
  const langSuffix = language === 'zh-TW' ? 'zh_tw' : language;
  const translatedFieldName = `${fieldName}_${langSuffix}`;
  return !!item[translatedFieldName];
};

/**
 * Get all available translations for a specific field
 * Returns an object with language codes as keys and translations as values
 *
 * @param item - Object containing the fields
 * @param fieldName - Base field name
 * @returns Object mapping language codes to translations
 */
export const getAllTranslations = <T extends Record<string, any>>(
  item: T,
  fieldName: string
): Record<string, string> => {
  const translations: Record<string, string> = {};

  SUPPORTED_LANGUAGES.forEach(lang => {
    const langSuffix = lang === 'zh-TW' ? 'zh_tw' : lang;
    const translatedFieldName = `${fieldName}_${langSuffix}`;
    if (item[translatedFieldName]) {
      translations[lang] = item[translatedFieldName];
    }
  });

  return translations;
};

/**
 * Get the database column suffix for a language code
 * Handles special case of zh-TW → zh_tw
 *
 * @param language - Language code (e.g., 'en', 'zh-TW')
 * @returns Database column suffix (e.g., 'en', 'zh_tw')
 */
export const getLanguageSuffix = (language: string): string => {
  return language === 'zh-TW' ? 'zh_tw' : language;
};

/**
 * Calculate translation completeness for an item
 * Returns percentage of fields that have translations across all languages
 *
 * @param item - Object containing the fields
 * @param fields - Array of field names to check (e.g., ['title', 'description'])
 * @returns Number between 0 and 100 representing completion percentage
 */
export const calculateTranslationCompleteness = <T extends Record<string, any>>(
  item: T,
  fields: string[]
): number => {
  const totalFields = fields.length * SUPPORTED_LANGUAGES.length;
  let translatedFields = 0;

  fields.forEach(field => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      if (hasTranslation(item, field, lang)) {
        translatedFields++;
      }
    });
  });

  return Math.round((translatedFields / totalFields) * 100);
};
