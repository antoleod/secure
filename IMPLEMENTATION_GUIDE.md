# IMPLEMENTATION GUIDE FOR REMAINING FEATURES

This guide provides detailed implementation steps for the stubbed-out features.

> Nota de seguridad: usa `.env.example` como plantilla y mantén las credenciales fuera del repositorio. No comitees `.env` ni valores reales.

## 📝 General Pattern for New Pages

All new pages should follow this structure:

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// ... other imports

export function YourPage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Data fetching with TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['your-data', currentUser?.uid],
    queryFn: async () => {
      // Firestore query here
    },
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Firestore write here
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['your-data'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Your UI */}
    </div>
  );
}
```

## 🔐 Customer Pages

### 1. Verify Identity (`/app/verify-identity`)

**Purpose**: Collect KYC information

**Implementation**:
```typescript
// File: src/pages/customer/VerifyIdentity.tsx
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { kycConverter } from '@/lib/converters';
import type { KYC } from '@/types';

// Form fields:
- idType: select (passport | national_id | drivers_license)
- idNumber: text
- idExpiryDate: date
- address: text
- city: text
- postalCode: text
- country: text

// Save to: kyc/{uid}
// Set status: 'pending'
```

**Note**: File upload is disabled. When enabled, add:
- Front ID image
- Back ID image
- Selfie photo

### 2. New Loan Application (`/app/new-loan`)

**Purpose**: Loan simulator and application

**Implementation**:
```typescript
// File: src/pages/customer/NewLoan.tsx

// Part 1: Simulator
- Amount slider ($min to $max from settings/global)
- Term selector (months)
- Calculate monthly payment
- Show total to repay
- Real-time calculation

