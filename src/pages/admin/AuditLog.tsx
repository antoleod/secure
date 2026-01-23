import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listAuditLogs } from '@/lib/firestoreClient';
import { formatDateTime } from '@/lib/converters';
import { useI18n } from '@/contexts/I18nContext';

export function AuditLogPage() {
    const { t } = useI18n();
    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit'],
        queryFn: listAuditLogs,
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.audit.title')}</CardTitle>
                    <CardDescription>{t('admin.audit.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}
                    {!isLoading && (!logs || logs.length === 0) && (
                        <p className="text-muted-foreground">{t('admin.audit.empty')}</p>
                    )}
                    {!isLoading && logs && logs.length > 0 && (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="border rounded-lg p-4">
                                    <p className="font-semibold">{log.action}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(log.timestamp)} • {log.performedBy}
                                    </p>
                                    <pre className="text-xs bg-muted/50 p-2 rounded mt-2 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
