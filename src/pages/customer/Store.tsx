import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Collateral, CollateralType } from '@/types';
import {
    Loader2,
    ShoppingBag,
    Search,
    Filter,
    Tag,
    Smartphone,
    Watch,
    Car,
    Home,
    Package,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES: { value: CollateralType | 'all'; label: string; icon: any }[] = [
    { value: 'all', label: 'Todo', icon: Sparkles },
    { value: 'electronics', label: 'Electrónica', icon: Smartphone },
    { value: 'jewelry', label: 'Joyas', icon: Watch },
    { value: 'vehicle', label: 'Vehículos', icon: Car },
    { value: 'property', label: 'Propiedades', icon: Home },
    { value: 'other', label: 'Otros', icon: Package },
];

export default function CustomerStore() {
    const [items, setItems] = useState<Collateral[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CollateralType | 'all'>('all');

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

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = (item.publicTitle || item.brandModel || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchTerm, selectedCategory]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            <p className="font-bold uppercase tracking-widest text-xs">Cargando portafolio...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-32 font-sans animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Marketplace</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tienda de Oportunidades</h1>
                    <p className="text-slate-500 mt-2">
                        Artículos de lujo y tecnología procedentes de liquidaciones. Calidad garantizada por nuestro equipo de expertos.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar artículos..."
                        className="pl-10 rounded-2xl border-slate-200 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories scrollable in mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.value
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                            }`}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Filter className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No encontramos resultados</h3>
                    <p className="text-slate-400 max-w-xs mx-auto mt-1 text-sm">Prueba ajustando los filtros o borrando el término de búsqueda.</p>
                    <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} variant="link" className="mt-2 text-blue-600 font-bold">Ver todo</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden h-full">
                            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                {item.photosRefs && item.photosRefs.length > 0 ? (
                                    <img
                                        src={item.photosRefs[0]}
                                        alt={item.publicTitle || item.brandModel}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                        <Package className="h-10 w-10 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Sin Imagen</span>
                                    </div>
                                )}

                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase ring-1 ring-slate-900/5">
                                        {CATEGORIES.find(c => c.value === item.type)?.label || 'Artículo'}
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Liquidación Oro</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {item.publicTitle || item.brandModel}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                        {item.publicDescription || item.condition}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Oferta</span>
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {item.salePriceCents ? (item.salePriceCents / 100).toLocaleString('es-ES') : '??'}€
                                        </span>
                                    </div>
                                    <Button className="bg-slate-900 hover:bg-black rounded-xl px-5 h-11 text-sm font-bold shadow-lg shadow-slate-200">
                                        Comprar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
