import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listAllLoans } from '@/lib/firestoreClient';
import { formatMoney, formatDate } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function AdminLoansPage() {
    const { t } = useI18n();
    const { data: loans, isLoading } = useQuery({
        queryKey: ['admin-loans'],
        queryFn: listAllLoans,
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.loans.title')}</CardTitle>
                    <CardDescription>{t('admin.loans.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!loans || loans.length === 0) && (
                        <p className="text-muted-foreground">{t('admin.loans.empty')}</p>
                    )}
                    {!isLoading && loans && loans.length > 0 && (
                        <div className="space-y-3">
                            {loans.map((loan) => (
                                <div key={loan.id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {formatMoney(loan.amount)} • {loan.status}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {loan.customerUid} • {formatDate(loan.createdAt)}
                                        </p>
                                    </div>
                                    <Link to={`/admin/loans/${loan.id}`}>
                                        <Button size="sm" variant="outline">
                                            {t('common.view')}
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
