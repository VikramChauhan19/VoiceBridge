import { PropsWithChildren, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/localization/i18n';
import { ensureAnonymousSession, subscribeAuthState, upsertUserProfile } from '@/src/services/firebase';
import { hasFirebaseConfig } from '@/src/config/env';
import { useAppStore } from '@/src/store/appStore';

export function AppProvider({ children }: PropsWithChildren) {
  const { language, userId, setAuthReady, setUserId } = useAppStore();

  useEffect(() => {
    // Keep i18n initialized before first screen render.
    void i18n.loadLanguages(['en', 'hi']);
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = subscribeAuthState((user) => {
      if (user) {
        setUserId(user.uid);
      }
      setAuthReady(true);
    });

    void ensureAnonymousSession()
      .then(async (user) => {
        setUserId(user.uid);
        await upsertUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          preferredLanguage: 'en',
        });
      })
      .catch(() => {
        setAuthReady(true);
      });

    return unsubscribe;
  }, [setAuthReady, setUserId]);

  useEffect(() => {
    if (!userId) return;
    void upsertUserProfile({
      uid: userId,
      preferredLanguage: language,
    });
  }, [language, userId]);

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </SafeAreaProvider>
  );
}
