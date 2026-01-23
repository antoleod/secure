import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLoanRequest, decideLoanRequest } from '@/lib/firestoreClient';
import { formatMoney, formatDate } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export function RequestDetailsPage() {
    const { id } = useParams();
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [interestRate, setInterestRate] = useState(15);
    const [term, setTerm] = useState(12);
    const [rejectionReason, setRejectionReason] = useState('');
    const [feedback, setFeedback] = useState('');

    const { data: request, isLoading } = useQuery({
        queryKey: ['request', id],
        queryFn: () => getLoanRequest(id!),
        enabled: Boolean(id),
    });

    const decisionMutation = useMutation({
        mutationFn: (decision: 'approve' | 'reject') =>
            decideLoanRequest({
                requestId: id!,
                adminUid: currentUser!.uid,
                decision,
                interestRate,
                term,
                rejectionReason,
            }),
        onSuccess: () => {
            setFeedback(t('admin.requestDetails.success'));
            queryClient.invalidateQueries({ queryKey: ['request', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
        },
        onError: (err) => {
            console.error(err);
            setFeedback(t('common.error.generic'));
        },
    });

    if (isLoading) {
        return <p className="text-muted-foreground">{t('common.loading')}</p>;
    }

    if (!request) {
        return <p className="text-muted-foreground">{t('admin.requests.empty')}</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.requestDetails.title')}</CardTitle>
                    <CardDescription>{request.customerUid}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Info label={t('field.amount')} value={formatMoney(request.amount)} />
                        <Info label={t('field.term')} value={`${request.term} months`} />
                        <Info label={t('field.purpose')} value={request.purpose} />
                        <Info label={t('loans.details.status')} value={request.status} />
                        <Info label={t('common.status.submitted')} value={formatDate(request.createdAt)} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="interestRate">{t('field.interestRate')}</Label>
                            <Input
                                id="interestRate"
                                type="number"
                                min={0}
                                step={0.1}
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="term">{t('field.term')}</Label>
                            <Input id="term" type="number" min={1} value={term} onChange={(e) => setTerm(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rejectionReason">{t('admin.requestDetails.rejectionReason')}</Label>
                        <Input
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder={t('admin.requestDetails.rejectionReason')}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={() => decisionMutation.mutate('approve')}
                            disabled={decisionMutation.isPending}
                        >
                            {t('admin.requestDetails.approve')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => decisionMutation.mutate('reject')}
                            disabled={decisionMutation.isPending}
                        >
                            {t('admin.requestDetails.reject')}
                        </Button>
                    </div>

                    {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
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
