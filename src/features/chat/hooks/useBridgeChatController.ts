import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/src/store/appStore';
import { useChatMessages } from '@/src/features/chat/hooks/useChatMessages';
import { firebaseChatTransport } from '@/src/features/chat/services/chatTransport';
import { useWebSpeechToText } from '@/src/features/voice/hooks/useWebSpeechToText';
import { isSpeaking, speakWithAiStyle, stopSpeaking } from '@/src/features/voice/services/textToSpeech';
import { MessageSource } from '@/src/types';

export function useBridgeChatController() {
  const transport = useMemo(() => firebaseChatTransport, []);
  const { messages, error: streamError } = useChatMessages(transport);
  const { language, userId } = useAppStore();
  const speech = useWebSpeechToText(language);

  const [messageText, setMessageText] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  useEffect(() => {
    const recognizedText = `${speech.finalText} ${speech.liveText}`.trim();
    if (recognizedText) {
      setMessageText(recognizedText);
    }
  }, [speech.finalText, speech.liveText]);

  const sendMessage = useCallback(async (text: string, source: MessageSource): Promise<boolean> => {
    const clean = text.trim();
    if (!clean || isSending) return false;

    setComposerError(null);
    setIsSending(true);
    try {
      await transport.send({
        text: clean,
        language,
        senderId: userId,
        source,
      });
      setMessageText('');
      return true;
    } catch {
      setComposerError('Unable to send message right now.');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [isSending, language, transport, userId]);

  const sendAndSpeak = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean || isSending) return;

    const sent = await sendMessage(clean, 'typed');
    if (!sent) return;
    // Mute user communication flow: typed send also speaks aloud.
    setIsSpeakingNow(true);
    await speakWithAiStyle(clean, language);
    setIsSpeakingNow(false);
    setMessageText('');
  }, [isSending, language, sendMessage]);

  const stopCurrentSpeech = useCallback(async () => {
    await stopSpeaking();
    setIsSpeakingNow(false);
  }, []);

  const clearChat = useCallback(async () => {
    setComposerError(null);
    setIsClearing(true);
    try {
      await transport.clearHistory();
      setMessageText('');
      speech.clear();
    } catch {
      setComposerError('Unable to clear chat history right now.');
    } finally {
      setIsClearing(false);
    }
  }, [speech, transport]);

  useEffect(() => {
    const id = setInterval(() => {
      void isSpeaking().then((value) => setIsSpeakingNow(value));
    }, 500);

    return () => clearInterval(id);
  }, []);

  const statusError = useMemo(() => {
    return composerError ?? speech.error ?? streamError ?? null;
  }, [composerError, speech.error, streamError]);

  return {
    language,
    messages,
    userId,
    messageText,
    setMessageText,
    sendMessage,
    sendAndSpeak,
    speakWithAiStyle,
    stopCurrentSpeech,
    clearChat,
    isSending,
    isClearing,
    isSpeakingNow,
    speech,
    statusError,
  };
}
