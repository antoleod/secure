import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAdminRequests, listAllLoans, listAuditLogs } from '@/lib/firestoreClient';
import { FileText, Wallet, ArrowUpRight, Activity, ShieldAlert, TrendingUp, Users2, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    // Data Fetching
    const { data: requests } = useQuery({
        queryKey: ['admin_requests'],
        queryFn: () => listAdminRequests(),
    });

    const { data: loans } = useQuery({
        queryKey: ['admin_loans'],
        queryFn: () => listAllLoans(),
    });

    const { data: auditLogs } = useQuery({
        queryKey: ['admin_audit'],
        queryFn: () => listAuditLogs(),
    });

    // Stats
    const stats = useMemo(() => ({
        pendingRequests: requests?.filter(r => r.status === 'submitted').length || 0,
        activeLoansCount: loans?.filter(l => l.status === 'active').length || 0,
        totalCapitalLent: loans?.reduce((acc, curr) => acc + curr.principalCents, 0) || 0,
        recentActivity: auditLogs?.slice(0, 6) || [],
    }), [requests, loans, auditLogs]);

    return (
        <div className="space-y-8 pb-32 font-sans animate-in fade-in duration-700">
            {/* Admin Welcome */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sistema de Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Gestión</h1>
                    <p className="text-slate-500 mt-1">Supervisión en tiempo real de operaciones, riesgos y liquidez.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/requests">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 rounded-2xl px-6">
                            Revisar Solicitudes
                        </Button>
                    </Link>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pendientes</span>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <FileText className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.pendingRequests}</h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Solicitudes de préstamo</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Activos</span>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Wallet className="h-4 w-4 text-indigo-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.activeLoansCount}</h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Préstamos vigentes</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Capital</span>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{(stats.totalCapitalLent / 100).toLocaleString('es-ES')}€</h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Total prestado bruto</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-slate-900 shadow-xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Clientes</span>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Users2 className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-black text-white tracking-tighter">{loans ? [...new Set(loans.map(l => l.customerUid))].length : 0}</h2>
                        <p className="text-[10px] text-white/40 font-bold mt-1 uppercase">Usuarios con crédito</p>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AUDIT LOG / ACTIVITY */}
                <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-xl font-black tracking-tight">Bitácora de Eventos</CardTitle>
                            </div>
                            <Link to="/admin/audit">
                                <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest uppercase text-slate-400">Ver historial completo</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((log, i) => (
                                    <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                {log.action.includes('approved') ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-indigo-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {log.entityId} • {log.timestamp.toDate().toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-slate-300" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-slate-400 text-sm italic italic">Sin actividad registrada en las últimas 24 horas.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SIDEBAR / SYTEM HEALTH */}
                <div className="space-y-6">
                    <Card className="border-slate-200/60 shadow-sm rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight">Estado del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-emerald-700">Firestore</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600">ONLINE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase text-indigo-700">Security Rules</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600">SECURE [v2]</span>
                            </div>

                            <hr className="border-slate-100 my-2" />

                            <div className="space-y-1">
                                <Link to="/admin/settings">
                                    <Button variant="outline" className="w-full justify-between rounded-xl group hover:border-indigo-200">
                                        <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">Abrir Ajustes Globales</span>
                                        <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-400" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                        <div className="relative z-10">
                            <h3 className="font-black text-xl leading-tight">Mantenimiento<br />Proactivo</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-2 mb-4">Ejecutar limpieza de logs</p>
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest">Ejecutar Ahora</Button>
                        </div>
                        <ShieldAlert className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
