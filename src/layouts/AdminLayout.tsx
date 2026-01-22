import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
    const { logout, userData } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/admin" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">A</span>
                                </div>
                                <span className="text-xl font-bold hidden sm:inline">Admin Panel</span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-4">
                                <Link to="/admin" className="text-sm hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/admin/requests" className="text-sm hover:text-primary transition-colors">
                                    Loan Requests
                                </Link>
                                <Link to="/admin/loans" className="text-sm hover:text-primary transition-colors">
                                    All Loans
                                </Link>
                                <Link to="/admin/settings" className="text-sm hover:text-primary transition-colors">
                                    Settings
                                </Link>
                                <Link to="/admin/audit" className="text-sm hover:text-primary transition-colors">
                                    Audit Log
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {userData?.fullName} (Admin)
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
