import { MessageSource, SupportedLanguage } from '@/src/types';

export type AuthUserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  preferredLanguage: SupportedLanguage;
  createdAt: number;
  updatedAt: number;
};

export type ChatRecord = {
  id: string;
  roomId: string;
  text: string;
  language: SupportedLanguage;
  source: MessageSource;
  senderId: string;
  createdAt: number;
};

export type ChatWritePayload = {
  roomId: string;
  text: string;
  language: SupportedLanguage;
  source: MessageSource;
  senderId: string;
};

export type PushTokenRecord = {
  uid: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: number;
};
