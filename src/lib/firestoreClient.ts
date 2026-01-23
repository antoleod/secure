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
    Collateral,
    CollateralType,
    GlobalSettings,
    KYC,
    Loan,
    LoanRequest,
    LoanRequestStatus,
    Payment,
    PaymentStatus,
} from '@/types';
import { calculateMonthlyPayment, calculateTotalRepayment } from './finance';

export async function submitKyc(uid: string, payload: Omit<KYC, 'uid' | 'status' | 'createdAt'>) {
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
    input: {
        type: CollateralType;
        description: string;
        estimatedValue: number;
    }
) {
    const collRef = collection(db, 'collaterals').withConverter(collateralConverter);
    const docRef = await addDoc(collRef, {
        ...input,
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
    input: Omit<LoanRequest, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt'>
) {
    const reqRef = collection(db, 'loanRequests').withConverter(loanRequestConverter);
    const docRef = await addDoc(reqRef, {
        ...input,
        customerUid,
        status: 'submitted',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const snap = await getDoc(docRef.withConverter(loanRequestConverter));
    return snap.data() as LoanRequest;
}

export async function listCustomerRequests(customerUid: string) {
    const q = query(
        collection(db, 'loanRequests').withConverter(loanRequestConverter),
        where('customerUid', '==', customerUid),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function listAdminRequests(status?: LoanRequestStatus) {
    let q = query(
        collection(db, 'loanRequests').withConverter(loanRequestConverter),
        orderBy('createdAt', 'desc')
    );

    if (status) {
        q = query(
            collection(db, 'loanRequests').withConverter(loanRequestConverter),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function getLoanRequest(id: string) {
    const ref = doc(db, 'loanRequests', id).withConverter(loanRequestConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as LoanRequest) : null;
}

export async function decideLoanRequest(options: {
    requestId: string;
    adminUid: string;
    decision: 'approve' | 'reject';
    interestRate: number;
    term: number;
    rejectionReason?: string;
}) {
    const result = await runTransaction(db, async (tx) => {
        const requestRef = doc(db, 'loanRequests', options.requestId).withConverter(loanRequestConverter);
        const requestSnap = await tx.get(requestRef);
        if (!requestSnap.exists()) {
            throw new Error('Request not found');
        }
        const request = requestSnap.data();
        const requestId = request.id ?? options.requestId;
        if (request.status !== 'submitted' && request.status !== 'under_review') {
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

            const auditRef = doc(collection(db, 'auditLogs')).withConverter(auditLogConverter);
            tx.set(auditRef, {
                action: 'loan_rejected' as AuditAction,
                performedBy: options.adminUid,
                targetUid: request.customerUid,
                targetId: requestId,
                details: { reason: options.rejectionReason },
                timestamp: now,
            });

            return { loanId: null, status: 'rejected' as const };
        }

        const monthlyPayment = calculateMonthlyPayment(request.amount, options.interestRate, options.term);
        const totalAmount = calculateTotalRepayment(monthlyPayment, options.term);
        const remainingBalance = totalAmount;
        const estimatedDueDate = Timestamp.fromMillis(
            now.toMillis() + options.term * 30 * 24 * 60 * 60 * 1000
        );

        const loanRef = doc(collection(db, 'loans')).withConverter(loanConverter);
        tx.set(loanRef, {
            customerUid: request.customerUid,
            requestId,
            amount: request.amount,
            interestRate: options.interestRate,
            term: options.term,
            monthlyPayment,
            totalAmount,
            remainingBalance,
            status: 'active',
            disbursedAt: now,
            dueDate: estimatedDueDate,
            createdBy: options.adminUid,
            createdAt: now,
        });

        tx.update(requestRef, {
            status: 'approved',
            reviewedBy: options.adminUid,
            reviewedAt: now,
            updatedAt: now,
        });

        const auditRef = doc(collection(db, 'auditLogs')).withConverter(auditLogConverter);
        tx.set(auditRef, {
            action: 'loan_approved' as AuditAction,
            performedBy: options.adminUid,
            targetUid: request.customerUid,
            targetId: loanRef.id,
            details: { requestId, interestRate: options.interestRate, term: options.term },
            timestamp: now,
        });

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

async function maybeUploadEvidence(path: string, file?: File) {
    if (!ENABLE_UPLOADS || !file) return undefined;
    const storageRef = ref(storage, path);
    const uploaded = await uploadBytes(storageRef, file);
    return getDownloadURL(uploaded.ref);
}

export async function submitPayment(
    customerUid: string,
    input: Omit<Payment, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt' | 'proofUrl'> & {
        proofFile?: File;
    }
) {
    const proofUrl = await maybeUploadEvidence(
        `payment-proof/${input.loanId}/${Date.now()}-${input.proofFile?.name ?? 'evidence'}`,
        input.proofFile
    );

    const ref = collection(db, 'payments').withConverter(paymentConverter);
    const docRef = await addDoc(ref, {
        ...input,
        proofUrl,
        customerUid,
        status: 'submitted',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const snap = await getDoc(docRef.withConverter(paymentConverter));
    return snap.data() as Payment;
}

export async function confirmPayment(options: {
    paymentId: string;
    adminUid: string;
    status: PaymentStatus;
    reason?: string;
}) {
    if (options.status === 'submitted') {
        throw new Error('Cannot transition back to submitted');
    }

    const ref = doc(db, 'payments', options.paymentId).withConverter(paymentConverter);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Payment not found');

    const now = Timestamp.now();
    await updateDoc(ref, {
        status: options.status,
        confirmedAt: now,
        confirmedBy: options.adminUid,
        rejectionReason: options.reason,
    });

    const auditRef = doc(collection(db, 'auditLogs')).withConverter(auditLogConverter);
    await setDoc(auditRef, {
        action: options.status === 'confirmed' ? 'payment_confirmed' : 'payment_rejected',
        performedBy: options.adminUid,
        targetUid: snap.data().customerUid,
        targetId: options.paymentId,
        details: { reason: options.reason },
        timestamp: now,
    });
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
            maxLoanAmount: 1_000_000,
            minLoanAmount: 10_000,
            defaultInterestRate: 15,
            maxLoanTerm: 24,
            minLoanTerm: 3,
            maintenanceMode: false,
        };
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
    const q = query(collection(db, 'auditLogs').withConverter(auditLogConverter), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
}

export async function fetchKyc(uid: string) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as KYC) : null;
}
