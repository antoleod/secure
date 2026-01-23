import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLoan, listPaymentsForLoan, confirmPayment } from '@/lib/firestoreClient';
import { formatDateTime, formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLoanDetailsPage() {
    const { id } = useParams();
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

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

    const paymentMutation = useMutation({
        mutationFn: (payload: { paymentId: string; status: 'confirmed' | 'rejected' }) =>
            confirmPayment({
                paymentId: payload.paymentId,
                adminUid: currentUser!.uid,
                status: payload.status,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', id] });
        },
        onError: (err) => {
            console.error(err);
        },
    });

    if (isLoading) {
        return <p className="text-muted-foreground">{t('common.loading')}</p>;
    }

    if (!loan) {
        return <p className="text-muted-foreground">{t('admin.loans.empty')}</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.loanDetails.title')}</CardTitle>
                    <CardDescription>{loan.customerUid}</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-3">
                    <Info label={t('field.amount')} value={formatMoney(loan.amount)} />
                    <Info label={t('field.term')} value={`${loan.term} months`} />
                    <Info label={t('field.interestRate')} value={`${loan.interestRate}%`} />
                    <Info label={t('loan.new.monthlyPayment')} value={formatMoney(loan.monthlyPayment)} />
                    <Info label={t('loans.details.balance')} value={formatMoney(loan.remainingBalance)} />
                    <Info label={t('loans.details.status')} value={loan.status} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('payments.title')}</CardTitle>
                    <CardDescription>{t('loans.details.payments')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!payments || payments.length === 0 ? (
                        <p className="text-muted-foreground">{t('customer.noActivity')}</p>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment.id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{formatMoney(payment.amount)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(payment.createdAt)} • {payment.status}
                                        </p>
                                        {payment.proofReferenceText && (
                                            <p className="text-sm text-muted-foreground">
                                                {t('payments.referenceLabel')}: {payment.proofReferenceText}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => paymentMutation.mutate({ paymentId: payment.id, status: 'confirmed' })}
                                            disabled={paymentMutation.isPending}
                                        >
                                            {t('admin.loanDetails.confirmPayment')}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => paymentMutation.mutate({ paymentId: payment.id, status: 'rejected' })}
                                            disabled={paymentMutation.isPending}
                                        >
                                            {t('admin.loanDetails.rejectPayment')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}
