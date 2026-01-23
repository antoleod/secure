import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { listLoansForUser, submitPayment } from '@/lib/firestoreClient';
import { formatMoney, parseMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';
import { ENABLE_UPLOADS } from '@/lib/firebase';

const paymentSchema = z.object({
    loanId: z.string().min(1),
    amountDisplay: z.string().min(1),
    paymentMethod: z.enum(['bank_transfer', 'cash', 'card', 'mobile_money']),
    proofReferenceText: z.string().min(3),
});

export function PaymentsPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');
    const [proofFile, setProofFile] = useState<File | undefined>(undefined);

    const { data: loans } = useQuery({
        queryKey: ['loans', currentUser?.uid],
        queryFn: () => listLoansForUser(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const mutation = useMutation({
        mutationFn: (values: z.infer<typeof paymentSchema>) =>
            submitPayment(currentUser!.uid, {
                loanId: values.loanId,
                amount: parseMoney(values.amountDisplay),
                paymentMethod: values.paymentMethod,
                proofReferenceText: values.proofReferenceText,
                proofFile: ENABLE_UPLOADS ? proofFile : undefined,
            }),
        onSuccess: () => {
            setSuccess(t('payments.success'));
            queryClient.invalidateQueries({ queryKey: ['payments', currentUser?.uid] });
        },
        onError: (err) => {
            console.error(err);
            setFormError(t('common.error.generic'));
        },
    });

    const [formValues, setFormValues] = useState({
        loanId: '',
        amountDisplay: '',
        paymentMethod: 'bank_transfer',
        proofReferenceText: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');
        setSuccess('');

        const parsed = paymentSchema.safeParse(formValues);
        if (!parsed.success) {
            setFormError(t('common.error.generic'));
            return;
        }

        mutation.mutate(parsed.data);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('payments.title')}</CardTitle>
                    <CardDescription>{t('payments.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                        {formError && (
                            <div className="md:col-span-2 bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {formError}
                            </div>
                        )}
                        {success && (
                            <div className="md:col-span-2 bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="loanId">{t('loans.details.title')}</Label>
                            <select
                                id="loanId"
                                name="loanId"
                                className="border rounded-md px-3 py-2 w-full"
                                value={formValues.loanId}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, loanId: e.target.value }))}
                                required
                            >
                                <option value="">{t('payments.selectLoan')}</option>
                                {(loans ?? []).map((loan) => (
                                    <option key={loan.id} value={loan.id}>
                                        {formatMoney(loan.amount)} • {loan.status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amountDisplay">{t('field.amount')}</Label>
                            <Input
                                id="amountDisplay"
                                name="amountDisplay"
                                type="number"
                                inputMode="decimal"
                                value={formValues.amountDisplay}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, amountDisplay: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">{t('field.paymentMethod')}</Label>
                            <select
                                id="paymentMethod"
                                name="paymentMethod"
                                className="border rounded-md px-3 py-2 w-full"
                                value={formValues.paymentMethod}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                            >
                                <option value="bank_transfer">{t('payments.method.bank_transfer')}</option>
                                <option value="cash">{t('payments.method.cash')}</option>
                                <option value="card">{t('payments.method.card')}</option>
                                <option value="mobile_money">{t('payments.method.mobile_money')}</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="proofReferenceText">{t('field.paymentReference')}</Label>
                            <Input
                                id="proofReferenceText"
                                name="proofReferenceText"
                                value={formValues.proofReferenceText}
                                onChange={(e) =>
                                    setFormValues((prev) => ({ ...prev, proofReferenceText: e.target.value }))
                                }
                                required
                            />
                            {!ENABLE_UPLOADS && <p className="text-xs text-muted-foreground">{t('common.storage.disabled')}</p>}
                            {ENABLE_UPLOADS && (
                                <div className="mt-2">
                                    <Label htmlFor="proofFile">{t('payments.proofFileOptional')}</Label>
                                    <Input
                                        id="proofFile"
                                        name="proofFile"
                                        type="file"
                                        onChange={(e) => setProofFile(e.target.files?.[0])}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? t('common.loading') : t('payments.submit')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
