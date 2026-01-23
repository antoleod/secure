import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserData {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  userData: UserData | null;
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si Firebase no se inicializó, no hacer nada y mostrar error.
    if (!auth || !db) {
      setError('La configuración de Firebase es inválida. Revisa las variables de entorno.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signUpEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const signInGoogle = async () => {
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
