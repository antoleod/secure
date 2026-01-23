import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { listLoansForUser } from '@/lib/firestoreClient';
import { formatDate, formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function LoansPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();
    const { data: loans, isLoading } = useQuery({
        queryKey: ['loans', currentUser?.uid],
        queryFn: () => listLoansForUser(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('loans.list.title')}</CardTitle>
                    <CardDescription>{t('loan.new.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!loans || loans.length === 0) && (
                        <p className="text-muted-foreground">{t('loans.list.empty')}</p>
                    )}
                    {!isLoading && loans && loans.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {loans.map((loan) => (
                                <Card key={loan.id} className="border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">
                                            {formatMoney(loan.amount)} • {loan.status}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('loans.details.balance')}: {formatMoney(loan.remainingBalance)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>{t('field.term')}: {loan.term}m</p>
                                            <p>{t('field.interestRate')}: {loan.interestRate}%</p>
                                            <p>{t('common.status.approved')}: {formatDate(loan.disbursedAt)}</p>
                                        </div>
                                        <Link to={`/app/loans/${loan.id}`}>
                                            <Button variant="outline" size="sm">{t('common.view')}</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
