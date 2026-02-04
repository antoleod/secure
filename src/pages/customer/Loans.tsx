import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Loan } from '@/types';
import { useI18n } from '@/contexts/I18nContext';
import { Loader2, Wallet, ArrowUpRight, Info, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function CustomerLoans() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        async function loadLoans() {
            if (!user || !db) {
                setLoading(false);
                return;
            }
            try {
                const q = query(collection(db, 'loans'), where('customerUid', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const data: Loan[] = [];
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() } as Loan);
                });
                setLoans(data);
            } catch (error) {
                console.error('Error loading loans:', error);
            } finally {
                setLoading(false);
            }
        }
        loadLoans();
    }, [user]);

    const handleSurrender = async (loanId: string) => {
        if (!confirm('¿Estás seguro que deseas entregar tu prenda para saldar la deuda? Esta acción notificará al administrador para procesar la venta.')) {
            return;
        }
        setProcessing(loanId);
        try {
            const docRef = doc(db, 'loans', loanId);
            await updateDoc(docRef, {
                surrenderRequested: true,
                updatedAt: Timestamp.now()
            });
            setLoans(prev => prev.map(l => l.id === loanId ? { ...l, surrenderRequested: true } : l));
        } catch (error) {
            console.error("Error requesting surrender:", error);
            alert("Error al procesar la solicitud.");
        } finally {
            setProcessing(null);
        }
    };

    const stats = useMemo(() => ({
        activeCount: loans.filter(l => l.status === 'active').length,
        totalDebt: loans.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.outstandingCents : 0), 0)
    }), [loans]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            <p className="font-bold uppercase tracking-widest text-xs">{t('common.loading')}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-32 font-sans animate-in fade-in duration-700">
            {/* Header / Stats Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Wallet className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cuentas de Crédito</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('loans.list.title')}</h1>
                    <p className="text-slate-500 mt-2">
                        Gestiona tus créditos activos, solicita entregas de prendas o revisa tu historial.
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-6">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Activos</p>
                        <p className="text-2xl font-black text-slate-900">{stats.activeCount}</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100" />
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saldo Deudor</p>
                        <p className="text-2xl font-black text-blue-600 italic">{(stats.totalDebt / 100).toLocaleString('es-ES')}€</p>
                    </div>
                </div>
            </div>

            {/* Loans Table / Grid */}
            <div className="grid grid-cols-1 gap-6">
                {loans.length === 0 ? (
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-50 p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('loans.list.empty')}</h3>
                        <Link to="/app/collateral">
                            <Button variant="link" className="mt-4 text-blue-600 font-black uppercase tracking-widest text-[10px]">Tasar una prenda para empezar</Button>
                        </Link>
                    </Card>
                ) : (
                    loans.map((loan) => (
                        <Card key={loan.id} className="rounded-[2.5rem] border-none shadow-xl shadow-indigo-50/20 overflow-hidden hover:shadow-indigo-500/10 transition-all duration-500 group">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left Section - Brand/ID */}
                                <div className="p-8 lg:w-1/3 bg-slate-50 group-hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID PRÉSTAMO</p>
                                            <p className="font-mono text-xs font-black text-slate-900">#{loan.id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
                                        {loan.collateralRefs && loan.collateralRefs.length > 0 ? "Varios artículos" : "Crédito Rápido"}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${loan.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {t(`common.status.${loan.status}`)}
                                        </span>
                                        {loan.surrenderRequested && (
                                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">ENTREGA SOLICITADA</span>
                                        )}
                                    </div>
                                </div>

                                {/* Right Section - Financial Stats */}
                                <div className="p-8 flex-1 bg-white grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('loans.details.balance')}</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{(loan.outstandingCents / 100).toLocaleString('es-ES')}€</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Próx. Cuota</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter italic">
                                            {loan.nextDueDate ? (loan.nextDueDate.toDate().toLocaleDateString()) : '---'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interés Anual</p>
                                        <p className="text-2xl font-black text-blue-600 tracking-tighter italic">{loan.interestRate}%</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        {loan.status === 'active' && (
                                            <>
                                                <Button
                                                    onClick={() => handleSurrender(loan.id!)}
                                                    variant="outline"
                                                    disabled={!!processing || loan.surrenderRequested}
                                                    className="rounded-2xl border-slate-200 h-14 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all"
                                                >
                                                    {processing === loan.id ? <Loader2 className="animate-spin" /> : "Entregar Prenda"}
                                                </Button>
                                                <Link to="/app/payments">
                                                    <Button className="rounded-2xl bg-slate-900 hover:bg-blue-600 h-14 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                                                        Pagar
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Education / Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <Info className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-none mb-4">¿Cómo funcionan los pagos?</h3>
                        <p className="text-indigo-100 text-sm opacity-80 leading-relaxed mb-6">
                            Los pagos se realizan mensualmente o al final del plazo. Debes realizar una transferencia bancaria y subir el justificante para que el administrador confirme la reducción de tu saldo.
                        </p>
                        <Button className="bg-indigo-700 hover:bg-indigo-800 border-none rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest">Manual de Usuario</Button>
                    </div>
                    <Wallet className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-none mb-4">Entrega de prenda para liquidar</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Si no deseas prorrogar o pagar tu deuda, puedes solicitar la entrega de la prenda. Nuestro equipo la pondrá a la venta en el Marketplace y cancelará tu deuda automáticamente sin afectar a tu solvencia.
                        </p>
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest">Saber más</Button>
                    </div>
                    <ArrowUpRight className="absolute -bottom-10 -right-10 h-40 w-40 text-blue-500 opacity-20 group-hover:rotate-12 transition-transform duration-1000" />
                </div>
            </div>
        </div>
    );
}

// Missing icon
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
)
