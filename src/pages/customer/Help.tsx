import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';

export function HelpPage() {
    const { t } = useI18n();

    const faqs = [
        { q: t('help.faq.eligibility.q'), a: t('help.faq.eligibility.a') },
        { q: t('help.faq.payments.q'), a: t('help.faq.payments.a') },
        { q: t('help.faq.uploads.q'), a: t('help.faq.uploads.a') },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('help.title')}</CardTitle>
                    <CardDescription>{t('help.contact')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                            <p className="font-semibold">{item.q}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
