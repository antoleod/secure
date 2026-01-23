import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

// Lee las reglas locales
const rules = fs.readFileSync('firestore.rules', 'utf8');

describe('Reglas de Seguridad de Firestore', () => {
    let testEnv: RulesTestEnvironment;

    beforeAll(async () => {
        // Inicializa el entorno de pruebas conectado al emulador local
        testEnv = await initializeTestEnvironment({
            projectId: 'demo-secure-oryxen',
            firestore: { rules },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    beforeEach(async () => {
        // Limpiar la base de datos antes de cada test
        await testEnv.clearFirestore();
    });

    // --- Tests de Usuarios ---
    it('Usuario puede leer su propio perfil', async () => {
        const alice = testEnv.authenticatedContext('alice');
        // Bypass reglas para crear datos iniciales
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), 'users/alice'), { role: 'customer' });
        });

        await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice')));
    });

    it('Usuario NO puede leer perfil de otro', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), 'users/bob'), { role: 'customer' });
        });

        await assertFails(getDoc(doc(alice.firestore(), 'users/bob')));
    });

    // --- Tests de Solicitudes de Préstamo ---
    it('Cliente puede crear solicitud para sí mismo', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), 'users/alice'), { role: 'customer' });
        });

        await assertSucceeds(setDoc(doc(alice.firestore(), 'loanRequests/req1'), {
            customerUid: 'alice',
            amount: 1000,
            status: 'submitted'
        }));
    });

    it('Cliente NO puede crear solicitud para otro usuario', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), 'users/alice'), { role: 'customer' });
        });

        await assertFails(setDoc(doc(alice.firestore(), 'loanRequests/req1'), {
            customerUid: 'bob', // ID no coincide
            amount: 1000,
            status: 'submitted'
        }));
    });

    it('Admin puede aprobar solicitud', async () => {
        const admin = testEnv.authenticatedContext('adminUser');
        
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), 'users/adminUser'), { role: 'admin' });
            await setDoc(doc(context.firestore(), 'loanRequests/req1'), {
                customerUid: 'alice',
                status: 'submitted'
            });
        });

        await assertSucceeds(setDoc(doc(admin.firestore(), 'loanRequests/req1'), {
            status: 'approved'
        }, { merge: true }));
    });
});