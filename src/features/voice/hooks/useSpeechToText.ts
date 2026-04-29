import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { SupportedLanguage } from '@/src/types';
import {
  createSpeechRecognition,
  getSpeechAvailability,
  requestMicrophonePermission,
} from '@/src/features/voice/services/webSpeechRecognition';

export type SpeechToTextState = {
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

type NativeSpeechSnapshot = {
  isListening: boolean;
  liveText: string;
  finalText: string;
  error: string | null;
};

type NativeSpeechSubscriber = (next: NativeSpeechSnapshot) => void;

const localeMap: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

const nativeSubscribers = new Set<NativeSpeechSubscriber>();
let nativeSpeechSnapshot: NativeSpeechSnapshot = {
  isListening: false,
  liveText: '',
  finalText: '',
  error: null,
};
let nativeListenersBound = false;

function logSpeech(event: string, detail?: unknown) {
  if (detail !== undefined) {
    console.info(`[VoiceBridge][STT] ${event}`, detail);
    return;
  }
  console.info(`[VoiceBridge][STT] ${event}`);
}

function emitNativeSpeech(partial: Partial<NativeSpeechSnapshot>) {
  nativeSpeechSnapshot = { ...nativeSpeechSnapshot, ...partial };
  for (const subscriber of nativeSubscribers) {
    subscriber(nativeSpeechSnapshot);
  }
}

function normalizeNativeError(event: SpeechErrorEvent): string {
  const code = event.error?.code ?? '';
  const message = (event.error?.message ?? '').trim();

  switch (code) {
    case '1':
      return 'Speech recognition busy. Please try again.';
    case '2':
      return 'Network error while recognizing speech.';
    case '3':
      return 'Audio input error. Please check microphone availability.';
    case '5':
      return 'Permission denied for speech recognition.';
    case '6':
      return 'Speech recognition timeout. Try speaking again.';
    case '7':
      return '';
    case '9':
      return 'No speech recognition service available on this device.';
    default:
      return message || 'Speech recognition failed.';
  }
}

function bindNativeListeners() {
  if (nativeListenersBound || Platform.OS === 'web') {
    return;
  }

  logSpeech('Binding native voice listeners');

  Voice.onSpeechStart = () => {
    logSpeech('onSpeechStart');
    emitNativeSpeech({ isListening: true, error: null });
  };

  Voice.onSpeechEnd = () => {
    logSpeech('onSpeechEnd');
    emitNativeSpeech({ isListening: false });
  };

  Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
    const text = event.value?.[0]?.trim() ?? '';
    logSpeech('onSpeechPartialResults', { text });
    emitNativeSpeech({ liveText: text });
  };

  Voice.onSpeechResults = (event: SpeechResultsEvent) => {
    const text = event.value?.[0]?.trim() ?? '';
    logSpeech('onSpeechResults', { text });
    if (!text) return;

    emitNativeSpeech({
      finalText: `${nativeSpeechSnapshot.finalText} ${text}`.trim(),
      liveText: '',
    });
  };

  Voice.onSpeechError = (event: SpeechErrorEvent) => {
    const normalizedError = normalizeNativeError(event);
    logSpeech('onSpeechError', {
      code: event.error?.code,
      message: event.error?.message,
      normalizedError,
    });

    emitNativeSpeech({
      isListening: false,
      error: normalizedError || null,
    });
  };

  nativeListenersBound = true;
}

