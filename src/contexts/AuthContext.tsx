import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserRole } from '@/types';
import { userConverter } from '@/lib/converters';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: User | null;
    userRole: UserRole | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        fullName: string,
        phone: string,
        dob: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    async function signUp(
        email: string,
        password: string,
        fullName: string,
        phone: string,
        dob: string
    ) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Create user document
        const userData: User = {
            uid,
            role: 'customer',
            status: 'active',
            fullName,
            email,
            phone,
            dob,
            createdAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'users', uid).withConverter(userConverter), userData);
    }

    async function signIn(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        await signOut(auth);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // Fetch user data from Firestore
                    const userDocRef = doc(db, 'users', user.uid).withConverter(userConverter);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        setUserRole(data.role);
                    } else {
                        console.error('User document not found');
                        setUserData(null);
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserData(null);
                    setUserRole(null);
                }
            } else {
                setUserData(null);
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userData,
        userRole,
        loading,
        signIn,
        signUp,
        logout,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
