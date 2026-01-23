import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listLoansForUser, fetchLoyaltyStatus, fetchKyc, listCustomerRequests } from '@/lib/firestoreClient';
import {
    Wallet,
    ShieldCheck,
    TrendingUp,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Info,
    Plus,
    ShoppingBag,
    Gem,
    Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
    const { user, userData } = useAuth();

    // Data Fetching
    const { data: loans, isLoading: loansLoading } = useQuery({
        queryKey: ['loans', user?.uid],
        queryFn: () => listLoansForUser(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: loyalty, isLoading: loyaltyLoading } = useQuery({
        queryKey: ['loyalty', user?.uid],
        queryFn: () => fetchLoyaltyStatus(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: kyc, isLoading: kycLoading } = useQuery({
        queryKey: ['kyc', user?.uid],
        queryFn: () => fetchKyc(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: requests, isLoading: requestsLoading } = useQuery({
        queryKey: ['requests', user?.uid],
        queryFn: () => listCustomerRequests(user!.uid),
        enabled: !!user?.uid,
    });

    const globalLoading = loansLoading || loyaltyLoading || kycLoading || requestsLoading;

    // Calculations
    const activeLoan = useMemo(() => loans?.find(l => l.status === 'active'), [loans]);
    const totalDebt = useMemo(() => loans?.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.outstandingCents : 0), 0) || 0, [loans]);

    const nextTierInfo = useMemo(() => {
        const tier = loyalty?.tier || 'standard';
        switch (tier) {
            case 'standard': return { next: 'Bronze', progress: (loyalty?.completedGoodLoansCount || 0) / 2 * 100 };
            case 'bronze': return { next: 'Silver', progress: (loyalty?.completedGoodLoansCount || 0) / 5 * 100 };
            case 'silver': return { next: 'Gold', progress: (loyalty?.completedGoodLoansCount || 0) / 10 * 100 };
            default: return { next: 'MAX', progress: 100 };
        }
    }, [loyalty]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    }, []);

    return (
        <div className="space-y-8 pb-32 font-sans overflow-x-hidden">
            {/* HER0 / WELCOME SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{greeting}</p>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Hola, {userData?.fullName?.split(' ')[0] || <Skeleton className="h-10 w-32 inline-block" />} 👋
                    </h1>
                    <p className="text-slate-500 mt-3 max-w-md text-lg">
                        {loansLoading ? <Skeleton className="h-4 w-full mt-2" /> : `Bienvenido al centro financiero de Oryxen. Tienes ${loans?.filter(l => l.status === 'active').length || 0} préstamos activos.`}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link to="/app/collateral">
                        <Button className="bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-200 rounded-3xl px-8 py-8 h-auto group transition-all duration-500">
                            <Plus className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                            <div className="flex flex-col items-start leading-tight">
                                <span className="font-black text-lg">Nueva Prenda</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empezar tasación</span>
                            </div>
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* MAIN STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* DEBT CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl shadow-slate-200 overflow-hidden relative h-[220px]">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet className="w-24 h-24 text-white" />
                        </div>
                        <CardContent className="pt-10 flex flex-col h-full justify-between pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Deuda Total</span>
                                </div>
                                {loansLoading ? (
                                    <Skeleton className="h-12 w-40 bg-white/5" />
                                ) : (
                                    <h2 className="text-5xl font-black text-white tracking-tighter">{(totalDebt / 100).toFixed(2)}€</h2>
                                )}
                            </div>
                            <div className="flex items-center justify-between text-white/30 text-[10px] font-black uppercase tracking-widest pt-6 border-t border-white/5">
                                <span>Límite Estimado</span>
                                <span className="text-blue-400">1.250€</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* LOYALTY CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] h-[220px]">
                        <CardContent className="pt-10 flex flex-col h-full justify-between pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Trophy className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Estatus Oryxen</span>
                                    </div>
                                    {loyaltyLoading ? <Skeleton className="h-5 w-16" /> : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full ring-1 ring-amber-100">
                                            {loyalty?.tier || 'Standard'}
                                        </span>
                                    )}
                                </div>
                                {loyaltyLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Nivel {loyalty?.tier || 'Member'}</h2>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>A {nextTierInfo.next}</span>
                                                <span>{nextTierInfo.progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${nextTierInfo.progress}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* KYC CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] h-[220px]">
                        <CardContent className="pt-10 flex flex-col h-full justify-between pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Identidad</span>
                                </div>
                                {kycLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {kyc?.status === 'verified' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <CheckCircle className="h-6 w-6" />
                                                    <span className="text-xl font-black tracking-tight">Verificado</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wider">Máxima confianza financiera habilitada.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-amber-500">
                                                    <Clock className="h-6 w-6" />
                                                    <span className="text-xl font-black tracking-tight">Pendiente</span>
                                                </div>
                                                <Link to="/app/verify-identity" className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1 leading-none">
                                                    Completar Perfil <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* SECONDARY ROW: FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVITY FEED */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <Card className="border-none bg-white shadow-xl shadow-slate-100 rounded-[3rem] overflow-hidden">
                        <CardHeader className="px-8 pt-10 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Actividad en Vivo</CardTitle>
                                    <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sigue tus solicitudes</CardDescription>
                                </div>
                                <Button variant="ghost" className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-slate-900">Ver Historial</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                            <div className="space-y-2">
                                {requestsLoading ? (
                                    [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-3xl mb-4" />)
                                ) : requests && requests.length > 0 ? (
                                    requests.slice(0, 4).map((req, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 5 }}
                                            className="p-5 flex items-center justify-between group bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm rounded-[2rem] transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${req.status === 'approved' ? 'bg-emerald-500 shadow-emerald-100' :
                                                    req.status === 'rejected' ? 'bg-red-500 shadow-red-100' : 'bg-blue-600 shadow-blue-100'
                                                    }`}>
                                                    <ArrowUpRight className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-base font-black text-slate-900 leading-none">Solicitud de {req.amountRequested}€</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{req.createdAt.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {req.status}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                            <ActivityIcon className="h-8 w-8" />
                                        </div>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Aún no tienes movimientos.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* SIDE CARDS */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <Card className="bg-blue-600 text-white border-none shadow-2xl shadow-blue-100 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute -bottom-6 -right-6 opacity-20">
                            <ShoppingBag className="w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <CardHeader className="pt-10">
                            <div className="flex items-center gap-2 mb-2">
                                <SparklesIcon className="h-4 w-4 text-blue-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Tienda Especial</span>
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tight leading-none">Mejores<br />Ofertas</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-10 pt-4">
                            <Link to="/app/store">
                                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest">
                                    Ir de Compras
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 bg-white rounded-[3rem] p-4 border-dashed">
                        <CardContent className="flex items-center gap-4 pt-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                <Gem className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none">¿Dudas?</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase leading-none">Soporte 24/7</p>
                            </div>
                            <Link to="/app/help">
                                <Button size="icon" variant="ghost" className="rounded-xl border border-slate-50"><ChevronRight className="h-4 w-4 text-slate-300" /></Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

// Inline missing Icons
const SparklesIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
)
const ActivityIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)
const CheckCircle = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
