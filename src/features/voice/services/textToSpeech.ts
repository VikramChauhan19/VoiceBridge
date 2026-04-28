import * as Speech from 'expo-speech';
import { SupportedLanguage } from '@/src/types';

const languageVoice: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

export async function speakWithAiStyle(text: string, language: SupportedLanguage): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  await Speech.speak(trimmed, {
    language: languageVoice[language],
    pitch: 1.0,
    rate: 0.95,
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
