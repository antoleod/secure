import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSettings, listCollaterals, submitLoanRequest } from '@/lib/firestoreClient';
import { calculateMonthlyPayment, calculateTotalRepayment } from '@/lib/finance';
import { formatMoney, parseMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

const loanSchema = z.object({
    amountDisplay: z.string().min(1),
    term: z.number().min(1),
    purpose: z.string().min(3),
    collateralId: z.string().optional(),
});

export function NewLoanPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
    });

    const { data: collaterals } = useQuery({
        queryKey: ['collaterals', currentUser?.uid],
        queryFn: () => listCollaterals(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof loanSchema>) => {
            const amount = parseMoney(values.amountDisplay);
            const term = values.term;
            return submitLoanRequest(currentUser!.uid, {
                amount,
                term,
                purpose: values.purpose,
                collateralId: values.collateralId || undefined,
            });
        },
        onSuccess: () => {
            setSuccess(t('loan.new.success'));
            queryClient.invalidateQueries({ queryKey: ['loanRequests', currentUser?.uid] });
        },
        onError: (err) => {
            console.error(err);
            setError(t('common.error.generic'));
        },
    });

    const [formValues, setFormValues] = useState({
        amountDisplay: '1000',
        term: settings?.minLoanTerm ?? 6,
        purpose: '',
        collateralId: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        const parsed = loanSchema.safeParse({
            ...formValues,
            term: Number(formValues.term),
        });

        if (!parsed.success) {
            setError(t('common.error.generic'));
            return;
        }

        mutation.mutate({ ...parsed.data, term: Number(parsed.data.term) });
    }

    const amountCents = useMemo(() => parseMoney(formValues.amountDisplay || '0'), [formValues.amountDisplay]);
    const interestRate = settings?.defaultInterestRate ?? 15;
    const monthlyPayment = calculateMonthlyPayment(amountCents, interestRate, Number(formValues.term || 1));
    const totalRepayment = calculateTotalRepayment(monthlyPayment, Number(formValues.term || 1));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('loan.new.title')}</CardTitle>
                    <CardDescription>{t('loan.new.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                        {error && (
                            <div className="md:col-span-2 bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="md:col-span-2 bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('field.amount')}</Label>
                            <Input
                                id="amount"
                                name="amountDisplay"
                                type="number"
                                inputMode="decimal"
                                min={settings?.minLoanAmount ? settings.minLoanAmount / 100 : 0}
                                max={settings?.maxLoanAmount ? settings.maxLoanAmount / 100 : undefined}
                                value={formValues.amountDisplay}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, amountDisplay: e.target.value }))}
                                required
                            />
                            {settings && (
                                <p className="text-xs text-muted-foreground">
                                    {t('loan.new.amountRange', {
                                        min: formatMoney(settings.minLoanAmount),
                                        max: formatMoney(settings.maxLoanAmount),
                                    })}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="term">{t('field.term')}</Label>
                            <Input
                                id="term"
                                name="term"
                                type="number"
                                min={settings?.minLoanTerm ?? 1}
                                max={settings?.maxLoanTerm ?? 60}
                                value={formValues.term}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, term: Number(e.target.value) }))}
                                required
                            />
                            {settings && (
                                <p className="text-xs text-muted-foreground">
                                    {t('loan.new.termRange', {
                                        min: settings.minLoanTerm,
                                        max: settings.maxLoanTerm,
                                    })}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="purpose">{t('field.purpose')}</Label>
                            <Input
                                id="purpose"
                                name="purpose"
                                value={formValues.purpose}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, purpose: e.target.value }))}
                                required
                                placeholder={t('field.purpose')}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="collateralId">{t('nav.collateral')}</Label>
                            <select
                                id="collateralId"
                                name="collateralId"
                                className="border rounded-md px-3 py-2 w-full"
                                value={formValues.collateralId}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, collateralId: e.target.value }))}
                            >
                                <option value="">{t('loan.new.optionalCollateral')}</option>
                                {(collaterals ?? []).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.type} - {c.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 grid md:grid-cols-3 gap-3 rounded-lg border p-4 bg-muted/30">
                            <InfoLine label={t('loan.new.monthlyPayment')} value={formatMoney(monthlyPayment)} />
                            <InfoLine label={t('loan.new.totalCost')} value={formatMoney(totalRepayment)} />
                            <InfoLine label={t('field.interestRate')} value={`${interestRate}% APR`} />
                        </div>

                        <div className="md:col-span-2">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? t('common.loading') : t('loan.new.submit')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}
