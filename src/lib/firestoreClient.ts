import {
    addDoc,
    collection,
    deleteDoc,
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
    writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage, ENABLE_UPLOADS } from './firebase';
import {
    auditLogConverter,
    collateralConverter,
    kycConverter,
    loanConverter,
    loanRequestConverter,
    loyaltyConverter,
    paymentConverter,
    settingsConverter,
    userConverter,
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
} from '@/types';
import { KycDecision } from './kycEngine';
// import { calculateMonthlyPayment, calculateTotalRepayment } from './finance'; // Commented out as finance logic might need update, doing simple calc for now or ignoring

type UploadErrorCode =
    | 'UPLOADS_DISABLED'
    | 'AUTH_MISSING'
    | 'INVALID_FILE_TYPE'
    | 'FILE_TOO_LARGE'
    | 'STORAGE_UPLOAD_FAIL'
    | 'FIRESTORE_SAVE_FAIL'
    | 'NO_FILES';

export type UploadSelfCheckResult = {
    envEnabled: boolean;
    authUid: string | null;
    hasStorageBucket: boolean;
    storageBucket?: string;
    storageRefOk: boolean;
    storageRefPath?: string;
    storageRefError?: string;
    ok: boolean;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_UPLOAD_PREFIXES = ['image/'];
const ALLOWED_UPLOAD_TYPES = ['application/pdf'];

const isAllowedUploadType = (mime: string) =>
    ALLOWED_UPLOAD_PREFIXES.some((prefix) => mime.startsWith(prefix)) || ALLOWED_UPLOAD_TYPES.includes(mime);

const makeUploadError = (code: UploadErrorCode, message: string, cause?: unknown) => {
    const error = new Error(message);
    (error as Error & { code?: UploadErrorCode }).code = code;
    if (cause) {
        (error as Error & { cause?: unknown }).cause = cause;
    }
    return error;
};

export const sanitizeFileName = (name: string) => {
    const base = name.split('/').pop()?.split('\\').pop() ?? 'file';
    const normalized = base.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');
    const safe = normalized
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '');
    return safe || 'file';
};

export const buildGarmentUploadPath = (options: { uid: string; garmentId: string; fileName: string }) => {
    const safeFileName = sanitizeFileName(options.fileName);
    return `users/${options.uid}/garments/${options.garmentId}/${safeFileName}`;
};

export function selfCheckUploads(uid?: string | null, garmentId = 'diagnostic'): UploadSelfCheckResult {
    const resolvedUid = uid ?? auth.currentUser?.uid ?? null;
    const storageBucket = storage.app.options.storageBucket;
    const hasStorageBucket = Boolean(storageBucket);
    let storageRefOk = false;
    let storageRefPath: string | undefined;
    let storageRefError: string | undefined;

    if (resolvedUid && hasStorageBucket) {
        try {
            storageRefPath = buildGarmentUploadPath({
                uid: resolvedUid,
                garmentId,
                fileName: 'probe.txt',
            });
            ref(storage, storageRefPath);
            storageRefOk = true;
        } catch (err) {
            storageRefError = (err as Error).message;
        }
    }

    const result: UploadSelfCheckResult = {
        envEnabled: ENABLE_UPLOADS,
        authUid: resolvedUid,
        hasStorageBucket,
        storageBucket: storageBucket || undefined,
        storageRefOk,
        storageRefPath,
        storageRefError,
        ok: ENABLE_UPLOADS && !!resolvedUid && hasStorageBucket && storageRefOk,
    };

    console.table(result);
    return result;
}

export async function uploadFile(path: string, file?: File) {
    if (!ENABLE_UPLOADS) {
        console.warn('UPLOADS_DISABLED', { path });
        return null;
    }
    if (!file) return null;
    if (!isAllowedUploadType(file.type)) {
        throw makeUploadError('INVALID_FILE_TYPE', 'Tipo de archivo no permitido.');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        throw makeUploadError('FILE_TOO_LARGE', 'El archivo supera el tamaño máximo permitido.');
    }
    try {
        const storageRef = ref(storage, path);
        const uploaded = await uploadBytes(storageRef, file);
        return getDownloadURL(uploaded.ref);
    } catch (err) {
        console.error('STORAGE_UPLOAD_FAIL', { path, err });
        throw makeUploadError('STORAGE_UPLOAD_FAIL', 'No pudimos subir el archivo.');
    }
}

