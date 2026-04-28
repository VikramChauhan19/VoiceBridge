import { Platform } from 'react-native';
import { SupportedLanguage } from '@/src/types';

export type SpeechAvailability = {
  supported: boolean;
  reason?: string;
};

export type SpeechRecognitionCallbacks = {
  onStart: () => void;
  onEnd: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (message: string) => void;
};

const localeMap: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

function getWebSpeechCtor(): SpeechRecognitionCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function getSpeechAvailability(): SpeechAvailability {
  if (Platform.OS !== 'web') {
    return {
      supported: false,
      reason: 'Speech-to-text is currently available on web build only.',
    };
  }

  if (!getWebSpeechCtor()) {
    return {
      supported: false,
      reason: 'This browser does not support Web Speech API.',
    };
  }

  return { supported: true };
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    return false;
  }

  if (!navigator?.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function createSpeechRecognition(
  language: SupportedLanguage,
  callbacks: SpeechRecognitionCallbacks
): SpeechRecognitionLike | null {
  const SpeechCtor = getWebSpeechCtor();
  if (!SpeechCtor) return null;

  const recognition = new SpeechCtor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = localeMap[language];

  recognition.onstart = callbacks.onStart;
  recognition.onend = callbacks.onEnd;
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      callbacks.onResult(result[0].transcript, result.isFinal);
    }
  };
  recognition.onerror = (event) => {
    switch (event.error) {
      case 'not-allowed':
        callbacks.onError('Microphone permission denied.');
        break;
      case 'network':
        callbacks.onError('Network issue during speech recognition.');
        break;
      default:
        callbacks.onError(event.message ?? 'Speech recognition failed.');
    }
  };

  return recognition;
}
