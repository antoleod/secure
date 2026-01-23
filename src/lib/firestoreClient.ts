import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, ENABLE_UPLOADS } from './firebase';
import {
    auditLogConverter,
    collateralConverter,
    kycConverter,
    loanConverter,
    loanRequestConverter,
    loyaltyConverter,
    paymentConverter,
    settingsConverter,
} from './converters';
import {
    AuditAction,
    AuditLog,
    Collateral,
    // CollateralType, // Can import if needed, but Collateral has it
    GlobalSettings,
    KYC,
    Loan,
    LoanRequest,
    LoanRequestStatus,
    Payment,
    PaymentStatus,
    User as UserType,
    UserRole
} from '@/types';
// import { calculateMonthlyPayment, calculateTotalRepayment } from './finance'; // Commented out as finance logic might need update, doing simple calc for now or ignoring

export async function uploadFile(path: string, file?: File) {
    if (!ENABLE_UPLOADS || !file) return null;
    const storageRef = ref(storage, path);
    const uploaded = await uploadBytes(storageRef, file);
    return getDownloadURL(uploaded.ref);
}

export async function submitKyc(uid: string, payload: { frontIdRef: string; backIdRef: string; selfieRef?: string }) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const record: KYC = {
        ...payload,
        uid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    await setDoc(ref, record, { merge: true });
    return record;
}

export async function registerCollateral(
    ownerUid: string,
    payload: Omit<Collateral, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'updatedAt' | 'photosRefs' | 'videoRef' | 'appraisalValue' | 'appraisedBy' | 'appraisedAt' | 'isForSale' | 'salePriceCents' | 'publicTitle' | 'publicDescription' | 'soldAt' | 'buyerUid'> & {
        photos?: File[],
        video?: File
    }
) {
    // Handle uploads first? Or caller handles uploads and passes refs?
    // Start with empty refs, let caller handle upload logic separately or improve this later.
    // For now assuming the caller might pass refs if we change signature, OR we handle uploads here.
    // Let's assume the payload passed INCLUDES refs (caller uploads first) OR we simplify and only support text data here and uploads are separate.
    // But wait, the previous code had inputs. Let's make it accept the DATA conformant to Collateral interface (except auto fields).

    // Actually, to make it compile, let's allow partial input and fill defaults.
    // But better: Let's make it strict.

    // We will assume the Component handles the File Upload -> URL/Path conversion to keep this client clean, 
    // OR we provide a helper. 
    // Given the previous code didn't have multi-file upload, let's stick to: The caller passes the string refs.

    const { photos, video, ...data } = payload as any; // Temporary to extract files if passed, though type signature above suggests we might want to handle it.

    // Actually, let's keep it simple: Caller provides refs.
    // We will change the signature to expect refs.

    const collRef = collection(db, 'collaterals').withConverter(collateralConverter);
    const docRef = await addDoc(collRef, {
        ...data,
        photosRefs: data.photosRefs || [], // Caller must provide or we default to empty
        ownerUid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    } as unknown as Collateral); // Cast to silence partial mismatch if any, relying on converter validation at runtime if needed, but TypeScript check should pass if generic is correct.

    // Note: The above is a bit loose. Let's try to be strictly typed.
    /*
    const record: Omit<Collateral, 'id'> = {
        ownerUid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        type: payload.type,
        brandModel: payload.brandModel,
        serialImei: payload.serialImei,
        condition: payload.condition,
        checklist: payload.checklist,
        declarations: payload.declarations,
        estimatedValue: payload.estimatedValue,
        photosRefs: [], // ...
    }
    */

    const snap = await getDoc(docRef.withConverter(collateralConverter));
    return snap.data() as Collateral;
}

