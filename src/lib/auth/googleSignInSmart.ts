import {
  Auth,
  AuthError,
  GoogleAuthProvider,
  UserCredential,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

type Logger = Pick<Console, 'warn' | 'error'>;

export interface GoogleSignInSmartOptions {
  auth: Auth;
  provider?: GoogleAuthProvider;
  onSuccess?: (credential: UserCredential) => Promise<void> | void;
  setError?: (message: string | null) => void;
  logger?: Logger;
  popupFn?: typeof signInWithPopup;
  redirectFn?: typeof signInWithRedirect;
}

const popupErrorMessages: Record<string, string> = {
  'auth/popup-blocked': 'El navegador bloqueo la ventana. Usaremos redireccion.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de inicio. Redirigiendo...',
  'auth/operation-not-supported-in-this-environment':
    'El entorno bloquea popups. Probando con redireccion.',
  'auth/unauthorized-domain':
    'Dominio no autorizado para el popup. Probando con redireccion segura.',
};

const providerSingleton = (() => {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
})();

const mapErrorMessage = (err: AuthError): string => {
  return popupErrorMessages[err.code] ?? 'No pudimos abrir el popup. Probando con redirección.';
};

/**
 * Tries Google popup first and gracefully falls back to redirect.
 * Returns the credential when popup succeeds, otherwise null (redirect started).
 */
export async function googleSignInSmart({
  auth,
  provider = providerSingleton,
  onSuccess,
  setError,
  logger = console,
  popupFn = signInWithPopup,
  redirectFn = signInWithRedirect,
}: GoogleSignInSmartOptions): Promise<UserCredential | null> {
  setError?.(null);

  try {
    const credential = await popupFn(auth, provider);
    await onSuccess?.(credential);
    return credential;
  } catch (error) {
    const firebaseError = error as AuthError;
    logger.warn('Google popup failed, switching to redirect', {
      code: firebaseError.code,
      message: firebaseError.message,
    });
    setError?.(mapErrorMessage(firebaseError));
  }

  // Popup failed for any reason, try redirect.
  await redirectFn(auth, provider);
  return null;
}

export function getPopupErrorMessage(err: AuthError): string {
  return mapErrorMessage(err);
}
