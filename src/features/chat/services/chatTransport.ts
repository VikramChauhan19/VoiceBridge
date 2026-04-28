import { ChatMessage, MessageSource, SupportedLanguage } from '@/src/types';
import {
  clearChatMessages,
  sendChatMessage,
  subscribeChat,
} from '@/src/features/chat/services/chatService';

export type ChatTransport = {
  send: (payload: {
    text: string;
    language: SupportedLanguage;
    senderId: string;
    source: MessageSource;
  }) => Promise<void>;
  subscribe: (
    onUpdate: (messages: ChatMessage[]) => void,
    onError: (message: string) => void
  ) => () => void;
  clearHistory: () => Promise<void>;
};

export const firebaseChatTransport: ChatTransport = {
  send: sendChatMessage,
  subscribe: subscribeChat,
  clearHistory: clearChatMessages,
};
