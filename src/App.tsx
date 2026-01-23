import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import DashboardRedirect from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminClients from './pages/admin/Clients';
import AdminRequests from './pages/admin/Requests';
import AdminLoans from './pages/admin/Loans';
import AdminPayments from './pages/admin/Payments';
import AdminSettings from './pages/admin/Settings';
import AdminAudit from './pages/admin/Audit';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerIdentity from './pages/customer/Identity';
import CustomerCollateral from './pages/customer/Collateral';
import CustomerLoans from './pages/customer/Loans';
import CustomerPayments from './pages/customer/Payments';
import CustomerStore from './pages/customer/Store';
import CustomerLoyalty from './pages/customer/Loyalty';
import CustomerHelp from './pages/customer/Help';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Root Redirector */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="loans" element={<AdminLoans />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/app" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="verify-identity" element={<CustomerIdentity />} />
          <Route path="collateral" element={<CustomerCollateral />} />
          <Route path="loans" element={<CustomerLoans />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="store" element={<CustomerStore />} />
          <Route path="loyalty" element={<CustomerLoyalty />} />
          <Route path="help" element={<CustomerHelp />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;