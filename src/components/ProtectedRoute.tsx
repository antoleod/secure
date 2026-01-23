import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useI18n } from '@/contexts/I18nContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { currentUser, userRole, userStatus, loading } = useAuth();
    const { t } = useI18n();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userStatus && userStatus !== 'active') {
        return (
            <div className="flex items-center justify-center min-h-screen px-6 text-center">
                <div className="space-y-4 max-w-md">
                    <h1 className="text-2xl font-semibold">{t('common.error.generic')}</h1>
                    <p className="text-muted-foreground">
                        {t('auth.error.inactive', { status: userStatus })}
                    </p>
                </div>
            </div>
        );
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/app" replace />;
    }

    if (allowedRoles && !userRole) {
        return (
            <div className="flex items-center justify-center min-h-screen px-6 text-center">
                <div className="space-y-4 max-w-md">
                    <h1 className="text-2xl font-semibold">{t('common.error.generic')}</h1>
                    <p className="text-muted-foreground">
                        {t('auth.error.roleMissing')}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

interface PublicOnlyRouteProps {
    children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (currentUser && userRole) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/app" replace />;
    }

    return <>{children}</>;
}
