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
    dob: string;
    addressCityPostal: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// KYC types
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface KYC {
    uid: string;
    frontIdRef: string;
    backIdRef: string;
    selfieRef?: string;
    status: KYCStatus;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
    rejectionReason?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Collateral types
export type CollateralType = 'vehicle' | 'property' | 'jewelry' | 'electronics' | 'other';
export type CollateralStatus = 'pending' | 'approved' | 'rejected' | 'in_stock' | 'sold';

export interface Collateral {
    id?: string;
    ownerUid: string;
    type: CollateralType;
    brandModel: string;
    serialImei: string;
    condition: string;
    checklist: Record<string, boolean>;
    declarations: Record<string, boolean>;
    estimatedValue: number; // in cents
    status: CollateralStatus;
    photosRefs: string[];
    videoRef?: string;
    appraisalValue?: number;
    appraisedBy?: string;
    appraisedAt?: Timestamp;

    // Marketplace fields
    isForSale?: boolean;
    salePriceCents?: number;
    publicTitle?: string;
    publicDescription?: string;
    soldAt?: Timestamp;
    buyerUid?: string;

    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Loan Request types
export type LoanRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface LoanRequest {
    id?: string;
    customerUid: string;
    amountRequested: number;
    collateralId: string;
    contractId?: string;
    status: LoanRequestStatus;

    // User requested terms
    term?: number;
    purpose?: string;

    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Loan types
export type LoanStatus = 'active' | 'overdue' | 'default' | 'closed' | 'sold' | 'surrendered';

export interface Loan {
    id?: string;
    customerUid: string;
    requestId: string;
    status: LoanStatus;

    // Financials
    principalCents: number;
    outstandingCents: number;

    // Terms
    startDate: Timestamp;
    cutoffHour: number;
    businessDaysOnly: boolean;
    maxDurationMonths: number;
    post6mMinPrincipalPct: number;

    // References
    collateralId: string;

    // Default/Sale/Surrender info
    surrenderRequested?: boolean;
    surrenderDate?: Timestamp;
    defaultDate?: Timestamp;
    soldDate?: Timestamp;
    salePriceCents?: number;
    surplusCents?: number;
    deficitCents?: number;

    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Payment types
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';
export type PaymentType = 'interest' | 'principal' | 'mixed';

export interface Payment {
    id?: string;
    loanId: string;
    customerUid: string;
    type: PaymentType;
    amountCents: number;
    status: PaymentStatus;
    method: 'bank_transfer' | 'cash' | 'other';

    // Proof
    proofFileRef?: string;
    proofMimeType?: string;

    // Receipt
    receiptPdfRef?: string;

    confirmedBy?: string;
    confirmedAt?: Timestamp;
    rejectionReason?: string;

    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// Settings types (Admin Editable)
export interface GlobalSettings {
    aprMax: number;
    licenciaFsmaRequerida: boolean;
    diasHabiles: string[];
    horaCorte: number;
    plazoMaxGarantiaMeses: number;

    // Limits
    maxLoanAmount: number;
    minLoanAmount: number;
    maxLoanTerm: number;
    minLoanTerm: number;
    defaultInterestRate: number; // Used for estimator

    defaultInterestMode: 'business_days' | 'calendar_days';
    loyaltyEnabled: boolean;
    retentionMonths: number;
    updatedBy?: string;
    updatedAt?: Timestamp;
}

// Audit Log types
export type AuditAction =
    | 'loan_approved'
    | 'loan_rejected'
    | 'loan_defaulted'
    | 'loan_sold'
    | 'loan_surrendered'
    | 'payment_confirmed'
    | 'payment_rejected'
    | 'settings_updated'
    | 'user_role_changed'
    | 'user_status_changed';

export interface AuditLog {
    id?: string;
    action: AuditAction;
    actorUid: string;
    actorRole: UserRole;
    entityType: 'loan' | 'user' | 'payment' | 'settings';
    entityId?: string;
    details?: any;
    timestamp: Timestamp;
}

// Loyalty types
export interface LoyaltyStatus {
    uid: string;
    completedGoodLoansCount: number;
    affiliateStatus: boolean;
    freezeUntil?: Timestamp;
    tier: 'standard' | 'bronze' | 'silver' | 'gold';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
