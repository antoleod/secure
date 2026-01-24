import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageSkeleton } from './components/PageSkeleton';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const DashboardRedirect = lazy(() => import('./pages/Dashboard'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const CustomerLayout = lazy(() => import('./layouts/CustomerLayout'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminRequests = lazy(() => import('./pages/admin/Requests'));
const AdminLoans = lazy(() => import('./pages/admin/Loans'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminAudit = lazy(() => import('./pages/admin/Audit'));

const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const CustomerIdentity = lazy(() => import('./pages/customer/Identity'));
const CustomerCollateral = lazy(() => import('./pages/customer/Collateral'));
const CustomerLoans = lazy(() => import('./pages/customer/Loans'));
const CustomerPayments = lazy(() => import('./pages/customer/Payments'));
const CustomerStore = lazy(() => import('./pages/customer/Store'));
const CustomerLoyalty = lazy(() => import('./pages/customer/Loyalty'));
const CustomerHelp = lazy(() => import('./pages/customer/Help'));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="loans" element={<AdminLoans />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="verify-identity" element={<CustomerIdentity />} />
            <Route path="collateral" element={<CustomerCollateral />} />
            <Route path="loans" element={<CustomerLoans />} />
            <Route path="payments" element={<CustomerPayments />} />
            <Route path="store" element={<CustomerStore />} />
            <Route path="loyalty" element={<CustomerLoyalty />} />
            <Route path="help" element={<CustomerHelp />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
