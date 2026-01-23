import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { fetchKyc, submitKyc } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';

const kycSchema = z.object({
    idType: z.enum(['passport', 'national_id', 'drivers_license']),
    idNumber: z.string().min(4),
    idExpiryDate: z.string().min(4),
    address: z.string().min(3),
    city: z.string().min(2),
    postalCode: z.string().min(2),
    country: z.string().min(2),
});

export function VerifyIdentityPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState('');

    const { data: kycRecord, isLoading } = useQuery({
        queryKey: ['kyc', currentUser?.uid],
        queryFn: () => fetchKyc(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const mutation = useMutation({
        mutationFn: (data: z.infer<typeof kycSchema>) => submitKyc(currentUser!.uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kyc', currentUser?.uid] });
        },
        onError: (err) => {
            console.error(err);
            setFormError(t('common.error.generic'));
        },
    });

    const initialValues = useMemo(
        () => ({
            idType: kycRecord?.idType ?? 'passport',
            idNumber: kycRecord?.idNumber ?? '',
            idExpiryDate: kycRecord?.idExpiryDate ?? '',
            address: kycRecord?.address ?? '',
            city: kycRecord?.city ?? '',
            postalCode: kycRecord?.postalCode ?? '',
            country: kycRecord?.country ?? '',
        }),
        [kycRecord]
    );

    const [formValues, setFormValues] = useState(initialValues);

    // Keep state in sync once data loads
    useEffect(() => {
        setFormValues(initialValues);
    }, [initialValues]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');

        const parsed = kycSchema.safeParse(formValues);
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
                    <CardTitle>{t('kyc.title')}</CardTitle>
                    <CardDescription>{t('kyc.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}

                    {!isLoading && (
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                            {formError && (
                                <div className="md:col-span-2 bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="idType">{t('field.idType')}</Label>
                            <select
                                id="idType"
                                name="idType"
                                className="border rounded-md px-3 py-2"
                                value={formValues.idType}
                                onChange={handleChange}
                            >
                                    <option value="passport">{t('kyc.id.passport')}</option>
                                    <option value="national_id">{t('kyc.id.national')}</option>
                                    <option value="drivers_license">{t('kyc.id.drivers')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="idNumber">{t('field.idNumber')}</Label>
                                <Input id="idNumber" name="idNumber" value={formValues.idNumber} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="idExpiryDate">{t('field.idExpiry')}</Label>
                                <Input
                                    id="idExpiryDate"
                                    name="idExpiryDate"
                                    type="date"
                                    value={formValues.idExpiryDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">{t('field.address')}</Label>
                                <Input id="address" name="address" value={formValues.address} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">{t('field.city')}</Label>
                                <Input id="city" name="city" value={formValues.city} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postalCode">{t('field.postalCode')}</Label>
                                <Input id="postalCode" name="postalCode" value={formValues.postalCode} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">{t('field.country')}</Label>
                                <Input id="country" name="country" value={formValues.country} onChange={handleChange} required />
                            </div>

                            <div className="md:col-span-2">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? t('common.loading') : t('kyc.submit')}
                                </Button>
                                {mutation.isSuccess && (
                                    <p className="text-green-700 text-sm mt-3">{t('kyc.success')}</p>
                                )}
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
