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
import { VerifyIdentityPage } from '@/pages/customer/VerifyIdentity';
import { NewLoanPage } from '@/pages/customer/NewLoan';
import { CollateralPage } from '@/pages/customer/Collateral';
import { ContractPage } from '@/pages/customer/Contract';
import { SubmittedPage } from '@/pages/customer/Submitted';
import { LoansPage } from '@/pages/customer/Loans';
import { LoanDetailsPage } from '@/pages/customer/LoanDetails';
import { PaymentsPage } from '@/pages/customer/Payments';
import { LoyaltyPage } from '@/pages/customer/Loyalty';
import { HelpPage } from '@/pages/customer/Help';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { RequestsPage } from '@/pages/admin/Requests';
import { RequestDetailsPage } from '@/pages/admin/RequestDetails';
import { AdminLoansPage } from '@/pages/admin/Loans';
import { AdminLoanDetailsPage } from '@/pages/admin/LoanDetails';
import { SettingsPage } from '@/pages/admin/Settings';
import { AuditLogPage } from '@/pages/admin/AuditLog';

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
                            <Route path="verify-identity" element={<VerifyIdentityPage />} />
                            <Route path="new-loan" element={<NewLoanPage />} />
                            <Route path="collateral" element={<CollateralPage />} />
                            <Route path="contract" element={<ContractPage />} />
                            <Route path="submitted" element={<SubmittedPage />} />
                            <Route path="loans" element={<LoansPage />} />
                            <Route path="loans/:id" element={<LoanDetailsPage />} />
                            <Route path="payments" element={<PaymentsPage />} />
                            <Route path="loyalty" element={<LoyaltyPage />} />
                            <Route path="help" element={<HelpPage />} />
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
                            <Route path="requests" element={<RequestsPage />} />
                            <Route path="requests/:id" element={<RequestDetailsPage />} />
                            <Route path="loans" element={<AdminLoansPage />} />
                            <Route path="loans/:id" element={<AdminLoanDetailsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="audit" element={<AuditLogPage />} />
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
