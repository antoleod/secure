import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth, initializationError } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(initializationError ? initializationError.message : null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleError = (err: unknown) => {
    const firebaseError = err as AuthError;
    console.error('Auth Error:', firebaseError.code, firebaseError.message);
    
    switch (firebaseError.code) {
      case 'auth/invalid-email':
        setError('El correo electrónico no es válido.');
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
        setError('El correo ya está registrado.');
        break;
      case 'auth/weak-password':
        setError('La contraseña es muy débil (mínimo 6 caracteres).');
        break;
      case 'auth/popup-closed-by-user':
        setError('Se cerró la ventana de inicio de sesión.');
        break;
      default:
        setError('Ocurrió un error al autenticar. Intenta de nuevo.');
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signUpEmail = async (email: string, pass: string) => {
    if (!auth) return;
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signInGoogle = async () => {
    if (!auth) return;
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) return;
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      handleError(err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signInEmail, signUpEmail, signInGoogle, resetPassword, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}