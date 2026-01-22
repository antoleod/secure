import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { setDoc, getDoc, doc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
    // Load Firestore rules
    const rulesPath = resolve(__dirname, '../firebase/firestore.rules');
    const rules = readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
        projectId: 'oryxentech-test',
        firestore: {
            rules,
            host: 'localhost',
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
    describe('Users Collection', () => {
        it('should allow a user to read their own document', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            // Create user document first
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertSucceeds(getDoc(doc(db, 'users', userId)));
        });

        it('should not allow a user to read another user document', async () => {
            const userId = 'user123';
            const otherUserId = 'user456';
            const db = testEnv.authenticatedContext(userId).firestore();

            // Create other user document
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', otherUserId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Other User',
                    email: 'other@example.com',
                    phone: '+9876543210',
                    dob: '1995-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertFails(getDoc(doc(db, 'users', otherUserId)));
        });

        it('should allow customer to create their own user document', async () => {
            const userId = 'newuser123';
            const db = testEnv.authenticatedContext(userId).firestore();

            await assertSucceeds(
                setDoc(doc(db, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'New User',
                    email: 'new@example.com',
                    phone: '+1112223333',
                    dob: '1992-05-15',
                    createdAt: Timestamp.now(),
                })
            );
        });

        it('should not allow customer to create user with admin role', async () => {
            const userId = 'baduser123';
            const db = testEnv.authenticatedContext(userId).firestore();

            await assertFails(
                setDoc(doc(db, 'users', userId), {
                    role: 'admin', // Trying to set admin role
                    status: 'active',
                    fullName: 'Bad User',
                    email: 'bad@example.com',
                    phone: '+4445556666',
                    dob: '1988-03-20',
                    createdAt: Timestamp.now(),
                })
            );
        });
    });

    describe('Loan Requests Collection', () => {
        it('should allow customer to create loan request for themselves', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            // Create user first
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertSucceeds(
                setDoc(doc(db, 'loanRequests', 'req123'), {
                    customerUid: userId,
                    amount: 500000, // $5000 in cents
                    term: 12,
                    purpose: 'Business',
                    status: 'submitted',
                    createdAt: Timestamp.now(),
                })
            );
        });

        it('should not allow customer to create loan request for others', async () => {
            const userId = 'user123';
            const otherUserId = 'user456';
            const db = testEnv.authenticatedContext(userId).firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertFails(
                setDoc(doc(db, 'loanRequests', 'req123'), {
                    customerUid: otherUserId, // Different user
                    amount: 500000,
                    term: 12,
                    purpose: 'Business',
                    status: 'submitted',
                    createdAt: Timestamp.now(),
                })
            );
        });
    });

    describe('Settings Collection', () => {
        it('should not allow customer to write settings', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertFails(
                setDoc(doc(db, 'settings', 'global'), {
                    maxLoanAmount: 1000000,
                    minLoanAmount: 10000,
                    defaultInterestRate: 15,
                    maxLoanTerm: 60,
                    minLoanTerm: 6,
                    maintenanceMode: false,
                })
            );
        });

        it('should allow admin to write settings', async () => {
            const adminId = 'admin123';

            // Create admin user
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', adminId), {
                    role: 'admin',
                    status: 'active',
                    fullName: 'Admin User',
                    email: 'admin@example.com',
                    phone: '+1234567890',
                    dob: '1985-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            const db = testEnv.authenticatedContext(adminId).firestore();

            await assertSucceeds(
                setDoc(doc(db, 'settings', 'global'), {
                    maxLoanAmount: 1000000,
                    minLoanAmount: 10000,
                    defaultInterestRate: 15,
                    maxLoanTerm: 60,
                    minLoanTerm: 6,
                    maintenanceMode: false,
                    updatedBy: adminId,
                    updatedAt: Timestamp.now(),
                })
            );
        });
    });

    describe('Loans Collection', () => {
        it('should not allow customer to create loans', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertFails(
                setDoc(doc(db, 'loans', 'loan123'), {
                    customerUid: userId,
                    requestId: 'req123',
                    amount: 500000,
                    interestRate: 15,
                    term: 12,
                    monthlyPayment: 45000,
                    totalAmount: 540000,
                    remainingBalance: 540000,
                    status: 'active',
                    disbursedAt: Timestamp.now(),
                    dueDate: Timestamp.now(),
                    createdBy: 'admin123',
                    createdAt: Timestamp.now(),
                })
            );
        });

        it('should allow admin to create loans', async () => {
            const adminId = 'admin123';

            // Create admin user
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', adminId), {
                    role: 'admin',
                    status: 'active',
                    fullName: 'Admin User',
                    email: 'admin@example.com',
                    phone: '+1234567890',
                    dob: '1985-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            const db = testEnv.authenticatedContext(adminId).firestore();

            await assertSucceeds(
                setDoc(doc(db, 'loans', 'loan123'), {
                    customerUid: 'user123',
                    requestId: 'req123',
                    amount: 500000,
                    interestRate: 15,
                    term: 12,
                    monthlyPayment: 45000,
                    totalAmount: 540000,
                    remainingBalance: 540000,
                    status: 'active',
                    disbursedAt: Timestamp.now(),
                    dueDate: Timestamp.now(),
                    createdBy: adminId,
                    createdAt: Timestamp.now(),
                })
            );
        });
    });

    describe('Payments Collection', () => {
        it('should allow customer to create payment with submitted status', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            // Create user first
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertSucceeds(
                setDoc(doc(db, 'payments', 'payment123'), {
                    customerUid: userId,
                    loanId: 'loan123',
                    amount: 45000,
                    status: 'submitted',
                    paymentMethod: 'bank_transfer',
                    proofReferenceText: 'REF123456',
                    createdAt: Timestamp.now(),
                })
            );
        });

        it('should not allow customer to set payment status to confirmed', async () => {
            const userId = 'user123';
            const db = testEnv.authenticatedContext(userId).firestore();

            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', userId), {
                    role: 'customer',
                    status: 'active',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '+1234567890',
                    dob: '1990-01-01',
                    createdAt: Timestamp.now(),
                });
            });

            await assertFails(
                setDoc(doc(db, 'payments', 'payment123'), {
                    customerUid: userId,
                    loanId: 'loan123',
                    amount: 45000,
                    status: 'confirmed', // Customer cannot set to confirmed
                    paymentMethod: 'bank_transfer',
                    proofReferenceText: 'REF123456',
                    confirmedBy: userId,
                    confirmedAt: Timestamp.now(),
                    createdAt: Timestamp.now(),
                })
            );
        });
    });
});
