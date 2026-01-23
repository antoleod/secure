import {
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    Timestamp,
} from 'firebase/firestore';
import type {
    User,
    KYC,
    Collateral,
    LoanRequest,
    Loan,
    Payment,
    GlobalSettings,
    AuditLog,
    LoyaltyStatus,
} from '@/types';

// User converter
export const userConverter: FirestoreDataConverter<User> = {
    toFirestore(user: User): DocumentData {
        const data = { ...user };
        delete (data as Partial<User>).uid;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): User {
        const data = snapshot.data(options);
        return {
            uid: snapshot.id,
            ...data,
        } as User;
    },
};

// KYC converter
export const kycConverter: FirestoreDataConverter<KYC> = {
    toFirestore(kyc: KYC): DocumentData {
        const data = { ...kyc };
        delete (data as Partial<KYC>).uid;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): KYC {
        const data = snapshot.data(options);
        return {
            uid: snapshot.id,
            ...data,
        } as KYC;
    },
};

// Collateral converter
export const collateralConverter: FirestoreDataConverter<Collateral> = {
    toFirestore(collateral: Collateral): DocumentData {
        const data = { ...collateral };
        delete (data as Partial<Collateral>).id;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Collateral {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data,
        } as Collateral;
    },
};

// LoanRequest converter
export const loanRequestConverter: FirestoreDataConverter<LoanRequest> = {
    toFirestore(request: LoanRequest): DocumentData {
        const data = { ...request };
        delete (data as Partial<LoanRequest>).id;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): LoanRequest {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data,
        } as LoanRequest;
    },
};

// Loan converter
export const loanConverter: FirestoreDataConverter<Loan> = {
    toFirestore(loan: Loan): DocumentData {
        const data = { ...loan };
        delete (data as Partial<Loan>).id;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Loan {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data,
        } as Loan;
    },
};

// Payment converter
export const paymentConverter: FirestoreDataConverter<Payment> = {
    toFirestore(payment: Payment): DocumentData {
        const data = { ...payment };
        delete (data as Partial<Payment>).id;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Payment {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data,
        } as Payment;
    },
};

// GlobalSettings converter
export const settingsConverter: FirestoreDataConverter<GlobalSettings> = {
    toFirestore(settings: GlobalSettings): DocumentData {
        return settings;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): GlobalSettings {
        return snapshot.data(options) as GlobalSettings;
    },
};

// AuditLog converter
export const auditLogConverter: FirestoreDataConverter<AuditLog> = {
    toFirestore(log: AuditLog): DocumentData {
        const data = { ...log };
        delete (data as Partial<AuditLog>).id;
        return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): AuditLog {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data,
        } as AuditLog;
    },
};

// LoyaltyStatus converter
export const loyaltyConverter: FirestoreDataConverter<LoyaltyStatus> = {
    toFirestore(loyalty: LoyaltyStatus): DocumentData {
        return loyalty;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): LoyaltyStatus {
        return snapshot.data(options) as LoyaltyStatus;
    },
};

// Helper function to format money (cents to display)
export function formatMoney(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

// Helper function to parse money (display to cents)
export function parseMoney(value: string): number {
    const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return Math.round(parsed * 100);
}

// Helper to format Timestamp
export function formatDate(timestamp: Timestamp | undefined): string {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Helper to format Timestamp with time
export function formatDateTime(timestamp: Timestamp | undefined): string {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
