import { useI18n } from '@/contexts/I18nContext';

interface LanguageSelectorProps {
    className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
    const { locale, setLocale, t } = useI18n();

    return (
        <label className={`flex items-center gap-2 text-sm ${className ?? ''}`}>
            <span className="text-muted-foreground hidden sm:inline">{t('common.languageLabel')}</span>
            <select
                aria-label={t('common.languageLabel')}
                className="border rounded-md px-2 py-1 bg-white text-sm shadow-sm"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'es' | 'fr')}
            >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
            </select>
        </label>
    );
}
