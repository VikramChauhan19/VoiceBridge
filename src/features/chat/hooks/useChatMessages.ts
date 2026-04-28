import { useEffect, useState } from 'react';
import { ChatMessage } from '@/src/types';
import { ChatTransport, firebaseChatTransport } from '@/src/features/chat/services/chatTransport';

export function useChatMessages(transport: ChatTransport = firebaseChatTransport) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = transport.subscribe(
      (nextMessages) => {
        setMessages(nextMessages);
        setError(null);
      },
      (message) => setError(message)
    );

    return unsubscribe;
  }, [transport]);

  return { messages, error };
}
