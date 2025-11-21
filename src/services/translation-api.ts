/**
 * Translation API Service
 * Auto-translate text using Cloudflare AI
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
}

/**
 * Translate text from Italian to target language using AI
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'it'
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(error.message || 'Translation failed');
    }

    const data = await response.json() as TranslationResponse;
    return data.translatedText;
  } catch (error: any) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Translate multiple texts in parallel
 */
export async function translateBatch(
  texts: Array<{ text: string; targetLanguage: string }>,
  sourceLanguage: string = 'it'
): Promise<Array<{ text: string; error?: string }>> {
  const promises = texts.map(async ({ text, targetLanguage }) => {
    try {
      const translated = await translateText(text, targetLanguage, sourceLanguage);
      return { text: translated };
    } catch (error: any) {
      return { text: '', error: error.message };
    }
  });

  return Promise.all(promises);
}
