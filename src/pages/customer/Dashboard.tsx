import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listLoansForUser } from '@/lib/firestoreClient';
import { formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function CustomerDashboard() {
    const { userData, currentUser } = useAuth();
    const { t } = useI18n();
    const { data: loans, isLoading } = useQuery({
        queryKey: ['loans', currentUser?.uid],
        queryFn: () => listLoansForUser(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const firstName = userData?.fullName?.split(' ')[0] ?? '';

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow">
                <h1 className="text-3xl font-bold mb-2">{t('customer.welcome', { name: firstName })}</h1>
                <p className="text-blue-100">{t('customer.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink to="/app/verify-identity" label={t('customer.quick.identity')} helper={t('kyc.subtitle')} />
                <QuickLink to="/app/new-loan" label={t('customer.quick.loan')} helper={t('loan.new.subtitle')} />
                <QuickLink to="/app/payments" label={t('customer.quick.payment')} helper={t('payments.subtitle')} />
                <QuickLink to="/app/loyalty" label={t('customer.quick.loyalty')} helper={t('loyalty.subtitle')} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('customer.activeLoans')}</CardTitle>
                    <CardDescription>{t('loan.new.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!loans || loans.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>{t('customer.noActiveLoans')}</p>
                            <Link to="/app/new-loan">
                                <Button className="mt-4">{t('loan.new.submit')}</Button>
                            </Link>
                        </div>
                    )}
                    {!isLoading && loans && loans.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {loans.slice(0, 4).map((loan) => (
                                <Card key={loan.id} className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">
                                            {t('loans.details.status')}: {loan.status}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('loans.details.balance')}: {formatMoney(loan.remainingBalance)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {t('field.term')}: {loan.term}m
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('field.amount')}: {formatMoney(loan.amount)}
                                            </p>
                                        </div>
                                        <Link to={`/app/loans/${loan.id}`}>
                                            <Button variant="outline" size="sm">
                                                {t('common.view')}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('customer.recentActivity')}</CardTitle>
                    <CardDescription>{t('payments.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>{t('customer.noActivity')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function QuickLink({ to, label, helper }: { to: string; label: string; helper: string }) {
    return (
        <Link to={to}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>{helper}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
