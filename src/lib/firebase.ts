import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For standalone scripts (e.g., cron, init-admin), we need to manually load .env.local
// Next.js handles this automatically in the app, but not for tsx/node runs.
if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  try {
    const dotenv = require("dotenv");
    const path = require("path");
    dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  } catch (e) {
    // dotenv might not be available in all contexts, but it's fine
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

// Singleton pattern for Firebase
if (!firebaseConfig.projectId) {
  console.error("Firebase FATAL: Project ID is missing from environment variables!");
} else {
  console.log(`Firebase: Initializing with Project ID: ${firebaseConfig.projectId}`);
}

const app = getApps().length > 0
  ? getApp()
  : (firebaseConfig.projectId
    ? initializeApp(firebaseConfig)
    : null);

const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { db, storage };
