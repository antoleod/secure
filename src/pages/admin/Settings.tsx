import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { fetchSettings, updateSettings } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

const settingsSchema = z.object({
    maxLoanAmount: z.number().min(1),
    minLoanAmount: z.number().min(1),
    defaultInterestRate: z.number().min(0),
    maxLoanTerm: z.number().min(1),
    minLoanTerm: z.number().min(1),
    maintenanceMode: z.boolean(),
});

export function SettingsPage() {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const [feedback, setFeedback] = useState('');

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
    });

    const mutation = useMutation({
        mutationFn: (values: z.infer<typeof settingsSchema>) => updateSettings(currentUser!.uid, values),
        onSuccess: () => setFeedback(t('admin.settings.success')),
        onError: (err) => {
            console.error(err);
            setFeedback(t('common.error.generic'));
        },
    });

    const [formValues, setFormValues] = useState({
        maxLoanAmount: settings?.maxLoanAmount ?? 0,
        minLoanAmount: settings?.minLoanAmount ?? 0,
        defaultInterestRate: settings?.defaultInterestRate ?? 0,
        maxLoanTerm: settings?.maxLoanTerm ?? 0,
        minLoanTerm: settings?.minLoanTerm ?? 0,
        maintenanceMode: settings?.maintenanceMode ?? false,
    });

    useEffect(() => {
        if (settings) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormValues({
                maxLoanAmount: settings.maxLoanAmount,
                minLoanAmount: settings.minLoanAmount,
                defaultInterestRate: settings.defaultInterestRate,
                maxLoanTerm: settings.maxLoanTerm,
                minLoanTerm: settings.minLoanTerm,
                maintenanceMode: settings.maintenanceMode,
            });
        }
    }, [settings]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFeedback('');

        const parsed = settingsSchema.safeParse(formValues);
        if (!parsed.success) {
            setFeedback(t('common.error.generic'));
            return;
        }

        mutation.mutate(parsed.data);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.settings.title')}</CardTitle>
                    <CardDescription>{t('admin.settings.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                            {feedback && (
                                <div className="md:col-span-2 text-sm text-muted-foreground">{feedback}</div>
                            )}

                            <Field
                                label={t('admin.settings.maxAmount')}
                                name="maxLoanAmount"
                                value={formValues.maxLoanAmount}
                                onChange={(v) => setFormValues((prev) => ({ ...prev, maxLoanAmount: v }))}
                            />
                            <Field
                                label={t('admin.settings.minAmount')}
                                name="minLoanAmount"
                                value={formValues.minLoanAmount}
                                onChange={(v) => setFormValues((prev) => ({ ...prev, minLoanAmount: v }))}
                            />
                            <Field
                                label={t('field.interestRate')}
                                name="defaultInterestRate"
                                value={formValues.defaultInterestRate}
                                onChange={(v) => setFormValues((prev) => ({ ...prev, defaultInterestRate: v }))}
                            />
                            <Field
                                label={t('admin.settings.maxTerm')}
                                name="maxLoanTerm"
                                value={formValues.maxLoanTerm}
                                onChange={(v) => setFormValues((prev) => ({ ...prev, maxLoanTerm: v }))}
                            />
                            <Field
                                label={t('admin.settings.minTerm')}
                                name="minLoanTerm"
                                value={formValues.minLoanTerm}
                                onChange={(v) => setFormValues((prev) => ({ ...prev, minLoanTerm: v }))}
                            />

                            <div className="md:col-span-2 flex items-center gap-2">
                                <input
                                    id="maintenanceMode"
                                    type="checkbox"
                                    checked={formValues.maintenanceMode}
                                    onChange={(e) =>
                                        setFormValues((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                                    }
                                />
                                <Label htmlFor="maintenanceMode">{t('admin.settings.maintenance')}</Label>
                            </div>

                            <div className="md:col-span-2">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? t('common.loading') : t('admin.settings.save')}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
}: {
    label: string;
    name: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                required
            />
        </div>
    );
}
