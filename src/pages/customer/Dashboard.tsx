import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CustomerDashboard() {
    const { userData } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {userData?.fullName?.split(' ')[0]}!
                </h1>
                <p className="text-blue-100">
                    Manage your loans and track your financial journey
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/app/verify-identity">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span>✓</span>
                                Verify Identity
                            </CardTitle>
                            <CardDescription>Complete your KYC</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/app/new-loan">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span>💰</span>
                                New Loan
                            </CardTitle>
                            <CardDescription>Apply for a loan</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/app/payments">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span>💳</span>
                                Make Payment
                            </CardTitle>
                            <CardDescription>Pay your loan</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/app/loyalty">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span>⭐</span>
                                Loyalty
                            </CardTitle>
                            <CardDescription>View your rewards</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            {/* Active Loan Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Loans</CardTitle>
                    <CardDescription>Your current loan status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No active loans</p>
                        <Link to="/app/new-loan">
                            <Button className="mt-4">Apply for a Loan</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No recent activity</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
