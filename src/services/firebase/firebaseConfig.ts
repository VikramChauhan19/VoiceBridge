import { env, hasFirebaseConfig } from "@/src/config/env";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = hasFirebaseConfig
  ? {
      apiKey: env.firebaseApiKey,
      authDomain: env.firebaseAuthDomain,
      projectId: env.firebaseProjectId,
      storageBucket: env.firebaseStorageBucket,
      appId: env.firebaseAppId,
    }
  : {
      apiKey: "demo",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo.appspot.com",
      appId: "0:0:web:0",
    };

export const isFirebaseConfigured = hasFirebaseConfig;

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
