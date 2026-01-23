/* eslint-disable react-refresh/only-export-components */
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
import type { User, UserRole, UserStatus } from '@/types';
import { userConverter } from '@/lib/converters';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: User | null;
    userRole: UserRole | null;
    userStatus: UserStatus | null;
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
    refreshProfile: () => Promise<void>;
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
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);

    async function signUp(
        email: string,
        password: string,
        fullName: string,
        phone: string,
        dob: string
    ) {
        const normalizedEmail = email.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const uid = userCredential.user.uid;

        // Create user document
        const userData: User = {
            uid,
            role: 'customer',
            status: 'active',
            fullName,
            email: normalizedEmail,
            phone,
            dob,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'users', uid).withConverter(userConverter), userData);
    }

    async function signIn(email: string, password: string) {
        const normalizedEmail = email.trim().toLowerCase();
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
    }

    async function logout() {
        await signOut(auth);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

    async function loadUserProfile(uid: string) {
        const userDocRef = doc(db, 'users', uid).withConverter(userConverter);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserRole(data.status === 'active' ? data.role : null);
            setUserStatus(data.status);
        } else {
            console.error('User document not found');
            setUserData(null);
            setUserRole(null);
            setUserStatus(null);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    await loadUserProfile(user.uid);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserData(null);
                    setUserRole(null);
                    setUserStatus(null);
                }
            } else {
                setUserData(null);
                setUserRole(null);
                setUserStatus(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userData,
        userRole,
        userStatus,
        loading,
        signIn,
        signUp,
        logout,
        resetPassword,
        refreshProfile: async () => {
            if (currentUser?.uid) {
                await loadUserProfile(currentUser.uid);
            }
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