export async function saveCollateralWithUploads(options: {
    ownerUid: string;
    payload: Omit<Collateral, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'updatedAt' | 'photosRefs'> & {
        photosRefs?: string[];
    };
    photos?: File[];
    statusOnSuccess?: Collateral['status'];
}) {
    if (!options.ownerUid) {
        console.error('AUTH_MISSING', { reason: 'missing_uid' });
        throw makeUploadError('AUTH_MISSING', 'Debes iniciar sesión para continuar.');
    }

    const collRef = collection(db, 'collaterals').withConverter(collateralConverter);
    const docRef = doc(collRef);
    const now = Timestamp.now();

    try {
        await setDoc(docRef, {
            ...options.payload,
            ownerUid: options.ownerUid,
            photosRefs: [],
            status: 'draft',
            createdAt: now,
            updatedAt: now,
        } as Collateral);
    } catch (err) {
        console.error('FIRESTORE_SAVE_FAIL', { stage: 'draft', err });
        throw makeUploadError('FIRESTORE_SAVE_FAIL', 'No pudimos guardar la prenda (borrador).', err);
    }

    if (!ENABLE_UPLOADS) {
        console.warn('UPLOADS_DISABLED', { uid: options.ownerUid, collateralId: docRef.id });
        try {
            await updateDoc(docRef, {
                status: 'needs_upload',
                uploadErrorCode: 'UPLOADS_DISABLED',
                uploadErrorMessage: 'Uploads disabled by environment.',
                uploadUpdatedAt: now,
                updatedAt: now,
            });
        } catch (err) {
            console.error('FIRESTORE_SAVE_FAIL', { stage: 'needs_upload', err });
        }
        return { id: docRef.id, photosRefs: [] };
    }

    const photos = options.photos ?? [];
    if (photos.length === 0) {
        try {
            await updateDoc(docRef, {
                status: 'needs_upload',
                uploadErrorCode: 'NO_FILES',
                uploadErrorMessage: 'No files provided.',
                uploadUpdatedAt: now,
                updatedAt: now,
            });
        } catch (err) {
            console.error('FIRESTORE_SAVE_FAIL', { stage: 'needs_upload', err });
        }
        throw makeUploadError('NO_FILES', 'Agrega al menos una foto para continuar.');
    }

    let photosRefs: string[] = [];
    try {
        const uploads = photos.map((photo, idx) =>
            uploadFile(
                buildGarmentUploadPath({
                    uid: options.ownerUid,
                    garmentId: docRef.id,
                    fileName: photo.name || `photo-${idx + 1}`,
                }),
                photo
            )
        );
        const uploaded = await Promise.all(uploads);
        uploaded.filter(Boolean).forEach((url) => photosRefs.push(url as string));
    } catch (err) {
        console.error('STORAGE_UPLOAD_FAIL', { uid: options.ownerUid, collateralId: docRef.id, err });
        try {
            await updateDoc(docRef, {
                status: 'needs_upload',
                uploadErrorCode: (err as Error & { code?: UploadErrorCode }).code ?? 'STORAGE_UPLOAD_FAIL',
                uploadErrorMessage: err instanceof Error ? err.message : 'Upload failed',
                uploadUpdatedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        } catch (updateErr) {
            console.error('FIRESTORE_SAVE_FAIL', { stage: 'needs_upload', err: updateErr });
        }
        throw err;
    }

    try {
        await updateDoc(docRef, {
            photosRefs,
            status: options.statusOnSuccess ?? 'submitted',
            uploadErrorCode: null,
            uploadErrorMessage: null,
            uploadUpdatedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    } catch (err) {
        console.error('FIRESTORE_SAVE_FAIL', { stage: 'finalize', err });
        throw makeUploadError('FIRESTORE_SAVE_FAIL', 'No pudimos finalizar el registro de la prenda.', err);
    }

    const snap = await getDoc(docRef.withConverter(collateralConverter));
    return snap.data() as Collateral;
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

export async function saveKycDocument(
    uid: string,
    docMeta: { path: string; url?: string; type: string },
    formData: KYC['formData']
) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const record: Partial<KYC> = {
        documentRef: {
            path: docMeta.path,
            url: docMeta.url,
            type: docMeta.type,
            uploadedAt: Timestamp.now(),
            status: 'uploaded',
        },
        formData,
        status: 'pending',
        updatedAt: Timestamp.now(),
    };
    await setDoc(ref, record, { merge: true });
}

export async function saveKycDecision(uid: string, verification: KycDecision, locale: string) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const payload: Partial<KYC> = {
        verification: {
            status: verification.status as KYC['status'],
            score: verification.score,
            reasons: verification.reasons,
            extracted: verification.extracted,
            provider: verification.provider,
            attempts: verification.attempts,
            verifiedAt: Timestamp.now(),
            localeAtVerification: locale,
        },
        status:
            verification.status === 'fail'
                ? 'rejected'
                : (verification.status as KYC['status']),
        updatedAt: Timestamp.now(),
    };
    await setDoc(ref, payload, { merge: true });
}

export async function requestManualReview(uid: string, current: KYC | null) {
    const ref = doc(db, 'kyc', uid).withConverter(kycConverter);
    const payload: Partial<KYC> = {
        verification: {
            ...(current?.verification || {}),
            score: current?.verification?.score ?? 0,
            status: 'manual_review_requested',
            manualReason: 'AUTO_FAIL_USER_OVERRIDE',
            reasons: current?.verification?.reasons ?? ['manual_override'],
            provider: current?.verification?.provider ?? 'manual',
            attempts: {
                auto: current?.verification?.attempts?.auto ?? 1,
                manualOverride: true,
            },
            verifiedAt: Timestamp.now(),
        },
        status: 'manual_review_requested',
        updatedAt: Timestamp.now(),
    };
    await setDoc(ref, payload, { merge: true });
    const reviewsRef = collection(db, 'kyc_reviews');
    await addDoc(reviewsRef, {
        uid,
        status: 'manual_review_requested',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

export async function registerCollateral(
    ownerUid: string,
    payload: Omit<
        Collateral,
        | 'id'
        | 'ownerUid'
        | 'status'
        | 'createdAt'
        | 'updatedAt'
        | 'photosRefs'
        | 'videoRef'
        | 'appraisalValue'
        | 'appraisedBy'
        | 'appraisedAt'
        | 'isForSale'
        | 'salePriceCents'
        | 'publicTitle'
        | 'publicDescription'
        | 'soldAt'
        | 'buyerUid'
    > & {
        photosRefs?: string[];
        videoRef?: string;
    }
) {
    const collRef = collection(db, 'collaterals').withConverter(collateralConverter);
    const docRef = await addDoc(collRef, {
        ...payload,
        photosRefs: payload.photosRefs ?? [],
        ownerUid,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });

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

export async function listAllCollaterals() {
    const q = query(collection(db, 'collaterals').withConverter(collateralConverter), orderBy('createdAt', 'desc'));
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
    interestRate?: number;
    principalCents?: number;
    startDate?: Timestamp;
    cutoffHour?: number;
    maxDurationMonths?: number;
    post6mMinPrincipalPct?: number;
    businessDaysOnly?: boolean;
    collateralId?: string;
}) {
    const result = await runTransaction(db, async (tx) => {
        const requestRef = doc(db, 'loan_requests', options.requestId).withConverter(loanRequestConverter);
        const requestSnap = await tx.get(requestRef);
        if (!requestSnap.exists()) {
            throw new Error('Request not found');
        }
        const request = requestSnap.data();
        const requestId = request.id ?? options.requestId;
        if (request.status !== 'submitted') {
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
            const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter);
            tx.set(auditRef, {
                action: 'loan_rejected' as AuditAction,
                actorUid: options.adminUid,
                actorRole: 'admin',
                entityType: 'loan',
                entityId: requestId,
                details: { reason: options.rejectionReason },
                timestamp: now,
            } as AuditLog);

            return { loanId: null, status: 'rejected' as const };
        }

        // Approval Logic
        if (options.principalCents === undefined) throw new Error("Missing loan principal for approval");

        const loanRef = doc(collection(db, 'loans')).withConverter(loanConverter);
        const newLoan: Loan = {
            id: loanRef.id,
            customerUid: request.customerUid,
            requestId: requestId,
            status: 'active',
            principalCents: options.principalCents,
            outstandingCents: options.principalCents,
            interestRate: options.interestRate ?? 0,
            startDate: options.startDate ?? now,
            cutoffHour: options.cutoffHour ?? 18,
            businessDaysOnly: options.businessDaysOnly ?? true,
            maxDurationMonths: options.maxDurationMonths ?? 6,
            post6mMinPrincipalPct: options.post6mMinPrincipalPct ?? 0,
            collateralId: options.collateralId ?? request.collateralId,
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
        `users/${customerUid}/payments/${input.loanId}/${Date.now()}-${sanitizeFileName(input.proofFile?.name ?? 'evidence')}`,
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

export async function listAllUsers() {
    const snap = await getDocs(collection(db, 'users').withConverter(userConverter));
    return snap.docs.map((d) => d.data());
}

export async function deleteCollateral(collateralId: string, adminUid?: string) {
    const ref = doc(db, 'collaterals', collateralId).withConverter(collateralConverter);
    await deleteDoc(ref);

    if (adminUid) {
        const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter);
        await setDoc(auditRef, {
            action: 'user_status_changed',
            actorUid: adminUid,
            actorRole: 'admin',
            entityType: 'loan',
            entityId: collateralId,
            details: { deleted: true },
            timestamp: Timestamp.now(),
        } as AuditLog);
    }
}

export async function deleteUserData(adminUid: string, targetUid: string) {
    // Delete user document and their collaterals in a batch to keep UI in sync.
    const batch = writeBatch(db);
    const collRef = query(
        collection(db, 'collaterals').withConverter(collateralConverter),
        where('ownerUid', '==', targetUid)
    );
    const collSnap = await getDocs(collRef);
    collSnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
    });

    const userRef = doc(db, 'users', targetUid).withConverter(userConverter);
    batch.delete(userRef);
    await batch.commit();

    const auditRef = doc(collection(db, 'audit_logs')).withConverter(auditLogConverter);
    await setDoc(auditRef, {
        action: 'user_status_changed',
        actorUid: adminUid,
        actorRole: 'admin',
        entityType: 'user',
        entityId: targetUid,
        details: { deleted: true, collateralsDeleted: collSnap.size },
        timestamp: Timestamp.now(),
    } as AuditLog);
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

export async function submitSupportTicket(uid: string, data: { subject: string; message: string; category: string }) {
    const ref = collection(db, 'support_tickets');
    await addDoc(ref, {
        ...data,
        customerUid: uid,
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}
