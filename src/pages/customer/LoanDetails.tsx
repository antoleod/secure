import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLoan, listPaymentsForLoan } from '@/lib/firestoreClient';
import { formatDate, formatDateTime, formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function LoanDetailsPage() {
    const { id } = useParams();
    const { t } = useI18n();

    const { data: loan, isLoading } = useQuery({
        queryKey: ['loan', id],
        queryFn: () => getLoan(id!),
        enabled: Boolean(id),
    });

    const { data: payments } = useQuery({
        queryKey: ['payments', id],
        queryFn: () => listPaymentsForLoan(id!),
        enabled: Boolean(id),
    });

    if (isLoading) {
        return <p className="text-muted-foreground">{t('common.loading')}</p>;
    }

    if (!loan) {
        return <p className="text-muted-foreground">{t('loans.list.empty')}</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('loans.details.title')}</CardTitle>
                    <CardDescription>
                        {formatMoney(loan.amount)} • {loan.status}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <Info label={t('field.term')} value={`${loan.term} months`} />
                    <Info label={t('field.interestRate')} value={`${loan.interestRate}%`} />
                    <Info label={t('loans.details.balance')} value={formatMoney(loan.remainingBalance)} />
                    <Info label={t('field.amount')} value={formatMoney(loan.amount)} />
                    <Info label={t('loan.new.monthlyPayment')} value={formatMoney(loan.monthlyPayment)} />
                    <Info label={t('loan.new.totalCost')} value={formatMoney(loan.totalAmount)} />
                    <Info label={t('common.status.approved')} value={formatDate(loan.disbursedAt)} />
                    <Info label={t('loans.details.status')} value={loan.status} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('loans.details.payments')}</CardTitle>
                    <CardDescription>{t('payments.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!payments || payments.length === 0 ? (
                        <p className="text-muted-foreground">{t('customer.noActivity')}</p>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment.id} className="border rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{formatMoney(payment.amount)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(payment.createdAt)} • {payment.status}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground text-right">
                                        {payment.confirmedBy && (
                                            <p>
                                                {t('payments.confirmedBy')}: {payment.confirmedBy}
                                            </p>
                                        )}
                                        {payment.proofReferenceText && (
                                            <p>
                                                {t('payments.referenceLabel')}: {payment.proofReferenceText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4">
                        <Link to="/app/payments">
                            <Button variant="outline" size="sm">
                                {t('payments.title')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}
