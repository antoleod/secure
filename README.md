# OryxenTech Secure Loan Platform

A production-ready React web application for loan management with Firebase backend, deployed on GitHub Pages.

## 🚀 Features

- **Authentication**: Firebase Auth with email/password
- **Role-Based Access**: Customer and Admin portals
- **Loan Management**: Complete loan lifecycle from application to repayment
- **KYC Verification**: Identity verification system
- **Payment Tracking**: Payment submission and confirmation
- **Audit Logging**: Complete admin action tracking
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router (HashRouter for GitHub Pages)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Testing**: Vitest + React Testing Library + Firebase Rules Testing
- **Deployment**: GitHub Pages (automatic via GitHub Actions)

## 📋 Prerequisites

- Node.js 20+ and npm
- Git
- Firebase CLI: `npm install -g firebase-tools`
- A GitHub account
- A Firebase project (already configured: oryxentech)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/secure.oryxen.tech.git
cd secure.oryxen.tech
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The `.env` file is already configured with the Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyBoO44nRpduKOg8H5x6fRDpRhca9TqYb_Q
VITE_FIREBASE_AUTH_DOMAIN=oryxentech.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oryxentech
VITE_FIREBASE_STORAGE_BUCKET=oryxentech.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=310234207062
VITE_FIREBASE_APP_ID=1:310234207062:web:730974898bd3b1acb33cf7
VITE_FIREBASE_MEASUREMENT_ID=G-1QHCB69QT4
VITE_ENABLE_UPLOADS=false
```

**Note**: To use emulators, create a `.env.local` file:

```env
VITE_USE_EMULATORS=true
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🧪 Testing

### Run Component Tests

```bash
npm run test
```

### Run Firebase Rules Tests

First, start the Firebase emulators:

```bash
npm run emulators
```

In another terminal, run the rules tests:

```bash
npm run test:rules
```

### Test Coverage

The rules tests verify:
- ✅ Users can only read/write their own data
- ✅ Customers can create loan requests
- ✅ Customers cannot access admin functions
- ✅ Admins can manage loans and settings
- ✅ Payment status transitions are protected
- ✅ Storage uploads respect current deny-all rules

## 🔐 Firebase Setup & Security

### Current Security Rules

#### Firestore
- **Production rules** are deployed at `firebase/firestore.rules`
- Role-based access control (customer vs admin)
- See rules tests for full coverage

#### Storage
- **Current production rules**: DENY ALL (`firebase/storage.rules`)
- **Recommended rules**: Available in `firebase/storage.rules.recommended`
- Uploads are **DISABLED** by default (feature flag: `VITE_ENABLE_UPLOADS=false`)

### Enabling Storage Uploads

When you're ready to enable file uploads:

1. Deploy the recommended storage rules:
   ```bash
   firebase deploy --only storage
   ```
   (Copy content from `storage.rules.recommended` to `storage.rules` first)

2. Update the feature flag:
   ```env
   VITE_ENABLE_UPLOADS=true
   ```

3. Rebuild and redeploy the application

### Firebase Auth Setup

#### Add GitHub Pages to Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **oryxentech**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `YOUR_USERNAME.github.io`
6. Save

## 👨‍💼 Admin Access Setup

By default, all new registrations create **customer** accounts. To create an admin:

### Option 1: Firebase Console (Recommended)

1. Register a new account normally through the app
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Locate your user document (by email)
6. Edit the document and change:
   ```
   role: "admin"
   ```
7. Save changes
8. Log out and log back in

### Option 2: Firebase CLI (Advanced)

```javascript
// Run in Firebase console or Cloud Functions
const admin = require('firebase-admin');
const db = admin.firestore();

await db.collection('users').doc('USER_UID').update({
  role: 'admin'
});
```

## 🌐 Deploying to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **New Repository**
3. Name: `secure.oryxen.tech` (or your preferred name)
4. Set to **Public** (required for GitHub Pages on free tier)
5. Do NOT initialize with README (we already have files)
6. Click **Create Repository**

### Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Production-ready loan platform"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/secure.oryxen.tech.git

# Push to main
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. In the left sidebar, click **Pages**
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### Step 4: Configure GitHub Actions Permissions

