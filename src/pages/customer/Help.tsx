import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { submitSupportTicket } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';
import {
    MessageSquare,
    Mail,
    Phone,
    Clock,
    Send,
    Loader2,
    HelpCircle,
    ChevronDown,
    MapPin,
    LifeBuoy,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomerHelp() {
    const { user, userData } = useAuth();
    const { t } = useI18n();
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        category: 'general',
        message: ''
    });

    const FAQS = [
        {
            q: t('help.faq.eligibility.q'),
            a: t('help.faq.eligibility.a')
        },
        {
            q: "Tasación y Tiempos",
            a: "Normalmente evaluamos tu artículo en menos de 2 horas hábiles. Recibirás una notificación en tu panel cuando esté aprobado."
        },
        {
            q: t('help.faq.payments.q'),
            a: t('help.faq.payments.a')
        },
        {
            q: t('help.faq.uploads.q'),
            a: t('help.faq.uploads.a')
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            await submitSupportTicket(user.uid, form);
            setSent(true);
            setForm({ subject: '', category: 'general', message: '' });
        } catch (error) {
            console.error("Error sending ticket:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32 font-sans animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    <LifeBuoy className="h-4 w-4" />
                    {t('support.label')}
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">{t('support.title')}</h1>
                <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                    {t('support.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* CONTACT INFO (SIDEBAR) */}
                <div className="space-y-6">
                    <Card className="border-none bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <HelpCircle className="w-24 h-24" />
                        </div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-xl font-black">{t('support.contact.title')}</CardTitle>
                            <CardDescription className="text-slate-400">{t('support.contact.subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Phone className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('support.contact.call')}</p>
                                    <p className="font-bold text-lg">+32 460 21 02 02</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('support.contact.email')}</p>
                                    <p className="font-bold text-lg">hola@secure.tech</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Clock className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('support.contact.hours')}</p>
                                    <p className="font-bold">Lun-Vie: 09:00 - 18:30</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('support.contact.office')}</p>
                                    <p className="font-bold">Bruselas, Bélgica</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAQ Quick View */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">{t('support.faq.title')}</h3>
                        {FAQS.map((faq, i) => (
                            <details key={i} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-blue-200">
                                <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700 text-sm list-none">
                                    {faq.q}
                                    <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed bg-slate-50/50">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* SUPPORT FORM */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200/60 shadow-xl rounded-[2.5rem] overflow-hidden bg-white h-full">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-6 w-6 text-blue-600" />
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">{t('support.form.title')}</CardTitle>
                                    <CardDescription>{t('support.form.subtitle')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {sent ? (
                                <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">{t('support.form.success.title')}</h3>
                                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                        {t('support.form.success.subtitle', { email: userData?.email || '' })}
                                    </p>
                                    <Button onClick={() => setSent(false)} variant="outline" className="mt-8 rounded-xl px-8">
                                        {t('support.form.another')}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('support.form.subject')}</Label>
                                            <Input
                                                placeholder="Ej: Duda..."
                                                className="rounded-xl border-slate-200 focus:ring-blue-500 h-12"
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('support.form.category')}</Label>
                                            <select
                                                className="w-full flex h-12 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            >
                                                <option value="general">Consulta General</option>
                                                <option value="financial">Dudas Financieras / Pagos</option>
                                                <option value="technical">Problema Técnico</option>
                                                <option value="valuation">Tasación de Prendas</option>
                                                <option value="suggestion">Sugerencias</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('support.form.message')}</Label>
                                        <textarea
                                            placeholder="..."
                                            className="w-full min-h-[200px] rounded-2xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl shadow-xl shadow-blue-100 text-base font-black tracking-tight"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                                    {t('support.form.sending')}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-5 w-5" />
                                                    {t('support.form.submit')}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-center text-[10px] text-slate-400 font-medium">
                                        {t('support.form.disclaimer')}
                                    </p>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
