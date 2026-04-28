import { SupportedLanguage } from '@/src/types';

type TranslateResponse = {
  responseData?: {
    translatedText?: string;
  };
};

export async function translateText(params: {
  text: string;
  from: SupportedLanguage;
  to: SupportedLanguage;
}): Promise<string> {
  const clean = params.text.trim();
  if (!clean || params.from === params.to) {
    return clean;
  }

  const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${params.from}|${params.to}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error('Translation service is unavailable right now.');
  }

  const data = (await response.json()) as TranslateResponse;
  return data.responseData?.translatedText?.trim() || clean;
}
