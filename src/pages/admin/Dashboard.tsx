import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { listAdminRequests, listAllLoans, listAuditLogs } from '@/lib/firestoreClient';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
    const { t } = useI18n();

    const { data: requests } = useQuery({
        queryKey: ['admin-requests'],
        queryFn: () => listAdminRequests(),
    });

    const { data: loans } = useQuery({
        queryKey: ['admin-loans'],
        queryFn: listAllLoans,
    });

    const { data: audits } = useQuery({
        queryKey: ['audit'],
        queryFn: listAuditLogs,
    });

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow">
                <h1 className="text-3xl font-bold mb-2">{t('admin.dashboard.title')}</h1>
                <p className="text-purple-100">{t('admin.dashboard.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                <StatCard label={t('admin.requests.title')} value={requests?.length ?? 0} />
                <StatCard label={t('admin.loans.title')} value={loans?.length ?? 0} />
                <StatCard label={t('admin.audit.title')} value={audits?.length ?? 0} />
                <StatCard label={t('common.status.pending')} value={(requests ?? []).filter((r) => r.status === 'submitted').length} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.requests.title')}</CardTitle>
                    <CardDescription>{t('admin.requests.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link to="/admin/requests">
                        <Button variant="outline" size="sm">
                            {t('admin.requests.review')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
