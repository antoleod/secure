import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { googleSignInSmart } from '../lib/auth/googleSignInSmart';
import { User as UserType } from '../types';

export interface AuthContextType {
  user: User | null;
  userData: UserType | null;
  loading: boolean;
  error: string | null;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, fullName: string, phone: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMINS = ['jdioses@outlook.be', 'antoleod@gmail.com'];
const DEFAULT_ROLE: UserType['role'] = 'customer';

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasInvalidConfig = !auth || !db;
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(!hasInvalidConfig);
  const [error, setError] = useState<string | null>(
    hasInvalidConfig ? 'La configuracion de Firebase es invalida. Revisa las variables de entorno.' : null
  );

  const buildUserProfile = (credUser: User, email: string): UserType => {
    const isSuperAdmin = SUPER_ADMINS.includes(email);

    return {
      uid: credUser.uid,
      email,
      role: isSuperAdmin ? 'admin' : DEFAULT_ROLE,
      status: 'active',
      fullName: credUser.displayName || '',
      phone: '',
      dob: '',
      addressCityPostal: '',
      createdAt: Timestamp.now(),
    };
  };

  const ensureUserProfile = async (credUser: User): Promise<UserType | null> => {
    const userEmail = credUser.email || '';
    const docRef = doc(db, 'users', credUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserType;
    }

    const newUser = buildUserProfile(credUser, userEmail);
    await setDoc(docRef, newUser);
    return newUser;
  };

  useEffect(() => {
    if (hasInvalidConfig) return;

    let isMounted = true;

    const checkRedirectLogin = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user && isMounted) {
          setUser(redirectResult.user);
          await ensureUserProfile(redirectResult.user);
        }
      } catch (err) {
        handleError(err);
      }
    };

    checkRedirectLogin();

    return () => {
      isMounted = false;
    };
  }, [hasInvalidConfig]);

  useEffect(() => {
    if (hasInvalidConfig) return;

    let unsubscribeUserData: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (unsubscribeUserData) {
        unsubscribeUserData();
        unsubscribeUserData = null;
      }

      if (!nextUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'users', nextUser.uid);
      unsubscribeUserData = onSnapshot(
        docRef,
        async (docSnap) => {
          try {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserType;
              if (nextUser.email && SUPER_ADMINS.includes(nextUser.email) && data.role !== 'admin') {
                setUserData({ ...data, role: 'admin' });
              } else {
                setUserData(data);
              }
            } else {
              const createdProfile = await ensureUserProfile(nextUser);
              setUserData(createdProfile);
            }
          } catch (err) {
            console.error('Error ensuring user profile:', err);
            setError('No pudimos cargar tu perfil. Intenta nuevamente.');
            setUserData(null);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error listening to user data:', err);
          setError('No pudimos cargar tu perfil. Intenta nuevamente.');
          setUserData(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserData) unsubscribeUserData();
    };
  }, [hasInvalidConfig]);

  const handleError = (err: unknown) => {
    const firebaseError = err as AuthError;
    console.error('Auth Error:', firebaseError.code, firebaseError.message);

    switch (firebaseError.code) {
      case 'auth/invalid-email':
        setError('El correo electronico no es valido.');
        break;
      case 'auth/user-disabled':
        setError('Este usuario ha sido deshabilitado.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setError('Credenciales incorrectas.');
        break;
      case 'auth/email-already-in-use':
        setError('El correo ya esta registrado.');
        break;
      case 'auth/weak-password':
        setError('La contrasena es muy debil (minimo 6 caracteres).');
        break;
      case 'auth/popup-blocked':
        setError('El navegador bloqueo el popup. Usando redireccion segura.');
        break;
      case 'auth/popup-closed-by-user':
        setError('Se cerro la ventana de inicio de sesion. Reintentando con redireccion.');
        break;
      case 'auth/unauthorized-domain':
        setError('Dominio no autorizado para este flujo. Usaremos redireccion.');
        break;
      case 'auth/operation-not-supported-in-this-environment':
        setError('El navegador no permite el popup. Usaremos redireccion.');
        break;
      default:
        setError('Ocurrio un error al autenticar. Intenta de nuevo.');
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await ensureUserProfile(cred.user);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpEmail = async (email: string, pass: string, fullName: string, phone: string) => {
    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      const isSuperAdmin = SUPER_ADMINS.includes(normalizedEmail);

      const newUser: UserType = {
        uid: cred.user.uid,
        email: normalizedEmail,
        role: isSuperAdmin ? 'admin' : 'customer',
        status: 'active',
        fullName: fullName || '',
        phone: phone || '',
        dob: '',
        addressCityPostal: '',
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), newUser);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    setLoading(true);
    try {
      await googleSignInSmart({
        auth,
        onSuccess: async (cred) => {
          await ensureUserProfile(cred.user);
        },
        setError,
        logger: console,
      });
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      const trimmed = email.trim();
      await sendPasswordResetEmail(auth, trimmed, {
        url: `${window.location.origin}/#/login`,
      });
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    return firebaseSignOut(auth);
  };

  const clearError = () => setError(null);

  const value = {
    user,
    userData,
    loading,
    error,
    signInEmail,
    signUpEmail,
    signInGoogle,
    resetPassword,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
