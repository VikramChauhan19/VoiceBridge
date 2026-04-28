import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '@/src/services/firebase/firebaseConfig';

export type AuthStateListener = (user: User | null) => void;

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function ensureAnonymousSession() {
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const credential = await signInAnonymously(firebaseAuth);
  return credential.user;
}

export async function signOutCurrentUser() {
  await signOut(firebaseAuth);
}

export function subscribeAuthState(listener: AuthStateListener) {
  return onAuthStateChanged(firebaseAuth, listener);
}
