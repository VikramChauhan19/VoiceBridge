import { SupportedLanguage } from '@/src/types';

export type ConversationDirection = 'speech_to_text' | 'text_to_speech';

export type ConversationTurn = {
  id: string;
  text: string;
  language: SupportedLanguage;
  direction: ConversationDirection;
  createdAt: number;
  senderId: string;
};

export type ConversationSession = {
  sessionId: string;
  participants: string[];
  activeLanguage: SupportedLanguage;
  createdAt: number;
};

export type ConversationTransport = {
  publishTurn: (turn: ConversationTurn) => Promise<void>;
  subscribeTurns: (onTurn: (turn: ConversationTurn) => void) => () => void;
};
