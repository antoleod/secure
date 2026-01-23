import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listLoansForUser, fetchLoyaltyStatus, fetchKyc, listCustomerRequests } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
    const { user, userData } = useAuth();
    const { t } = useI18n();

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

    // Calculations
    const activeLoanCount = useMemo(() => loans?.filter(l => l.status === 'active').length || 0, [loans]);
    const totalDebt = useMemo(() => loans?.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.outstandingCents : 0), 0) || 0, [loans]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting.morning');
        if (hour < 18) return t('greeting.afternoon');
        return t('greeting.evening');
    }, [t]);

    return (
        <div className="space-y-8 pb-32 font-sans overflow-x-hidden animate-in fade-in duration-700">
            {/* HER0 / WELCOME SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{greeting}</p>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        {t('dashboard.hello', { name: userData?.fullName?.split(' ')[0] || '' })}
                    </h1>
                    <p className="text-slate-500 mt-3 max-w-md text-lg">
                        {loansLoading ? <Skeleton className="h-4 w-full mt-2" /> : t('dashboard.welcomeText', { count: activeLoanCount })}
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
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('collateral.add.subcta')}</span>
                                <span className="block text-lg font-black">{t('collateral.add.cta')}</span>
                            </div>
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* KRI CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total debt card */}
                <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-slate-200" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.totalDebt')}</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                        {loansLoading ? <Skeleton className="h-10 w-24" /> : `${(totalDebt / 100).toLocaleString('es-ES')}€`}
                    </h3>
                </motion.div>

                {/* Estimated Limit */}
                <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Gem className="h-6 w-6" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-slate-200" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.estimatedLimit')}</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                        {loyaltyLoading ? <Skeleton className="h-10 w-24" /> : `${(loyalty?.creditLimitCents ? loyalty.creditLimitCents / 100 : 2500).toLocaleString('es-ES')}€`}
                    </h3>
                </motion.div>

                {/* Status Secure */}
                <motion.div whileHover={{ y: -5 }} className="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-300">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <span className="bg-emerald-400 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-emerald-300/40">VIP</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">{t('dashboard.status.secure')}</p>
                    <h3 className="text-2xl font-black text-white tracking-tight relative z-10 uppercase italic">
                        {loyaltyLoading ? <Skeleton className="h-8 w-24 bg-slate-800" /> : (loyalty?.tier || 'Gold Member')}
                    </h3>
                </motion.div>
            </div>

            {/* IDENTITY & ACTIVITY SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-start">

                {/* Left Column - Mini Statuses */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity Status */}
                    <Link to="/app/verify-identity">
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kyc?.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('dashboard.identity.status')}</p>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                                        {kycLoading ? t('common.loading') : (kyc?.status === 'verified' ? t('dashboard.identity.verified') : (kyc?.status === 'pending' ? t('dashboard.identity.pending') : t('dashboard.identity.complete')))}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                        </motion.div>
                    </Link>

                    {/* Help Support */}
                    <Link to="/app/help">
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-[#0f3d5c] to-emerald-500 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-xl font-black tracking-tight">{t('dashboard.help.title')}</h4>
                                <p className="text-emerald-100 text-sm mt-1 mb-6 font-bold">{t('dashboard.help.subtitle')}</p>
                                <div className="flex -space-x-3 overflow-hidden mb-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500 bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i}`} alt="Agent" />
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-emerald-500 bg-emerald-600 text-[10px] font-black">+5</div>
                                </div>
                                <Button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl border-none shadow-none text-[10px] font-black uppercase tracking-widest">{t('common.view')}</Button>
                            </div>
                            <ShoppingBag className="absolute -bottom-6 -right-6 h-32 w-32 text-white opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000" />
                        </motion.div>
                    </Link>
                </div>

                {/* Right Column - Live Activity */}
                <Card className="lg:col-span-5 border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 p-10 flex flex-row items-center justify-between border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('dashboard.activity.title')}</span>
                            </div>
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">{t('dashboard.activity.subtitle')}</CardTitle>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-sm hover:bg-slate-50">{t('dashboard.activity.history')}</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {requestsLoading ? (
                            <div className="p-10 space-y-6">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                            </div>
                        ) : requests?.length === 0 ? (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <p className="text-slate-400 font-bold">{t('dashboard.activity.empty')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {requests?.map((req, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={req.id}
                                        className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-500 shadow-sm ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-700'
                                                }`}>
                                                {req.status === 'approved' ? <CheckCircleIcon className="h-6 w-6" /> : (req.status === 'rejected' ? <Info className="h-6 w-6" /> : <Clock className="h-6 w-6" />)}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 text-lg tracking-tight">Solicitud de Crédito</h5>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{req.id?.slice(0, 8)}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Hoy'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right">
                                            <div>
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">{(req.amountRequested / 100).toLocaleString('es-ES')}€</p>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {t(`common.status.${req.status}`)}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-emerald-600 transition-all" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* STORE PREVIEW BANNER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#0f3d5c] via-[#0f2f43] to-[#0c1f2f] rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-300/20 to-transparent pointer-events-none" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-6 font-black uppercase tracking-[0.4em] text-xs">
                            <SparklesIcon className="h-5 w-5" />
                            <span>{t('dashboard.store.subtitle')}</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">{t('dashboard.store.title')}</h2>
                        <p className="text-slate-400 mt-8 text-lg max-w-sm leading-relaxed">
                            Accede a dispositivos de última generación procedentes de liquidaciones con descuentos de hasta el 40%. Solo para miembros Secure.
                        </p>
                        <Link to="/app/store">
                            <Button className="mt-12 bg-emerald-300 hover:bg-emerald-200 text-slate-900 px-10 py-8 h-auto rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-200/30 transition-all active:scale-95">
                                {t('dashboard.store.cta')}
                            </Button>
                        </Link>
                    </div>
                    <div className="relative group-hover:scale-105 transition-transform duration-1000">
                        <div className="absolute inset-0 bg-emerald-400/25 blur-[120px] rounded-full" />
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-4 p-8 relative"
                        >
                            <div className="aspect-square bg-slate-800 rounded-[2rem] overflow-hidden mb-6">
                                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Special item" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-black text-xl tracking-tight">iPhone 15 Pro Max</h4>
                                    <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mt-1">Liquidación Flash</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs line-through">1.299€</p>
                                    <p className="text-white font-black text-2xl tracking-tighter">849€</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Inline missing Icons
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
)
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
