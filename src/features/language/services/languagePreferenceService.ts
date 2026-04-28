import { getUserProfile, upsertUserProfile } from '@/src/services/firebase/profileService';
import { SupportedLanguage } from '@/src/types';

export async function saveLanguagePreference(uid: string, language: SupportedLanguage) {
  await upsertUserProfile({
    uid,
    preferredLanguage: language,
  });
}

export async function getLanguagePreference(uid: string): Promise<SupportedLanguage | null> {
  const profile = await getUserProfile(uid);
  return profile?.preferredLanguage ?? null;
}
