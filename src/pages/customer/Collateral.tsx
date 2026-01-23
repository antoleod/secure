import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { registerCollateral, listCollaterals } from '@/lib/firestoreClient';
import { formatMoney } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

const collateralSchema = z.object({
    type: z.enum(['vehicle', 'property', 'jewelry', 'electronics', 'other']),
    description: z.string().min(3),
    estimatedValue: z.number().positive(),
});

export function CollateralPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: collaterals, isLoading } = useQuery({
        queryKey: ['collaterals', currentUser?.uid],
        queryFn: () => listCollaterals(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const mutation = useMutation({
        mutationFn: (values: z.infer<typeof collateralSchema>) => registerCollateral(currentUser!.uid, values),
        onSuccess: () => {
            setSuccess(t('collateral.success'));
            queryClient.invalidateQueries({ queryKey: ['collaterals', currentUser?.uid] });
        },
        onError: (err) => {
            console.error(err);
            setError(t('common.error.generic'));
        },
    });

    const [formValues, setFormValues] = useState({
        type: 'electronics',
        description: '',
        estimatedValue: 0,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        const parsed = collateralSchema.safeParse({
            ...formValues,
            estimatedValue: Number(formValues.estimatedValue),
        });

        if (!parsed.success) {
            setError(t('common.error.generic'));
            return;
        }

        mutation.mutate({ ...parsed.data, estimatedValue: Number(parsed.data.estimatedValue) });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('collateral.title')}</CardTitle>
                    <CardDescription>{t('collateral.subtitle')}</CardDescription>
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
                            <Label htmlFor="type">{t('nav.collateral')}</Label>
                            <select
                                id="type"
                                name="type"
                                className="border rounded-md px-3 py-2 w-full"
                                value={formValues.type}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="vehicle">{t('collateral.type.vehicle')}</option>
                                <option value="property">{t('collateral.type.property')}</option>
                                <option value="jewelry">{t('collateral.type.jewelry')}</option>
                                <option value="electronics">{t('collateral.type.electronics')}</option>
                                <option value="other">{t('collateral.type.other')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedValue">{t('field.estimatedValue')}</Label>
                            <Input
                                id="estimatedValue"
                                name="estimatedValue"
                                type="number"
                                value={formValues.estimatedValue}
                                onChange={(e) =>
                                    setFormValues((prev) => ({ ...prev, estimatedValue: Number(e.target.value) }))
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">{t('common.storage.disabled')}</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">{t('field.description')}</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formValues.description}
                                onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? t('common.loading') : t('collateral.submit')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('nav.collateral')}</CardTitle>
                    <CardDescription>{t('customer.recentActivity')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!collaterals || collaterals.length === 0) && (
                        <p className="text-muted-foreground">{t('customer.noActivity')}</p>
                    )}
                    {!isLoading && collaterals && collaterals.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {collaterals.map((c) => (
                                <Card key={c.id} className="border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg capitalize">{c.type}</CardTitle>
                                        <CardDescription>{c.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {t('field.estimatedValue')}: {formatMoney(c.estimatedValue)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t('loans.details.status')}: {c.status}
                                        </p>
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
