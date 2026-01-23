import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listLoansForUser, submitPayment } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';
import { Payment } from '@/types';
import {
    CreditCard,
    Upload,
    History,
    Loader2,
    CheckCircle,
    ArrowUpRight,
    Info,
    Wallet,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerPayments() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useI18n();

    const [form, setForm] = useState<{
        loanId: string;
        amountCents: number;
        method: Payment['method'];
        proofFile: File | null;
    }>({
        loanId: '',
        amountCents: 0,
        method: 'bank_transfer',
        proofFile: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const paymentMethods: Array<{ id: Payment['method']; label: string }> = [
        { id: 'bank_transfer', label: t('payments.method.bank_transfer') },
        { id: 'cash', label: t('payments.method.cash') }
    ];

    const { data: loans } = useQuery({
        queryKey: ['loans', user?.uid],
        queryFn: () => listLoansForUser(user!.uid),
        enabled: !!user?.uid,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            setLoading(true);
            try {
                await submitPayment(user.uid, {
                    loanId: form.loanId,
                    amountCents: Math.round(form.amountCents * 100),
                    method: form.method,
                    type: 'mixed',
                    proofFile: form.proofFile || undefined,
                });
            } finally {
                setLoading(false);
            }
        },
        onSuccess: () => {
            setSuccess(true);
            setForm({ loanId: '', amountCents: 0, method: 'bank_transfer', proofFile: null });
            setTimeout(() => setSuccess(false), 5000);
            queryClient.invalidateQueries({ queryKey: ['loans', user?.uid] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.loanId || form.amountCents <= 0) return;
        mutation.mutate();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('payments.title')}</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Mis Pagos</h1>
                    <p className="text-slate-500 mt-4 text-lg max-w-md">{t('payments.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Card */}
                <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
                        <CardTitle className="text-2xl font-black tracking-tight">{t('payments.submit')}</CardTitle>
                        <CardDescription>Registra una transferencia o pago en efectivo para actualizar tu saldo.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4 text-emerald-800"
                                    >
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-[10px] mb-1">¡Registro Exitoso!</p>
                                            <p className="text-sm font-bold">{t('payments.success')}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payments.selectLoan')}</Label>
                                    <div className="relative">
                                        <select
                                            value={form.loanId}
                                            onChange={(e) => setForm({ ...form, loanId: e.target.value })}
                                            className="w-full h-14 pl-5 pr-10 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="">Selecciona un contrato</option>
                                            {loans?.filter(l => l.status === 'active').map(l => (
                                                <option key={l.id} value={l.id!}>
                                                    Préstamo #{l.id?.slice(-8).toUpperCase()} - {(l.outstandingCents / 100).toLocaleString('es-ES')}€
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.amount')}</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-xl"
                                            placeholder="0.00"
                                            value={form.amountCents || ''}
                                            onChange={e => setForm({ ...form, amountCents: Number(e.target.value) })}
                                        />
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">€</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.paymentMethod')}</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {paymentMethods.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setForm({ ...form, method: m.id })}
                                                className={`px-4 py-3 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${form.method === m.id ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-50 bg-slate-50/50 text-slate-400'
                                                    }`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('payments.proofFileOptional')}</Label>
                                    <label className="flex items-center gap-3 px-5 h-14 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 transition-all group overflow-hidden">
                                        <Upload className="h-5 w-5 text-slate-300 group-hover:text-blue-500" />
                                        <span className="text-xs font-bold text-slate-400 truncate flex-1">
                                            {form.proofFile ? form.proofFile.name : "Subir justificante/foto"}
                                        </span>
                                        <input type="file" className="hidden" onChange={e => setForm({ ...form, proofFile: e.target.files?.[0] || null })} />
                                    </label>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-slate-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-slate-200 mt-4 text-sm font-black uppercase tracking-[0.2em] transition-all group active:scale-[0.98]"
                                disabled={loading || !form.loanId || form.amountCents <= 0}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>
                                        Pagar Ahora
                                        <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card - Side */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 text-white rounded-[3rem] p-10 relative overflow-hidden group border-none shadow-2xl shadow-indigo-100">
                        <div className="relative z-10">
                            <Info className="h-10 w-10 mb-6 text-indigo-300" />
                            <h3 className="text-2xl font-black tracking-tight leading-none mb-4">Información de Transferencia</h3>
                            <div className="space-y-4 opacity-90 text-sm">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Banco</p>
                                    <p className="font-bold">BNP Paribas Fortis</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">IBAN</p>
                                    <p className="font-mono font-bold tracking-wider">BE12 3456 7890 1234</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Concepto</p>
                                    <p className="font-bold">ORDEN #{user?.uid.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                        <Wallet className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    </Card>

                    <Card className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="h-4 w-4 text-slate-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Ayuda con pagos</h4>
                        </div>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="text-xs font-bold text-slate-600 flex items-center justify-between cursor-pointer list-none">
                                    ¿Cuándo se actualiza mi saldo?
                                    <ArrowUpRight className="h-3 w-3 group-open:rotate-45 transition-transform" />
                                </summary>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    Tras enviar el justificante, el administrador validará el pago en un plazo máximo de 4h laborables. Una vez validado, tu "Saldo deudor" se actualizará automáticamente.
                                </p>
                            </details>
                            <div className="h-[1px] bg-slate-50 w-full" />
                            <details className="group">
                                <summary className="text-xs font-bold text-slate-600 flex items-center justify-between cursor-pointer list-none">
                                    ¿Puedo pagar en efectivo?
                                    <ArrowUpRight className="h-3 w-3" />
                                </summary>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    Sí, únicamente en nuestra oficina central de Bruselas previa cita. Se emitirá un recibo digital al momento.
                                </p>
                            </details>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
