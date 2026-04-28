export type SupportedLanguage = 'en' | 'hi';
export type MessageSource = 'typed' | 'spoken';

export type ChatMessage = {
  id: string;
  text: string;
  language: SupportedLanguage;
  createdAt: number;
  senderId: string;
  source: MessageSource;
};
