import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig: Record<string, string | undefined> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

const fallbackAuthDomain =
  firebaseConfig.projectId && `${firebaseConfig.projectId as string}.firebaseapp.com`;
const hasTrustedAuthDomain =
  typeof firebaseConfig.authDomain === 'string' &&
  /firebaseapp\.com$|web\.app$/.test(firebaseConfig.authDomain);

if (!hasTrustedAuthDomain && fallbackAuthDomain) {
  console.warn(
    '[auth] authDomain no coincide con el dominio del proyecto. Usando el dominio de Firebase para evitar errores en popup/redirect.'
  );
  firebaseConfig.authDomain = fallbackAuthDomain;
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
const placeholderPattern = /(YOUR_|placeholder|XXXX|000000000000|example|demo)/i;
const isPlaceholderValue = (value: string | undefined) => !value || placeholderPattern.test(value);
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
const placeholderKeys = requiredKeys.filter((key) => isPlaceholderValue(firebaseConfig[key]));

let firebaseConfigError: string | null = null;
if (missingKeys.length > 0) {
  firebaseConfigError = `Falta configuracion de Firebase: ${missingKeys.join(', ')}. Revisa tu archivo .env.local`;
} else if (placeholderKeys.length > 0 && !useEmulators) {
  firebaseConfigError = `Configuracion de Firebase invalida (placeholders): ${placeholderKeys.join(', ')}. Reemplaza los valores de .env.local`;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Promise<Analytics | null> = Promise.resolve(null);

if (firebaseConfigError) {
  console.error(firebaseConfigError);
} else {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
}

if (useEmulators && auth && db && storage) {
  (async () => {
    console.warn('WARN: Usando Firebase Emulators');
    const { connectAuthEmulator } = await import('firebase/auth');
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    const { connectStorageEmulator } = await import('firebase/storage');

    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  })();
}

export { app, auth, db, storage, analytics, firebaseConfigError };
export const ENABLE_UPLOADS = import.meta.env.VITE_ENABLE_UPLOADS === 'true';
