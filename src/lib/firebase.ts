import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validación de configuración crítica
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analytics: Promise<Analytics | null> = Promise.resolve(null);
let initializationError: Error | null = null;

if (missingKeys.length > 0) {
  initializationError = new Error(
    `Falta configuración de Firebase: ${missingKeys.join(', ')}. Verifica tu archivo .env.local`
  );
  console.error(initializationError.message);
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    if (import.meta.env.PROD) {
      analytics = isSupported().then(yes => yes ? getAnalytics(app!) : null);
    }
  } catch (error) {
    initializationError = error as Error;
    console.error('Error inicializando Firebase:', error);
  }
}

export { app, auth, analytics, initializationError };