// Part 2: Application Form
- purpose: text
- collateralId: select (from user's collaterals)
- Confirmation checkbox

// Save to: loanRequests/{auto-id}
// Fields: customerUid, amount, term, purpose, status='submitted', createdAt
```

**Calculation**:
```typescript
function calculateMonthlyPayment(principal: number, rate: number, months: number) {
  const monthlyRate = rate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}
```

### 3. Collateral (`/app/collateral`)

**Purpose**: Submit collateral items

**Implementation**:
```typescript
// File: src/pages/customer/Collateral.tsx

// Form:
- type: select (vehicle | property | jewelry | electronics | other)
- description: textarea
- estimatedValue: number (in dollars, convert to cents)

// Save to: collaterals/{auto-id}
// Fields: ownerUid, type, description, estimatedValue, status='pending', createdAt

// List existing collaterals
// Show status badge (pending | approved | rejected)
```

### 4. Contract & Signature (`/app/contract`)

**Purpose**: Capture signature for loan request

**Implementation**:
```typescript
// File: src/pages/customer/Contract.tsx

// Two signature modes:
1. Typed Signature:
   - Text input for full name
   - Convert to fancy font with CSS
   - Save as base64 image using canvas

2. Drawn Signature:
   - Use HTML5 Canvas or library like `react-signature-canvas`
   - Export as base64

// Update loanRequest with:
{
  signature: base64String,
  signatureType: 'typed' | 'drawn'
}
```

### 5. Submitted Page (`/app/submitted`)

**Purpose**: Confirmation after loan submission

**Implementation**:
```typescript
// File: src/pages/customer/Submitted.tsx

// Show:
- Success icon
- "Application Submitted" message
- Request ID (from URL param or state)
- Timeline of next steps
- CTA button to dashboard
```

### 6. Loans List (`/app/loans`)

**Purpose**: View all loans (active and past)

**Implementation**:
```typescript
// File: src/pages/customer/Loans.tsx

// Query: loans collection where customerUid == currentUser.uid
// Display cards with:
- Amount
- Status badge
- Monthly payment
- Remaining balance
- Next due date
- Link to details
```

### 7. Loan Details (`/app/loans/:id`)

**Purpose**: View loan details and payment history

**Implementation**:
```typescript
// File: src/pages/customer/LoanDetail.tsx
import { useParams } from 'react-router-dom';

const { id } = useParams();

// Fetch loan data
// Fetch payments for this loan
// Show:
- Loan summary
- Payment schedule
- Payment history
- Make payment button → redirects to /app/payments with loanId
```

### 8. Payments (`/app/payments`)

**Purpose**: Submit payment proof

**Implementation**:
```typescript
// File: src/pages/customer/Payments.tsx

// Form:
- loanId: select (from active loans)
- amount: number (suggest monthly payment amount)
- paymentMethod: select (bank_transfer | cash | card | mobile_money)
- proofReferenceText: text (since uploads disabled)

// Save to: payments/{auto-id}
// Fields: customerUid, loanId, amount, status='submitted', paymentMethod, proofReferenceText, createdAt

// Later when uploads enabled:
- Add file upload for receipt/proof
- Save proofUrl from Storage
```

### 9. Loyalty (`/app/loyalty`)

**Purpose**: Show loyalty tier and benefits

**Implementation**:
```typescript
// File: src/pages/customer/Loyalty.tsx

// Fetch: users/{uid}/loyalty/status
// Display:
- Current tier badge
- Points balance
- Progress to next tier
- List of benefits
- Tier comparison table
```

### 10. Help (`/app/help`)

**Purpose**: FAQ and support

**Implementation**:
```typescript
// File: src/pages/customer/Help.tsx

// Static content:
- FAQ accordion
- Contact information
- Tutorial videos (embedded or links)
- Support ticket form (optional)
```

## 👨‍💼 Admin Pages

### 1. Loan Requests List (`/admin/requests`)

**Purpose**: View all pending requests

**Implementation**:
```typescript
// File: src/pages/admin/LoanRequests.tsx

// Query: loanRequests where status == 'submitted' OR 'under_review'
// Table with:
- Customer name (join from users collection)
- Amount
- Term
- Purpose
- Submission date
- Status
- Actions: View/Review button
```

### 2. Request Details & Approval (`/admin/requests/:id`)

**Purpose**: Review and approve/reject loan

**Implementation**:
```typescript
// File: src/pages/admin/RequestDetail.tsx

// Fetch request + customer data + KYC + collateral
// Show all info

// Approval form:
- Interest rate input (pre-fill from settings)
- Approve button:
  1. Create loan document
  2. Calculate totalAmount and monthlyPayment
  3. Update request status to 'approved'
  4. Create audit log

// Rejection form:
- Reason textarea
- Reject button:
  1. Update request status to 'rejected'
  2. Set rejectionReason
  3. Create audit log
```

### 3. All Loans (`/admin/loans`)

**Purpose**: Manage all loans

**Implementation**:
```typescript
// File: src/pages/admin/Loans.tsx

// Query: all loans
// Table with:
- Customer name
- Amount
- Status
- Remaining balance
- Due date
- Actions:Manage button
```

### 4. Loan Management (`/admin/loans/:id`)

**Purpose**: Confirm payments and manage loan

**Implementation**:
```typescript
// File: src/pages/admin/LoanManagement.tsx

// Fetch loan + payments for this loan
// Show loan details

// Pending payments section:
// For each payment with status='submitted':
- Show payment info
- Confirm button:
  1. Update payment status='confirmed'
  2. Set confirmedBy=adminUid, confirmedAt=now
  3. Deduct amount from loan.remainingBalance
  4. If remainingBalance <= 0, set loan.status='paid'
  5. Create audit log

- Reject button:
  1. Update payment status='rejected'
  2. Set rejectionReason
  3. Create audit log
```

### 5. Settings (`/admin/settings`)

**Purpose**: Edit global settings

**Implementation**:
```typescript
// File: src/pages/admin/Settings.tsx

// Fetch: settings/global
// Form:
- maxLoanAmount ($)
- minLoanAmount ($)
- defaultInterestRate (%)
- maxLoanTerm (months)
- minLoanTerm (months)
- maintenanceMode (toggle)

// Save:
- Update settings/global
- Set updatedBy=adminUid, updatedAt=now
- Create audit log
```

### 6. Audit Log (`/admin/audit`)

**Purpose**: View all admin actions

**Implementation**:
```typescript
// File: src/pages/admin/Audit.tsx

// Query: auditLogs ordered by timestamp desc
// Table with:
- Timestamp
- Admin name (lookup from users)
- Action type
- Target (user/loan/payment ID)
- Details (formatted JSON or summary)
```

## 🔥 Firestore Query Patterns

### Basic Read
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userConverter } from '@/lib/converters';

const docRef = doc(db, 'users', uid).withConverter(userConverter);
const docSnap = await getDoc(docRef);
const userData = docSnap.data();
```

### List Query
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'loans'),
  where('customerUid', '==', uid),
  where('status', '==', 'active')
);
const snapshot = await getDocs(q);
const loans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Create Document
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const ref = await addDoc(collection(db, 'payments'), {
  customerUid: uid,
  loanId: loanId,
  amount: 5000,
  status: 'submitted',
  createdAt: Timestamp.now(),
});
const newId = ref.id;
```

### Update Document
```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'loanRequests', requestId), {
  status: 'approved',
  reviewedBy: adminUid,
  reviewedAt: Timestamp.now(),
});
```

## 🎨 UI Component Patterns

### Loading State
```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

