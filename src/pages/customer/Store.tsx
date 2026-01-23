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
    Sparkles,
    ShoppingCart,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

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

    return (
        <div className="space-y-12 pb-32 font-sans overflow-x-hidden animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-blue-600 mb-2"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Oryxen Marketplace</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Ventas por Tasación</h1>
                    <p className="text-slate-500 mt-4 text-lg leading-relaxed max-w-xl">
                        Adquiere activos de lujo y tecnología punta procedentes de liquidaciones. Calidad certificada y precios por debajo del mercado.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative w-full md:w-96 group"
                >
                    <div className="absolute inset-0 bg-blue-100/5 group-hover:bg-blue-100/20 blur-xl transition-all duration-700 rounded-full" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                    <Input
                        placeholder="Buscar por marca o modelo..."
                        className="pl-12 h-14 rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/50 relative z-10 font-bold focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </motion.div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
                {CATEGORIES.map((cat, idx) => (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border ${selectedCategory === cat.value
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-300'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                            }`}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <div key="loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Info className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Sin resultados</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mt-2 text-base leading-relaxed">
                            No hemos encontrado artículos que coincidan con tu búsqueda. Intenta con otra categoría o término.
                        </p>
                        <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} variant="link" className="mt-6 text-blue-600 font-black uppercase tracking-widest text-xs">Mostrar catálogo completo</Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10"
                    >
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                key={item.id}
                                className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden h-full"
                            >
                                <div className="aspect-square relative overflow-hidden bg-slate-50">
                                    {item.photosRefs && item.photosRefs.length > 0 ? (
                                        <img
                                            src={item.photosRefs[0]}
                                            alt={item.publicTitle || item.brandModel}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-30">
                                            <Package className="h-16 w-16" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Multimedia pendiente</span>
                                        </div>
                                    )}

                                    {/* Category Badge on Image */}
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/80 backdrop-blur-md text-slate-900 text-[9px] font-black px-4 py-2 rounded-full shadow-lg tracking-widest uppercase ring-1 ring-slate-900/5">
                                            {CATEGORIES.find(c => c.value === item.type)?.label || 'Artículo'}
                                        </span>
                                    </div>

                                    {/* Quick Link Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl ml-auto">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-blue-600 uppercase mb-3">
                                            <Sparkles className="h-3 w-3" />
                                            <span>Oportunidad Exclusiva</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                                            {item.publicTitle || item.brandModel}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed h-10">
                                            {item.publicDescription || 'Consultar detalles técnicos del artículo con un agente.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 leading-none">Precio Liquidado</span>
                                            <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                {item.salePriceCents ? (item.salePriceCents / 100).toLocaleString('es-ES') : '??'}€
                                            </span>
                                        </div>
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button className="bg-slate-900 hover:bg-black rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-100">
                                                Comprar
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
