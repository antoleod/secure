import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Loan } from '@/types';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            // Update local state
            setLoans(prev => prev.map(l => l.id === loanId ? { ...l, surrenderRequested: true } : l));
        } catch (error) {
            console.error("Error requesting surrender:", error);
            alert("Error al procesar la solicitud.");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mis Préstamos</h1>

            {loans.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No tienes préstamos activos.
                </div>
            ) : (
                <div className="grid gap-6">
                    {loans.map(loan => (
                        <div key={loan.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">Préstamo #{loan.id?.slice(-4)}</h3>
                                        <span className={`text-xs px-2 py-1 rounded bg-gray-100 uppercase`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Saldo pendiente: <span className="font-bold text-red-600">{(loan.outstandingCents / 100).toFixed(2)} €</span></p>
                                </div>

                                {loan.status === 'active' && !loan.surrenderRequested && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => loan.id && handleSurrender(loan.id)}
                                        disabled={!!processing}
                                    >
                                        {processing === loan.id ? <Loader2 className="animate-spin h-3 w-3" /> : 'Entregar Prenda (No Pagar Más)'}
                                    </Button>
                                )}

                                {loan.surrenderRequested && (
                                    <div className="flex items-center text-orange-600 text-sm font-medium">
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Solicitud de entrega enviada
                                    </div>
                                )}

                                {loan.status === 'sold' && (
                                    <div className="flex items-center text-gray-500 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Prenda vendida / Deuda saldada
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