### Error State
```tsx
if (error) {
  return (
    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
      Failed to load data. Please try again.
    </div>
  );
}
```

### Empty State
```tsx
if (!data || data.length === 0) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>No items found</p>
      <Button className="mt-4" onClick={...}>Add New</Button>
    </div>
  );
}
```

### Form with Validation
```tsx
import { z } from 'zod';

const schema = z.object({
  amount: z.number().min(100).max(1000000),
  term: z.number().min(6).max(60),
});

// In component:
const [errors, setErrors] = useState({});

function handleSubmit(data) {
  try {
    schema.parse(data);
    setErrors({});
    // Proceed with mutation
  } catch (err) {
    if (err instanceof z.ZodError) {
      setErrors(err.flatten().fieldErrors);
    }
  }
}
```

## 📊 TanStack Query Patterns

### Query
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['loans', customerId],
  queryFn: async () => {
    const q = query(collection(db, 'loans'), where('customerUid', '==', customerId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  enabled: !!customerId, // Only run if customerId exists
});
```

### Mutation with Optimistic Update
```typescript
const mutation = useMutation({
  mutationFn: async (newPayment) => {
    const ref = await addDoc(collection(db, 'payments'), newPayment);
    return { id: ref.id, ...newPayment };
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Payment submitted!');
  },
  onError: (error) => {
    toast.error('Failed to submit payment');
  },
});
```

## 🧪 Testing New Features

### Unit Test Example
```typescript
// tests/components/YourComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '@/pages/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Security Rules Test Example
```typescript
// tests/rules/yourFeature.test.ts
it('should allow customer to create payment', async () => {
  const userId = 'user123';
  const db = testEnv.authenticatedContext(userId).firestore();
  
  await testEnv.withSecurityRulesDisabled(async (context) => {
    // Setup user
  });

  await assertSucceeds(
    setDoc(doc(db, 'payments', 'payment123'), {
      customerUid: userId,
      //... other fields
    })
  );
});
```

## 🚀 Deployment Checklist

Before deploying new features:
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tests pass: `npm run test`
- [ ] Rules tests pass: `npm run test:rules`
- [ ] Dev server works: `npm run dev`
- [ ] Security rules updated if needed
- [ ] New fields added to Firestore types
- [ ] Loading/error states handled
- [ ] Mobile responsive
- [ ] Accessibility checked (keyboard nav, screen readers)

## 📚 Additional Resources

- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Remember**: Start with one feature, test thoroughly, then move to the next! 🎯
