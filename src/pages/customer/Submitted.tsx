import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SubmittedPage() {
    const { t } = useI18n();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('loan.new.success')}</CardTitle>
                    <CardDescription>{t('customer.recentActivity')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t('loan.new.subtitle')}
                    </p>
                    <Link to="/app/loans">
                        <Button variant="outline" size="sm">
                            {t('loans.list.title')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
