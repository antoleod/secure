import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import {
    Search,
    Filter,
    ShoppingBag,
    Zap,
    Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerStore() {
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const products = [
        { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: 849, originalPrice: 1329, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop', category: 'phones' },
        { id: 2, name: 'MacBook Pro M3', brand: 'Apple', price: 1450, originalPrice: 1999, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop', category: 'laptops' },
        { id: 3, name: 'Sony A7 IV', brand: 'Sony', price: 1200, originalPrice: 2400, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', category: 'cameras' },
        { id: 4, name: 'iPad Air M2', brand: 'Apple', price: 549, originalPrice: 799, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop', category: 'tablets' },
        { id: 5, name: 'Rolex Datejust', brand: 'Rolex', price: 6500, originalPrice: 9800, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop', category: 'jewelry' },
        { id: 6, name: 'PlayStation 5 Slim', brand: 'Sony', price: 349, originalPrice: 549, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop', category: 'gaming' },
    ];

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'phones', label: 'Móviles' },
        { id: 'laptops', label: 'Laptops' },
        { id: 'jewelry', label: 'Lujo' },
    ];

    const filtered = products.filter(p =>
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())) &&
        (category === 'all' || p.category === category)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            {/* Header Hero */}
            <div className="relative rounded-[4rem] bg-gradient-to-br from-[#0f3d5c] to-emerald-500 p-12 md:p-20 overflow-hidden text-white shadow-2xl shadow-emerald-200/20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-950/20 skew-x-12 translate-x-20" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-2xl"
                >
                    <div className="flex items-center gap-2 mb-6 font-black uppercase tracking-[0.4em] text-xs text-emerald-100">
                        <Zap className="h-4 w-4 fill-emerald-200 text-emerald-200" />
                        <span>{t('store.opportunity')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                        {t('store.marketplace.title')}
                    </h1>
                    <p className="text-emerald-50 text-lg md:text-xl font-medium max-w-lg leading-relaxed mb-10">
                        {t('store.marketplace.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-200" />
                            <Input
                                className="h-16 pl-12 bg-white/10 border-white/20 text-white placeholder:text-emerald-100 rounded-2xl focus:ring-emerald-200/50 transition-all font-bold"
                                placeholder={t('store.search.placeholder')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Floating elements */}
                <div className="absolute bottom-10 right-10 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl mb-4">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <p className="text-3xl font-black tracking-tighter italic">Secure Store</p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setCategory(c.id)}
                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${category === c.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" className="rounded-full text-slate-400 gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="h-4 w-4" />
                        Filtrar
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filtered.length > 0 ? filtered.map((item, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={item.id}
                                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 hover:-translate-y-2"
                            >
                                <div className="aspect-[3/4] p-4 relative">
                                    <div className="absolute top-8 left-8 z-10">
                                        <span className="bg-rose-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-lg shadow-rose-500/30">-{Math.round((1 - item.price / item.originalPrice) * 100)}% DCTO</span>
                                    </div>
                                    <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden">
                                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.name} />
                                    </div>
                                    <div className="absolute bottom-8 right-8">
                                        <div className="w-14 h-14 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                                            <ShoppingBag className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="p-10 pt-0">
                                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                        <Star className="h-3 w-3 fill-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.brand}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-6 group-hover:text-emerald-600 transition-colors">{item.name}</h3>

                                    <div className="flex items-end justify-between border-t border-slate-50 pt-8 mt-2">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('store.liquidatedPrice')}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter italic font-mono">{item.price}€</span>
                                                <span className="text-sm font-bold text-slate-300 line-through italic">{item.originalPrice}€</span>
                                            </div>
                                        </div>
                                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200">
                                            {t('store.buy')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-40 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <Search className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t('store.empty.title')}</h3>
                                <p className="text-slate-400 font-medium">{t('store.empty.subtitle')}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