async function requestNativeMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  logSpeech('RECORD_AUDIO permission check', { hasPermission });
  if (hasPermission) {
    return true;
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
    title: 'Microphone Permission',
    message: 'Voice Bridge needs microphone access for speech-to-text.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });
  logSpeech('RECORD_AUDIO permission request result', { result });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function isNativeVoiceModuleAvailable(): boolean {
  if (Platform.OS === 'web') {
    return true;
  }

  const available = Boolean(NativeModules.Voice || NativeModules.RCTVoice);
  logSpeech('Native module availability', {
    available,
    hasVoice: Boolean(NativeModules.Voice),
    hasRCTVoice: Boolean(NativeModules.RCTVoice),
  });
  return available;
}

export function useSpeechToText(language: SupportedLanguage): SpeechToTextState {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const [isListening, setIsListening] = useState(nativeSpeechSnapshot.isListening);
  const [liveText, setLiveText] = useState(nativeSpeechSnapshot.liveText);
  const [finalText, setFinalText] = useState(nativeSpeechSnapshot.finalText);
  const [error, setError] = useState<string | null>(nativeSpeechSnapshot.error);

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
    logSpeech('Starting web recognition');

    if (!availability.supported) {
      const reason = availability.reason ?? 'Speech-to-text is unavailable.';
      logSpeech('Web speech unavailable', { reason });
      setError(reason);
      return;
    }

    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      logSpeech('Web microphone permission denied');
      setError('Microphone permission is required for speech-to-text.');
      return;
    }

    clearRecognition();
    const recognition = createSpeechRecognition(language, {
      onStart: () => {
        logSpeech('Web recognition onStart');
        setIsListening(true);
      },
      onEnd: () => {
        logSpeech('Web recognition onEnd');
        setIsListening(false);
      },
      onResult: (text, isFinal) => {
        logSpeech('Web recognition onResult', { text, isFinal });
        setLiveText(text);
        if (isFinal) {
          setFinalText((prev) => `${prev} ${text}`.trim());
          setLiveText('');
        }
      },
      onError: (message) => {
        logSpeech('Web recognition onError', { message });
        setError(message);
        setIsListening(false);
      },
    });

    if (!recognition) {
      logSpeech('Web speech engine failed to initialize');
      setError('Speech engine failed to initialize.');
      return;
    }

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startNativeListening = async () => {
    if (isStartingRef.current) {
      logSpeech('Native start ignored because start is already in progress');
      return;
    }

    isStartingRef.current = true;
    setError(null);
    logSpeech('Starting native recognition', { language: localeMap[language] });

    try {
      if (!isNativeVoiceModuleAvailable()) {
        setError(
          'Native speech module is unavailable. Rebuild the Android app after native changes.'
        );
        return;
      }

      const permissionGranted = await requestNativeMicrophonePermission();
      if (!permissionGranted) {
        logSpeech('Native microphone permission denied');
        setError('Microphone permission is required for speech-to-text.');
        return;
      }

      const available = await Voice.isAvailable();
      const rawServices = await Voice.getSpeechRecognitionServices();
      const services = Array.isArray(rawServices) ? rawServices : [];
      logSpeech('Native speech engine availability', { available, services });

      if (!available) {
        setError(
          'Speech recognition is unavailable on this device. Install Google Speech Services and test on a physical Android device.'
        );
        return;
      }

      if (!services.length) {
        setError(
          'No speech recognition service found. Install or enable Google app / Speech Services by Google.'
        );
        return;
      }

      const isRecognizing = await Voice.isRecognizing();
      logSpeech('Native isRecognizing before start', { isRecognizing });
      if (isRecognizing) {
        await Voice.stop();
      }

      emitNativeSpeech({
        liveText: '',
        finalText: '',
        error: null,
      });

      await Voice.start(localeMap[language]);
      logSpeech('Voice.start called successfully');
    } catch (nativeError) {
      logSpeech('Unable to start native recognition', nativeError);
      const message =
        nativeError instanceof Error && nativeError.message
          ? nativeError.message
          : 'Unable to start speech recognition.';
      emitNativeSpeech({ error: message, isListening: false });
    } finally {
      isStartingRef.current = false;
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

    if (isStoppingRef.current) {
      logSpeech('Native stop ignored because stop is already in progress');
      return;
    }

    isStoppingRef.current = true;
    logSpeech('Stopping native recognition');
    void Voice.stop()
      .catch((nativeError) => {
        logSpeech('Voice.stop failed', nativeError);
      })
      .finally(() => {
        emitNativeSpeech({ isListening: false });
        isStoppingRef.current = false;
      });
  };

  const clear = () => {
    if (Platform.OS === 'web') {
      clearRecognition();
    } else {
      logSpeech('Clearing native recognition state');
      void Voice.cancel().catch((nativeError) => {
        logSpeech('Voice.cancel failed during clear', nativeError);
      });
      emitNativeSpeech({
        isListening: false,
        liveText: '',
        finalText: '',
        error: null,
      });
    }
    setLiveText('');
    setFinalText('');
    setError(null);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    bindNativeListeners();
    const syncState: NativeSpeechSubscriber = (next) => {
      setIsListening(next.isListening);
      setLiveText(next.liveText);
      setFinalText(next.finalText);
      setError(next.error);
    };
    nativeSubscribers.add(syncState);
    syncState(nativeSpeechSnapshot);

    return () => {
      nativeSubscribers.delete(syncState);
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
