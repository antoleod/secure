import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listAdminRequests } from '@/lib/firestoreClient';
import { formatDate, formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function RequestsPage() {
    const { t } = useI18n();
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-requests'],
        queryFn: () => listAdminRequests(),
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.requests.title')}</CardTitle>
                    <CardDescription>{t('admin.requests.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!requests || requests.length === 0) && (
                        <p className="text-muted-foreground">{t('admin.requests.empty')}</p>
                    )}
                    {!isLoading && requests && requests.length > 0 && (
                        <div className="space-y-3">
                            {requests.map((req) => (
                                <div key={req.id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {formatMoney(req.amount)} • {req.status}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {req.customerUid} • {formatDate(req.createdAt)}
                                        </p>
                                    </div>
                                    <Link to={`/admin/requests/${req.id}`}>
                                        <Button size="sm" variant="outline">
                                            {t('admin.requests.review')}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
