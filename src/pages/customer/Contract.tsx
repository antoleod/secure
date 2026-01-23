/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export function ContractPage() {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const storageKey = `contract-consent-${currentUser?.uid ?? 'anon'}`;
    const [signature, setSignature] = useState('');
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
        if (stored) {
            setAccepted(true);
            setSignature(stored);
        }
    }, [storageKey]);

    function handleAccept(e: React.FormEvent) {
        e.preventDefault();
        if (!signature) return;
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, signature);
        }
        setAccepted(true);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('contract.title')}</CardTitle>
                    <CardDescription>{t('contract.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                        <li>{t('contract.point1')}</li>
                        <li>{t('contract.point2')}</li>
                        <li>{t('contract.point3')}</li>
                        <li>{t('contract.point4')}</li>
                    </ul>

                    <form onSubmit={handleAccept} className="space-y-3">
                        <label className="text-sm font-medium" htmlFor="signature">
                            {t('contract.signatureLabel')}
                        </label>
                        <Input
                            id="signature"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={accepted}>
                            {accepted ? t('common.status.confirmed') : t('contract.signCta')}
                        </Button>
                        {accepted && (
                            <p className="text-sm text-green-700">
                                {t('contract.signed', { signature })}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
