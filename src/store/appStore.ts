import { create } from 'zustand';
import { SupportedLanguage } from '@/src/types';

export type SpeechRatePreset = 'slow' | 'normal' | 'fast';

type AppState = {
  language: SupportedLanguage;
  speechRate: SpeechRatePreset;
  userId: string;
  isAuthReady: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  setSpeechRate: (speechRate: SpeechRatePreset) => void;
  setUserId: (userId: string) => void;
  setAuthReady: (ready: boolean) => void;
};

const uid = `user-${Math.random().toString(36).slice(2, 10)}`;

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  speechRate: 'normal',
  userId: uid,
  isAuthReady: false,
  setLanguage: (language) => set({ language }),
  setSpeechRate: (speechRate) => set({ speechRate }),
  setUserId: (userId) => set({ userId }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
