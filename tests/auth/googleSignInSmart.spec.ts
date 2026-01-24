import { describe, expect, it, vi } from 'vitest';
import type { Auth, AuthError, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { googleSignInSmart } from '@/lib/auth/googleSignInSmart';

const auth = {} as unknown as Auth;
const provider = {} as unknown as GoogleAuthProvider;

describe('googleSignInSmart', () => {
  it('uses popup first and does not fallback when it succeeds', async () => {
    const popupResult = { user: { uid: '123' } } as unknown as UserCredential;
    const popupFn = vi.fn().mockResolvedValue(popupResult);
    const redirectFn = vi.fn();
    const onSuccess = vi.fn();
    const setError = vi.fn();

    const credential = await googleSignInSmart({
      auth,
      provider,
      popupFn,
      redirectFn,
      onSuccess,
      setError,
      logger: console,
    });

    expect(credential).toBe(popupResult);
    expect(popupFn).toHaveBeenCalledWith(auth, provider);
    expect(redirectFn).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(popupResult);
    expect(setError).toHaveBeenCalledWith(null);
  });

  it('falls back to redirect when popup is blocked', async () => {
    const popupError = { code: 'auth/popup-blocked', message: 'blocked' } as AuthError;
    const popupFn = vi.fn().mockRejectedValue(popupError);
    const redirectFn = vi.fn().mockResolvedValue(undefined);
    const setError = vi.fn();

    const credential = await googleSignInSmart({
      auth,
      provider,
      popupFn,
      redirectFn,
      setError,
      logger: console,
    });

    expect(credential).toBeNull();
    expect(popupFn).toHaveBeenCalledWith(auth, provider);
    expect(redirectFn).toHaveBeenCalledWith(auth, provider);
    expect(setError).toHaveBeenNthCalledWith(1, null);
    expect(setError).toHaveBeenNthCalledWith(
      2,
      'El navegador bloqueo la ventana. Usaremos redireccion.'
    );
  });
});
