import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLoyaltyStatus } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';

export function LoyaltyPage() {
    const { currentUser } = useAuth();
    const { t } = useI18n();

    const { data: loyalty } = useQuery({
        queryKey: ['loyalty', currentUser?.uid],
        queryFn: () => fetchLoyaltyStatus(currentUser!.uid),
        enabled: Boolean(currentUser?.uid),
    });

    const tier = loyalty?.tier ?? 'bronze';
    const points = loyalty?.points ?? 0;
    const nextTier = loyalty?.nextTierPoints ?? 100;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('loyalty.title')}</CardTitle>
                    <CardDescription>{t('loyalty.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <Info label={t('loyalty.tier')} value={tier} />
                    <Info label={t('loyalty.points')} value={points.toString()} />
                    <Info label={t('loyalty.nextTier')} value={`${nextTier} pts`} />
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    );
}
