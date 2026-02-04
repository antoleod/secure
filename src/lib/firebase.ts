import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig: Record<string, string | undefined> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// En producción, forzamos a que NO se usen emuladores, incluso si la variable de entorno quedó activa.
const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';

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

if (missingKeys.length > 0) {
  throw new Error(
    `Falta configuracion de Firebase: ${missingKeys.join(', ')}. Revisa tu archivo .env.local`
  );
}
if (placeholderKeys.length > 0 && !useEmulators) {
  throw new Error(
    `Configuracion de Firebase invalida (placeholders): ${placeholderKeys.join(', ')}. Reemplaza los valores de .env.local`
  );
}

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Prevent analytics from crashing with placeholders or emulators
const analytics: Promise<Analytics | null> = isSupported().then((yes) =>
  yes && !useEmulators && placeholderKeys.length === 0 ? getAnalytics(app) : null
);

if (useEmulators) {
  console.warn('WARN: Usando Firebase Emulators');
  // Connect synchronously to avoid race conditions with auth calls
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, auth, db, storage, analytics };
export const ENABLE_UPLOADS = import.meta.env.VITE_ENABLE_UPLOADS === 'true';
