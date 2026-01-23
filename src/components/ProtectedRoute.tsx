import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'customer')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for userData to load if user exists
  if (user && !userData) {
    // It might be loading profile, or profile doesn't exist
    // We can show loader here too
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect based on role to avoid getting stuck
    if (userData.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}