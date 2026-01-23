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
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User as UserType, UserRole } from '../types';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setError('La configuración de Firebase es inválida. Revisa las variables de entorno.');
      setLoading(false);
      return;
    }

    let unsubscribeUserData: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);

      // Clean up previous listener if it exists
      if (unsubscribeUserData) {
        unsubscribeUserData();
        unsubscribeUserData = null;
      }

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribeUserData = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserType;
            if (user.email && SUPER_ADMINS.includes(user.email) && data.role !== 'admin') {
              setUserData({ ...data, role: 'admin' });
            } else {
              setUserData(data);
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error listening to user data:", err);
          setUserData(null);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserData) unsubscribeUserData();
    };
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

  const signUpEmail = async (email: string, pass: string, fullName: string, phone: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const isSuperAdmin = SUPER_ADMINS.includes(email);

      const newUser: UserType = {
        uid: cred.user.uid,
        email: email,
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
    }
  };

  const signInGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const userEmail = cred.user.email || '';
      const docRef = doc(db, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const isSuperAdmin = SUPER_ADMINS.includes(userEmail);
        const newUser: UserType = {
          uid: cred.user.uid,
          email: userEmail,
          role: isSuperAdmin ? 'admin' : 'customer',
          status: 'active',
          fullName: cred.user.displayName || '',
          phone: '',
          dob: '',
          addressCityPostal: '',
          createdAt: Timestamp.now(),
        };
        await setDoc(docRef, newUser);
      }
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
