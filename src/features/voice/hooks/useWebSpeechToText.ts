import { useMemo, useRef, useState } from 'react';
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

export function useWebSpeechToText(language: SupportedLanguage): SpeechState {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availability = useMemo(() => getSpeechAvailability(), []);

  const clearRecognition = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const startListening = async () => {
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

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const clear = () => {
    clearRecognition();
    setLiveText('');
    setFinalText('');
    setError(null);
  };

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
