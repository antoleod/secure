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

export default function CustomerDashboard() {
    const { user, userData } = useAuth();

    // Data Fetching
    const { data: loans } = useQuery({
        queryKey: ['loans', user?.uid],
        queryFn: () => listLoansForUser(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: loyalty } = useQuery({
        queryKey: ['loyalty', user?.uid],
        queryFn: () => fetchLoyaltyStatus(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: kyc } = useQuery({
        queryKey: ['kyc', user?.uid],
        queryFn: () => fetchKyc(user!.uid),
        enabled: !!user?.uid,
    });

    const { data: requests } = useQuery({
        queryKey: ['requests', user?.uid],
        queryFn: () => listCustomerRequests(user!.uid),
        enabled: !!user?.uid,
    });

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
        <div className="space-y-8 pb-32 font-sans animate-in fade-in duration-700">
            {/* HER0 / WELCOME SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">{greeting}</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hola, {userData?.fullName?.split(' ')[0]} 👋</h1>
                    <p className="text-slate-500 mt-1 max-w-md">Bienvenido de nuevo a tu panel financiero. Tienes {loans?.filter(l => l.status === 'active').length || 0} préstamos activos hoy.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/app/collateral">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-2xl px-6 py-6 h-auto">
                            <Plus className="mr-2 h-5 w-5" />
                            <div className="flex flex-col items-start leading-tight">
                                <span className="font-bold">Nueva Prenda</span>
                                <span className="text-[10px] opacity-80">Empezar empeño</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* MAIN STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LOAN CARD */}
                <Card className="border-none bg-slate-900 shadow-2xl shadow-slate-200 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-24 h-24 text-white" />
                    </div>
                    <CardContent className="pt-8 relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Deuda Total</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-black text-white tracking-tighter">{(totalDebt / 100).toFixed(2)}€</h2>
                        </div>
                        <div className="mt-6 flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                            <span>Próximo pago</span>
                            <span className="text-white">{activeLoan ? 'Pronto' : '--'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* LOYALTY CARD */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden relative group">
                    <CardContent className="pt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Trophy className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nivel de Lealtad</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-100 italic">
                                {loyalty?.tier || 'Standard'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{loyalty?.tier || 'Standard Member'}</h2>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Progreso a {nextTierInfo.next}</span>
                                <span>{nextTierInfo.progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000"
                                    style={{ width: `${nextTierInfo.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KYC CARD */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                    <CardContent className="pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verificación ID</span>
                        </div>

                        {kyc?.status === 'verified' ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-bold">Cuenta Certificada</span>
                                </div>
                                <p className="text-xs text-slate-500">Puedes acceder a préstamos de joyería y electrónicos de alta gama.</p>
                            </div>
                        ) : kyc?.status === 'pending' ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <Clock className="h-5 w-5 animate-pulse" />
                                    <span className="font-bold">Revisión Pendiente</span>
                                </div>
                                <p className="text-xs text-slate-500">Estamos validando tus documentos. Te avisaremos pronto.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Info className="h-5 w-5" />
                                    <span className="font-bold">No Verificado</span>
                                </div>
                                <Link to="/app/verify-identity" className="text-xs text-blue-600 font-bold hover:underline">Completar ahora →</Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* SECONDARY ROW: ACTIVITY & QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVITY FEED */}
                <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black tracking-tight">Actividad Reciente</CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-900 font-black tracking-widest uppercase">Ver Todo</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50 px-6">
                            {(requests?.length || 0) > 0 ? (
                                requests?.slice(0, 5).map((req, i) => (
                                    <div key={i} className="py-4 flex items-center justify-between group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.status === 'approved' ? 'bg-emerald-50' :
                                                    req.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
                                                }`}>
                                                <ArrowUpRight className={`h-5 w-5 ${req.status === 'approved' ? 'text-emerald-500' :
                                                        req.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Solicitud de {req.amountRequested}€</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.createdAt.toDate().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-400 text-sm italic">No tienes actividad reciente todavía.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* QUICK ACTIONS / STORE PROMO */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl shadow-indigo-100 relative overflow-hidden h-fit">
                        <div className="absolute -bottom-4 -right-4 opacity-10">
                            <ShoppingBag className="w-32 h-32 text-white" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white font-black text-xl">Tienda Especial</CardTitle>
                            <CardDescription className="text-indigo-100">Artículos exclusivos al mejor precio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/app/store">
                                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold">
                                    Comprar Ahora
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm border-dashed">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Gem className="h-4 w-4 text-blue-600" />
                                <CardTitle className="text-sm font-bold uppercase tracking-tighter">¿Necesitas Ayuda?</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-slate-500 mb-4">Nuestro equipo de soporte está disponible de Lunes a Viernes para asistirte.</p>
                            <Link to="/app/help">
                                <Button variant="outline" className="w-full rounded-xl text-xs h-9">Contactar Soporte</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Add these to lucide-react in case missed
const CheckCircle2 = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)
