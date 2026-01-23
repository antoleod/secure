import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Loan } from '@/types';
import {
    Loader2,
    AlertTriangle,
    CheckCircle,
    Wallet,
    Calendar,
    ArrowUpRight,
    Info,
    CreditCard,
    ChevronRight,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function CustomerLoans() {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        async function loadLoans() {
            if (!user) return;
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
            <p className="font-bold uppercase tracking-widest text-xs">Sincronizando cuentas...</p>
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Préstamos</h1>
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saldo Pendiente</p>
                        <p className="text-2xl font-black text-blue-600">{(stats.totalDebt / 100).toLocaleString('es-ES')}€</p>
                    </div>
                </div>
            </div>

            {loans.length === 0 ? (
                <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No tienes préstamos activos</h3>
                    <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                        Parece que no tienes créditos vigentes. Registra una prenda para solicitar financiamiento inmediato.
                    </p>
                    <Link to="/app/collateral">
                        <Button className="mt-6 bg-slate-900 hover:bg-black rounded-2xl px-8">
                            Registrar Prenda
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {loans.map(loan => (
                        <Card key={loan.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left Accent */}
                                    <div className={`w-full md:w-2 ${loan.status === 'active' ? 'bg-blue-600' :
                                            loan.status === 'overdue' ? 'bg-red-600' :
                                                'bg-slate-200'
                                        }`} />

                                    <div className="flex-1 p-8">
                                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                                            {/* Info Section */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Préstamo #{loan.id?.slice(-6).toUpperCase()}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${loan.status === 'active' ? 'bg-blue-50 text-blue-600' :
                                                            loan.status === 'closed' ? 'bg-emerald-50 text-emerald-600' :
                                                                'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {loan.status === 'active' ? 'EN VIGOR' : loan.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" /> Inicio
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-700">{loan.startDate.toDate().toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                            <CreditCard className="h-3 w-3" /> Principal
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-700">{(loan.principalCents / 100).toLocaleString('es-ES')}€</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                            <Info className="h-3 w-3" /> Tasa
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-700">{loan.businessDaysOnly ? 'Solo Hábiles' : 'Calendario'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financials / Actions Section */}
                                            <div className="flex flex-col lg:items-end justify-between min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-10">
                                                <div className="text-left lg:text-right mb-4 lg:mb-0">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Saldo a Liquidar</p>
                                                    <p className={`text-4xl font-black tracking-tighter ${loan.status === 'overdue' ? 'text-red-600' : 'text-blue-600'
                                                        }`}>
                                                        {(loan.outstandingCents / 100).toLocaleString('es-ES')}€
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                                    {loan.status === 'active' && !loan.surrenderRequested && (
                                                        <>
                                                            <Link to={`/app/payments?loanId=${loan.id}`} className="flex-1 sm:flex-initial">
                                                                <Button className="w-full bg-slate-900 shadow-lg shadow-slate-200 rounded-xl px-6 h-10 text-xs font-bold">
                                                                    Pagar Cuota
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => loan.id && handleSurrender(loan.id)}
                                                                disabled={!!processing}
                                                                className="rounded-xl px-6 h-10 text-xs font-bold text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50"
                                                            >
                                                                {processing === loan.id ? <Loader2 className="animate-spin h-3 w-3" /> : 'Entregar Prenda'}
                                                            </Button>
                                                        </>
                                                    )}

                                                    {loan.surrenderRequested && (
                                                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            Entrega en proceso
                                                        </div>
                                                    )}

                                                    {loan.status === 'closed' && (
                                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Liquidado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interaction Chevron for Desktop */}
                                    <div className="hidden lg:flex items-center justify-center pr-6 text-slate-100 group-hover:text-slate-300 transition-colors">
                                        <ChevronRight className="h-8 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
