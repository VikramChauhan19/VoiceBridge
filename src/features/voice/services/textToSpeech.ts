import * as Speech from 'expo-speech';
import { SupportedLanguage } from '@/src/types';
import { SpeechRatePreset } from '@/src/store/appStore';

const languageVoice: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

const speechRateMap: Record<SpeechRatePreset, number> = {
  slow: 0.75,
  normal: 0.95,
  fast: 1.05,
};

export async function speakWithAiStyle(
  text: string,
  language: SupportedLanguage,
  ratePreset: SpeechRatePreset = 'normal'
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  await Speech.speak(trimmed, {
    language: languageVoice[language],
    pitch: 1.0,
    rate: speechRateMap[ratePreset],
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
