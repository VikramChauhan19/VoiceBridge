import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '@/src/services/firebase/firebaseConfig';
import { AuthUserProfile } from '@/src/services/firebase/types';
import { SupportedLanguage } from '@/src/types';

const usersCollection = 'users';

export async function upsertUserProfile(params: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  preferredLanguage: SupportedLanguage;
}) {
  const ref = doc(firestore, usersCollection, params.uid);
  await setDoc(
    ref,
    {
      uid: params.uid,
      email: params.email ?? null,
      displayName: params.displayName ?? null,
      photoURL: params.photoURL ?? null,
      preferredLanguage: params.preferredLanguage,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<AuthUserProfile | null> {
  const ref = doc(firestore, usersCollection, uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    preferredLanguage: SupportedLanguage;
    createdAt?: { toMillis: () => number };
    updatedAt?: { toMillis: () => number };
  };

  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    preferredLanguage: data.preferredLanguage,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
  };
}
