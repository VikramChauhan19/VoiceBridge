import { create } from 'zustand';
import { SupportedLanguage } from '@/src/types';

type AppState = {
  language: SupportedLanguage;
  userId: string;
  isAuthReady: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  setUserId: (userId: string) => void;
  setAuthReady: (ready: boolean) => void;
};

const uid = `user-${Math.random().toString(36).slice(2, 10)}`;

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  userId: uid,
  isAuthReady: false,
  setLanguage: (language) => set({ language }),
  setUserId: (userId) => set({ userId }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
