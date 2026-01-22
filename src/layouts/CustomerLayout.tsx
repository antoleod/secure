import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function CustomerLayout() {
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/app" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">O</span>
                                </div>
                                <span className="text-xl font-bold hidden sm:inline">OryxenTech</span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-4">
                                <Link to="/app" className="text-sm hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/app/loans" className="text-sm hover:text-primary transition-colors">
                                    My Loans
                                </Link>
                                <Link to="/app/payments" className="text-sm hover:text-primary transition-colors">
                                    Payments
                                </Link>
                                <Link to="/app/help" className="text-sm hover:text-primary transition-colors">
                                    Help
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {userData?.fullName}
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