1. In your repository, go to **Settings**
2. Click **Actions** → **General**
3. Scroll to **Workflow permissions**
4. Select **Read and write permissions**
5. Check **Allow GitHub Actions to create and approve pull requests**
6. Click **Save**

### Step 5: Update GitHub Actions Workflow (if needed)

If your repository name is different from `secure.oryxen.tech`, update `.github/workflows/deploy.yml`:

```yaml
- name: Build
  env:
    VITE_BASE_PATH: /YOUR_REPO_NAME  # Change this line
  run: npm run build
```

### Step 6: Deploy

The deployment happens automatically on every push to `main`:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push
```

### Step 7: Verify Deployment

1. Go to **Actions** tab in your GitHub repository
2. Wait for the workflow to complete (usually 2-5 minutes)
3. Check the **Deployments** section in your repository
4. Your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/secure.oryxen.tech/
   ```

## 📱 Access the Application

### Production URL
```
https://YOUR_USERNAME.github.io/secure.oryxen.tech/
```

### Default Routes

- **Landing**: `/#/`
- **Login**: `/#/login`
- **Register**: `/#/register`
- **Customer Dashboard**: `/#/app` (requires login)
- **Admin Dashboard**: `/#/admin` (requires admin role)

**Note**: We use HashRouter (`#`) for GitHub Pages compatibility.

## 🗂️ Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deployment workflow
├── firebase/
│   ├── firestore.rules         # Production Firestore rules
│   ├── firestore.indexes.json  # Firestore indexes
│   ├── storage.rules           # Current storage rules (deny all)
│   └── storage.rules.recommended  # Ready-to-enable storage rules
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ProtectedRoute.tsx  # Route guards
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state
│   ├── layouts/
│   │   ├── CustomerLayout.tsx  # Customer portal layout
│   │   └── AdminLayout.tsx     # Admin portal layout
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── converters.ts       # Firestore data converters
│   │   └── utils.ts            # Utility functions
│   ├── pages/
│   │   ├── customer/           # Customer pages
│   │   ├── admin/              # Admin pages
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── tests/
│   ├── rules/
│   │   └── firestore.test.ts   # Security rules tests
│   └── setup.ts                # Test configuration
├── .env                        # Environment variables
├── firebase.json               # Firebase configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies and scripts
```

## 🎨 Customization

### Changing Colors

Edit `src/index.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue */
  --secondary: 210 40% 96.1%;     /* Light gray */
  /* ... more colors */
}
```

### Adding New Pages

1. Create component in `src/pages/customer/` or `src/pages/admin/`
2. Add route in `src/App.tsx`
3. Update navigation in layout files

## 🔄 Continuous Deployment

Every push to `main` branch automatically:
1. Runs TypeScript compilation
2. Builds optimized production bundle
3. Deploys to GitHub Pages

View deployment status in the **Actions** tab.

## 🗃️ Data Model

### Firestore Collections

- `users` - User profiles with role and status
- `kyc` - KYC verification data
- `collaterals` - Collateral items
- `loanRequests` - Loan applications
- `loans` - Active/completed loans
- `payments` - Payment records
- `settings/global` - Global settings (admin-only)
- `auditLogs` - Admin action logs

### Money Format

**All monetary values are stored in cents (integers)**

Example:
- $100.00 = 10000 cents
- $5,000.50 = 500050 cents

Use helper functions:
- `formatMoney(cents)` - Display money
- `parseMoney(display)` - Convert to cents

## 🐛 Troubleshooting

### Build Fails on GitHub Actions

- Check that `VITE_BASE_PATH` matches your repo name
- Verify GitHub Actions has write permissions

### Auth Doesn't Work on GitHub Pages

- Ensure `YOUR_USERNAME.github.io` is added to Firebase Authorized Domains
- Check browser console for CORS errors

### Storage Uploads Fail

- This is expected! Storage rules deny all by default
- See "Enabling Storage Uploads" section above

### Emulator Connection Refused

- Make sure emulators are running: `npm run emulators`
- Check that `.env.local` has `VITE_USE_EMULATORS=true`

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React, Firebase, and GitHub Pages**
