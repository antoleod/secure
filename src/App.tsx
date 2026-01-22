import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';

// Layouts
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public Pages
import { LandingPage } from '@/pages/Landing';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { ForgotPasswordPage } from '@/pages/ForgotPassword';

// Customer Pages
import { CustomerDashboard } from '@/pages/customer/Dashboard';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/Dashboard';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="verify-identity" element={<div>Verify Identity (Coming Soon)</div>} />
              <Route path="new-loan" element={<div>New Loan (Coming Soon)</div>} />
              <Route path="collateral" element={<div>Collateral (Coming Soon)</div>} />
              <Route path="contract" element={<div>Contract (Coming Soon)</div>} />
              <Route path="submitted" element={<div>Submitted (Coming Soon)</div>} />
              <Route path="loans" element={<div>My Loans (Coming Soon)</div>} />
              <Route path="loans/:id" element={<div>Loan Details (Coming Soon)</div>} />
              <Route path="payments" element={<div>Payments (Coming Soon)</div>} />
              <Route path="loyalty" element={<div>Loyalty (Coming Soon)</div>} />
              <Route path="help" element={<div>Help (Coming Soon)</div>} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<div>Loan Requests (Coming Soon)</div>} />
              <Route path="requests/:id" element={<div>Request Details (Coming Soon)</div>} />
              <Route path="loans" element={<div>All Loans (Coming Soon)</div>} />
              <Route path="loans/:id" element={<div>Loan Management (Coming Soon)</div>} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
              <Route path="audit" element={<div>Audit Log (Coming Soon)</div>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
