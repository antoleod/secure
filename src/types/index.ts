import { Timestamp } from 'firebase/firestore';

// User types
export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'closed';

export interface User {
    uid: string;
    role: UserRole;
    status: UserStatus;
    fullName: string;
    email: string;
    phone: string;
    dob: string; // ISO date string
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// KYC types
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface KYC {
    uid: string;
    idType: 'passport' | 'national_id' | 'drivers_license';
    idNumber: string;
    idExpiryDate: string; // ISO date string
    address: string;
    city: string;
    postalCode: string;
    country: string;
    status: KYCStatus;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Collateral types
export type CollateralType = 'vehicle' | 'property' | 'jewelry' | 'electronics' | 'other';
export type CollateralStatus = 'pending' | 'approved' | 'rejected';

export interface Collateral {
    id: string;
    ownerUid: string;
    type: CollateralType;
    description: string;
    estimatedValue: number; // in cents
    status: CollateralStatus;
    images?: string[]; // Storage URLs
    appraisalValue?: number; // in cents
    appraisedBy?: string;
    appraisedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Loan Request types
export type LoanRequestStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface LoanRequest {
    id: string;
    customerUid: string;
    amount: number; // in cents
    term: number; // in months
    purpose: string;
    collateralId?: string;
    status: LoanRequestStatus;
    signature?: string; // Base64 encoded signature image
    signatureType?: 'typed' | 'drawn';
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    rejectionReason?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Loan types
export type LoanStatus = 'active' | 'paid' | 'defaulted' | 'closed';

export interface Loan {
    id: string;
    customerUid: string;
    requestId: string;
    amount: number; // in cents
    interestRate: number; // percentage
    term: number; // in months
    monthlyPayment: number; // in cents
    totalAmount: number; // in cents (principal + interest)
    remainingBalance: number; // in cents
    status: LoanStatus;
    disbursedAt: Timestamp;
    dueDate: Timestamp;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Payment types
export type PaymentStatus = 'submitted' | 'confirmed' | 'rejected';

export interface Payment {
    id: string;
    customerUid: string;
    loanId: string;
    amount: number; // in cents
    status: PaymentStatus;
    paymentMethod: 'bank_transfer' | 'cash' | 'card' | 'mobile_money';
    proofReferenceText?: string; // Reference number when uploads are disabled
    proofUrl?: string; // Storage URL when uploads are enabled
    confirmedBy?: string;
    confirmedAt?: Timestamp;
    rejectionReason?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Settings types
export interface GlobalSettings {
    maxLoanAmount: number; // in cents
    minLoanAmount: number; // in cents
    defaultInterestRate: number; // percentage
    maxLoanTerm: number; // in months
    minLoanTerm: number; // in months
    maintenanceMode: boolean;
    updatedBy?: string;
    updatedAt?: Timestamp;
}

// Audit Log types
export type AuditAction =
    | 'loan_approved'
    | 'loan_rejected'
    | 'payment_confirmed'
    | 'payment_rejected'
    | 'settings_updated'
    | 'user_role_changed'
    | 'user_status_changed';

export interface AuditLog {
    id: string;
    action: AuditAction;
    performedBy: string;
    targetUid?: string;
    targetId?: string;
    details: Record<string, unknown>;
    timestamp: Timestamp;
}

// Loyalty types
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyStatus {
    tier: LoyaltyTier;
    points: number;
    nextTierPoints: number;
    benefits: string[];
    updatedAt: Timestamp;
}
