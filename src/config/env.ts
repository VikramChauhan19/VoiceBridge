import Constants from "expo-constants";

type Extra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseAppId?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  firebaseApiKey: extra.firebaseApiKey ?? "AIzaSyBDKVVGgBmXuXKdfgZGpxYlckjfH0r5IsE",
  firebaseAuthDomain: extra.firebaseAuthDomain ?? "voicebridge-9b831.firebaseapp.com",
  firebaseProjectId: extra.firebaseProjectId ?? "voicebridge-9b831",
  firebaseStorageBucket: extra.firebaseStorageBucket ?? "voicebridge-9b831.firebasestorage.app",
  firebaseAppId: extra.firebaseAppId ?? "1:617294389624:web:55668cf16828ea91e4688d",
};

export const hasFirebaseConfig = [
  env.firebaseApiKey,
  env.firebaseAuthDomain,
  env.firebaseProjectId,
  env.firebaseStorageBucket,
  env.firebaseAppId,
].every(Boolean);
