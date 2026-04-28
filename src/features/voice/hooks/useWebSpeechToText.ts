import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { SupportedLanguage } from '@/src/types';
import {
  createSpeechRecognition,
  getSpeechAvailability,
  requestMicrophonePermission,
} from '@/src/features/voice/services/webSpeechRecognition';

type SpeechState = {
  isSupported: boolean;
  isListening: boolean;
  liveText: string;
  finalText: string;
  error: string | null;
  availabilityReason: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clear: () => void;
};

const localeMap: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

async function requestNativeMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'Voice Bridge needs microphone access for speech-to-text.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function useWebSpeechToText(language: SupportedLanguage): SpeechState {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availability = useMemo(() => {
    if (Platform.OS === 'web') {
      return getSpeechAvailability();
    }
    return { supported: true, reason: undefined };
  }, []);

  const clearRecognition = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const startWebListening = async () => {
    setError(null);

    if (!availability.supported) {
      setError(availability.reason ?? 'Speech-to-text is unavailable.');
      return;
    }

    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      setError('Microphone permission is required for speech-to-text.');
      return;
    }

    clearRecognition();
    const recognition = createSpeechRecognition(language, {
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onResult: (text, isFinal) => {
        setLiveText(text);
        if (isFinal) {
          setFinalText((prev) => `${prev} ${text}`.trim());
          setLiveText('');
        }
      },
      onError: (message) => {
        setError(message);
        setIsListening(false);
      },
    });

    if (!recognition) {
      setError('Speech engine failed to initialize.');
      return;
    }

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startNativeListening = async () => {
    setError(null);

    const permissionGranted = await requestNativeMicrophonePermission();
    if (!permissionGranted) {
      setError('Microphone permission is required for speech-to-text.');
      return;
    }

    try {
      const available = await Voice.isAvailable();
      if (!available) {
        setError(
          'Speech recognition is unavailable on this device. Use a development build, not Expo Go.'
        );
        return;
      }

      setLiveText('');
      setFinalText('');
      await Voice.start(localeMap[language]);
    } catch {
      setError('Unable to start speech recognition.');
      setIsListening(false);
    }
  };

  const startListening = async () => {
    if (Platform.OS === 'web') {
      await startWebListening();
      return;
    }

    await startNativeListening();
  };

  const stopListening = () => {
    if (Platform.OS === 'web') {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    void Voice.stop().finally(() => setIsListening(false));
  };

  const clear = () => {
    if (Platform.OS === 'web') {
      clearRecognition();
    } else {
      void Voice.stop();
      setIsListening(false);
    }
    setLiveText('');
    setFinalText('');
    setError(null);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    Voice.onSpeechStart = () => {
      setError(null);
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
      const text = event.value?.[0]?.trim() ?? '';
      setLiveText(text);
    };

    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const text = event.value?.[0]?.trim() ?? '';
      if (!text) return;

      setFinalText((prev) => `${prev} ${text}`.trim());
      setLiveText('');
    };

    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      const errorCode = event.error?.code;
      if (errorCode === '7') {
        setError(null);
      } else {
        setError(event.error?.message ?? 'Speech recognition failed.');
      }
      setIsListening(false);
    };

    return () => {
      void Voice.destroy().finally(() => Voice.removeAllListeners());
    };
  }, []);

  return {
    isSupported: availability.supported,
    availabilityReason: availability.reason ?? null,
    isListening,
    liveText,
    finalText,
    error,
    startListening,
    stopListening,
    clear,
  };
}
