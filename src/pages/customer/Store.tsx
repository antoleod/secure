import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Collateral } from '@/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerStore() {
    const [items, setItems] = useState<Collateral[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadItems() {
            try {
                const q = query(collection(db, 'collaterals'), where('isForSale', '==', true));
                const querySnapshot = await getDocs(q);
                const data: Collateral[] = [];
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() } as Collateral);
                });
                setItems(data);
            } catch (error) {
                console.error('Error loading store items:', error);
            } finally {
                setLoading(false);
            }
        }
        loadItems();
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tienda de Oportunidades</h1>
                    <p className="text-gray-500">Artículos disponibles por falta de pago o liquidación.</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No hay artículos disponibles en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                            <div className="h-48 bg-gray-200 relative">
                                {item.photosRefs && item.photosRefs.length > 0 ? (
                                    // In a real app we'd fetch the download URL here or use a component that does
                                    // For MVP we just show a placeholder if no URL logic implemented yet or raw path
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Image
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    SALE
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.publicTitle || item.brandModel}</h3>
                                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.publicDescription || item.condition}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-xl font-bold text-blue-600">
                                        {item.salePriceCents ? (item.salePriceCents / 100).toFixed(2) : '??'} €
                                    </span>
                                    <Button size="sm">Comprar</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
