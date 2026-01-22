import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDashboard() {
    const { userData } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded- p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-purple-100">
                    Manage loan requests, approvals, and system settings
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pending Requests</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Loans</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Disbursed</CardDescription>
                        <CardTitle className="text-3xl">$0</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Users</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Recent Requests */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Loan Requests</CardTitle>
                    <CardDescription>Latest loan applications</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No recent requests</p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>Latest admin actions</CardDescription>
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
