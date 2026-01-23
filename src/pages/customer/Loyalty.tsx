import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchLoyaltyStatus } from '@/lib/firestoreClient';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerLoyalty() {
    const { user } = useAuth();

    const { data: loyalty } = useQuery({
        queryKey: ['loyalty', user?.uid],
        queryFn: () => fetchLoyaltyStatus(user!.uid),
        enabled: Boolean(user?.uid),
    });

    const tier = loyalty?.tier ?? 'standard';
    const completedLoans = loyalty?.completedGoodLoansCount ?? 0;

    // Simple logic for next tier
    const nextTierGoal = tier === 'standard' ? 3 : tier === 'bronze' ? 10 : tier === 'silver' ? 25 : 0;
    const remaining = Math.max(0, nextTierGoal - completedLoans);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
            <Card>
                <CardHeader>
                    <CardTitle>My Status</CardTitle>
                    <CardDescription>Earn rewards by repaying loans on time.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <Info label="Current Tier" value={tier.toUpperCase()} />
                    <Info label="Completed Loans" value={completedLoans.toString()} />
                    {remaining > 0 ? (
                        <Info label="Loans to Next Tier" value={remaining.toString()} />
                    ) : (
                        <Info label="Status" value="Max Tier Reached!" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    );
}