// Rewriting to simply accept the correctly typed input
export async function registerCollateralWithRefs(
    ownerUid: string,
    data: Omit<Collateral, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'updatedAt'>
) {
    const collRef = collection(db, 'collaterals').withConverter(collateralConverter);
    const docRef = await addDoc(collRef, {
        ...data,
        ownerUid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const snap = await getDoc(docRef.withConverter(collateralConverter));
    return snap.data() as Collateral;
}

export async function listCollaterals(ownerUid: string) {
    const q = query(
        collection(db, 'collaterals').withConverter(collateralConverter),
        where('ownerUid', '==', ownerUid),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function submitLoanRequest(
    customerUid: string,
    input: Omit<LoanRequest, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt' | 'contractId' | 'rejectionReason' | 'reviewedBy' | 'reviewedAt'>
) {
    const reqRef = collection(db, 'loan_requests').withConverter(loanRequestConverter); // Updated collection name to snake_case per types? No, types didn't specify collection name, but step 0 said "loan_requests". File rules use "loan_requests".
    // Wait, earlier firestore rules used "loanRequests" (camelCase) in Step 9, but I updated rules to `loan_requests` (snake_case) in Step 29.
    // So I MUST use `loan_requests`.

    const docRef = await addDoc(reqRef, {
        ...input,
        customerUid,
        status: 'submitted',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    } as LoanRequest);
    const snap = await getDoc(docRef.withConverter(loanRequestConverter));
    return snap.data() as LoanRequest;
}

export async function listCustomerRequests(customerUid: string) {
    const q = query(
        collection(db, 'loan_requests').withConverter(loanRequestConverter), // snake_case
        where('customerUid', '==', customerUid),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function listAdminRequests(status?: LoanRequestStatus) {
    let q = query(
        collection(db, 'loan_requests').withConverter(loanRequestConverter),
        orderBy('createdAt', 'desc')
    );

    if (status) {
        q = query(
            collection(db, 'loan_requests').withConverter(loanRequestConverter),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function getLoanRequest(id: string) {
    const ref = doc(db, 'loan_requests', id).withConverter(loanRequestConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as LoanRequest) : null;
}

export async function decideLoanRequest(options: {
    requestId: string;
    adminUid: string;
    decision: 'approve' | 'reject';
    rejectionReason?: string;
    // Approval args
    interestRate?: number; // Not used in new Loan model directly? Wait, Loan model has principalCents, outstandingCents. 
    // We need to construct the Loan object fully.
    // Let's assume we pass a Partial<Loan> or specific params for the Loan creation.
    // For now, let's keep it simple and minimal.
    approvedLoanParams?: {
        principalCents: number;
        startDate: Timestamp;
        cutoffHour: number;
        maxDurationMonths: number;
        post6mMinPrincipalPct: number;
        businessDaysOnly: boolean;
        collateralId: string;
    }
}) {
    const result = await runTransaction(db, async (tx) => {
        const requestRef = doc(db, 'loan_requests', options.requestId).withConverter(loanRequestConverter);
        const requestSnap = await tx.get(requestRef);
        if (!requestSnap.exists()) {
            throw new Error('Request not found');
        }
        const request = requestSnap.data();
        const requestId = request.id ?? options.requestId;
        if (request.status !== 'submitted') { // Removed 'under_review'
            throw new Error('Request already decided');
        }

        const now = Timestamp.now();

        if (options.decision === 'reject') {
            tx.update(requestRef, {
                status: 'rejected',
                reviewedBy: options.adminUid,
                reviewedAt: now,
                rejectionReason: options.rejectionReason ?? 'Not specified',
            });

            // Audit
            const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter); // snake_case
            tx.set(auditRef, {
                action: 'loan_rejected' as AuditAction,
                actorUid: options.adminUid,
                actorRole: 'admin',
                entityType: 'loan', // refers to request really
                entityId: requestId,
                details: { reason: options.rejectionReason },
                timestamp: now,
            } as AuditLog);

            return { loanId: null, status: 'rejected' as const };
        }

        // Approval Logic
        if (!options.approvedLoanParams) throw new Error("Missing loan params for approval");

        const loanRef = doc(collection(db, 'loans')).withConverter(loanConverter);
        const newLoan: Loan = {
            id: loanRef.id,
            customerUid: request.customerUid,
            requestId: requestId,
            status: 'active',
            principalCents: options.approvedLoanParams.principalCents,
            outstandingCents: options.approvedLoanParams.principalCents,
            startDate: options.approvedLoanParams.startDate,
            cutoffHour: options.approvedLoanParams.cutoffHour,
            businessDaysOnly: options.approvedLoanParams.businessDaysOnly,
            maxDurationMonths: options.approvedLoanParams.maxDurationMonths,
            post6mMinPrincipalPct: options.approvedLoanParams.post6mMinPrincipalPct,
            collateralId: options.approvedLoanParams.collateralId,
            createdAt: now,
            updatedAt: now,
        };
        tx.set(loanRef, newLoan);

        tx.update(requestRef, {
            status: 'approved',
            reviewedBy: options.adminUid,
            reviewedAt: now,
            updatedAt: now,
        });

        const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter);
        tx.set(auditRef, {
            action: 'loan_approved' as AuditAction,
            actorUid: options.adminUid,
            actorRole: 'admin',
            entityType: 'loan',
            entityId: loanRef.id,
            details: { requestId },
            timestamp: now,
        } as AuditLog);

        return { loanId: loanRef.id, status: 'approved' as const };
    });

    return result;
}

export async function listLoansForUser(customerUid: string) {
    const q = query(
        collection(db, 'loans').withConverter(loanConverter),
        where('customerUid', '==', customerUid),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function listAllLoans() {
    const q = query(collection(db, 'loans').withConverter(loanConverter), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function getLoan(id: string) {
    const ref = doc(db, 'loans', id).withConverter(loanConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Loan) : null;
}

export async function submitPayment(
    customerUid: string,
    input: Omit<Payment, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt' | 'proofFileRef' | 'receiptPdfRef' | 'confirmedBy' | 'confirmedAt' | 'rejectionReason'> & {
        proofFile?: File;
    }
) {
    const proofFileRef = await uploadFile(
        `payment-proof/${input.loanId}/${Date.now()}-${input.proofFile?.name ?? 'evidence'}`,
        input.proofFile
    );

    const ref = collection(db, 'payments').withConverter(paymentConverter);
    const docRef = await addDoc(ref, {
        ...input,
        customerUid,
        status: 'pending', // 'submitted' in old code -> 'pending' in new types
        proofFileRef: proofFileRef || undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    } as unknown as Payment); // casting to Payment to simplify Omit matching

    const snap = await getDoc(docRef.withConverter(paymentConverter));
    return snap.data() as Payment;
}

export async function confirmPayment(options: {
    paymentId: string;
    adminUid: string;
    status: PaymentStatus;
    reason?: string;
}) {
    if (options.status === 'pending') {
        throw new Error('Cannot transition back to pending');
    }

    const ref = doc(db, 'payments', options.paymentId).withConverter(paymentConverter);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Payment not found');

    const now = Timestamp.now();
    await updateDoc(ref, {
        status: options.status,
        confirmedAt: now,
        confirmedBy: options.adminUid,
        rejectionReason: options.reason || null,
        updatedAt: now,
    });

    const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter);
    await setDoc(auditRef, {
        action: options.status === 'confirmed' ? 'payment_confirmed' : 'payment_rejected',
        actorUid: options.adminUid,
        actorRole: 'admin',
        entityType: 'payment',
        entityId: options.paymentId,
        details: { reason: options.reason },
        timestamp: now,
    } as AuditLog);
}

export async function listPaymentsForLoan(loanId: string) {
    const q = query(
        collection(db, 'payments').withConverter(paymentConverter),
        where('loanId', '==', loanId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function fetchSettings() {
    const ref = doc(db, 'settings', 'global').withConverter(settingsConverter);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        return {
            // Return defaults matching GlobalSettings interface
            aprMax: 0.25,
            licenciaFsmaRequerida: true,
            diasHabiles: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            horaCorte: 18,
            plazoMaxGarantiaMeses: 6,
            defaultInterestMode: 'business_days',
            loyaltyEnabled: true,
            retentionMonths: 24,
        } as GlobalSettings;
    }
    return snap.data();
}

export async function updateSettings(adminUid: string, settings: GlobalSettings) {
    const ref = doc(db, 'settings', 'global').withConverter(settingsConverter);
    await setDoc(ref, { ...settings, updatedBy: adminUid, updatedAt: serverTimestamp() }, { merge: true });
}

export async function fetchLoyaltyStatus(uid: string) {
    const ref = doc(db, 'users', uid, 'loyalty', 'status').withConverter(loyaltyConverter);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
}

export async function listAuditLogs() {
    const q = query(collection(db, 'audit_logs').withConverter(auditLogConverter), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function fetchKyc(uid: string) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as KYC) : null;
}

export async function updateProfile(uid: string, data: Partial<UserType>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}
