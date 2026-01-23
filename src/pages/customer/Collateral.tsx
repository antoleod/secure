import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listCollaterals, registerCollateralWithRefs, uploadFile } from '@/lib/firestoreClient';
import {
    Plus,
    Smartphone,
    Watch,
    Car,
    Home,
    Package,
    Camera,
    Loader2,
    CheckCircle,
    AlertCircle,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { CollateralType } from '@/types';

const COLLATERAL_TYPES: { value: CollateralType; label: string; icon: any }[] = [
    { value: 'electronics', label: 'Electrónica', icon: Smartphone },
    { value: 'jewelry', label: 'Joyas y Relojes', icon: Watch },
    { value: 'vehicle', label: 'Vehículos', icon: Car },
    { value: 'property', label: 'Propiedades', icon: Home },
    { value: 'other', label: 'Otros', icon: Package },
];

export default function CustomerCollateral() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        type: 'electronics' as CollateralType,
        brandModel: '',
        serialImei: '',
        condition: 'good',
        estimatedValue: 0,
    });
    const [photos, setPhotos] = useState<File[]>([]);

    const { data: items, isLoading } = useQuery({
        queryKey: ['collaterals', user?.uid],
        queryFn: () => listCollaterals(user!.uid),
        enabled: !!user?.uid,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            setUploading(true);
            try {
                const photoRefs: string[] = [];
                for (const photo of photos) {
                    const ref = await uploadFile(`collaterals/${user.uid}/${Date.now()}-${photo.name}`, photo);
                    if (ref) photoRefs.push(ref);
                }

                await registerCollateralWithRefs(user.uid, {
                    type: form.type,
                    brandModel: form.brandModel,
                    serialImei: form.serialImei,
                    condition: form.condition,
                    estimatedValue: form.estimatedValue * 100,
                    photosRefs: photoRefs,
                    checklist: {},
                    declarations: {}
                });
            } finally {
                setUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collaterals', user?.uid] });
            setIsAdding(false);
            setForm({ type: 'electronics', brandModel: '', serialImei: '', condition: 'good', estimatedValue: 0 });
            setPhotos([]);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32 font-sans overflow-x-hidden animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Activos</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Mis Prendas</h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-xl leading-relaxed">
                        Registra los artículos que deseas tasar para obtener liquidez inmediata bajo los mejores términos del mercado.
                    </p>
                </div>
                {!isAdding && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-slate-900 group hover:bg-black text-white shadow-2xl shadow-slate-200 rounded-[2rem] px-10 py-8 h-auto flex items-center gap-4 transition-all duration-500"
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="font-black text-lg">Añadir Activo</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Nuevo Empeño</span>
                            </div>
                        </Button>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                    >
                        <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.08)] bg-white rounded-[3rem] overflow-hidden">
                            <CardHeader className="bg-slate-50/50 px-10 py-10 border-b border-slate-100">
                                <CardTitle className="text-3xl font-black tracking-tight">Registro de Prenda</CardTitle>
                                <CardDescription className="text-base text-slate-500">Completa la ficha técnica para que nuestro equipo realice una tasación inicial.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Categoría de Activo</Label>
                                            <select
                                                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value as CollateralType })}
                                            >
                                                {COLLATERAL_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Marca y Modelo Específico</Label>
                                            <Input
                                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold focus:ring-blue-500"
                                                placeholder="Ej: Rolex GMT Master II"
                                                value={form.brandModel}
                                                onChange={(e) => setForm({ ...form, brandModel: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Identificación (IMEI/SN)</Label>
                                            <Input
                                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold"
                                                placeholder="Nivel de seguridad adicional"
                                                value={form.serialImei}
                                                onChange={(e) => setForm({ ...form, serialImei: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Estado de Conservación</Label>
                                            <select
                                                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={form.condition}
                                                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                            >
                                                <option value="new">💎 Nuevo / Precintado</option>
                                                <option value="like_new">✨ Como Nuevo</option>
                                                <option value="good">👍 Buen Estado (Normal)</option>
                                                <option value="fair">📦 Aceptable (Signos de uso)</option>
                                                <option value="poor">🩹 Desgastado</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Valor Estimado (€)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-black text-xl text-blue-600 pl-10"
                                                    placeholder="0"
                                                    value={form.estimatedValue || ''}
                                                    onChange={(e) => setForm({ ...form, estimatedValue: Number(e.target.value) })}
                                                    required
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Archivo Fotográfico (Mínimo 3)</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                                            {photos.map((p, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-50 group hover:shadow-xl transition-all"
                                                >
                                                    <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(i)}
                                                        className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                            <motion.button
                                                whileHover={{ scale: 1.05, borderColor: '#3b82f6' }}
                                                type="button"
                                                className="aspect-square rounded-[2rem] border-3 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:text-blue-500 group transition-all"
                                                onClick={() => document.getElementById('photo-input')?.click()}
                                            >
                                                <Camera className="h-8 w-8 mb-2 group-hover:rotate-12 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Añadir Foto</span>
                                            </motion.button>
                                            <input
                                                id="photo-input"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files || [])])}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-slate-400" disabled={uploading}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] h-14 shadow-2xl shadow-blue-100 text-base font-black tracking-tight" disabled={uploading || mutation.isPending || photos.length < 1}>
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                                                    Procesando Archivos...
                                                </>
                                            ) : (
                                                'Finalizar Registro de Activo'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {isLoading ? (
                            [1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-[3rem]" />)
                        ) : items?.length === 0 ? (
                            <div className="col-span-full py-32 bg-white border border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center text-center px-10">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Package className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight">Portafolio Vacío</h3>
                                <p className="text-slate-400 text-lg max-w-sm mt-2 leading-relaxed">Añade tu primer activo para que podamos evaluarlo y habilitar tu línea de crédito.</p>
                                <Button onClick={() => setIsAdding(true)} className="mt-10 bg-slate-900 rounded-2xl px-10 h-14">
                                    Empezar a Tasar
                                </Button>
                            </div>
                        ) : (
                            items?.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[3rem] overflow-hidden group h-full flex flex-col">
                                        <div className="h-56 bg-slate-100 relative overflow-hidden">
                                            {item.photosRefs?.[0] ? (
                                                <img src={item.photosRefs[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.brandModel} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                                </div>
                                            )}

                                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md ${item.status === 'approved' ? 'bg-emerald-500/90 text-white' :
                                                    item.status === 'pending' ? 'bg-amber-500/90 text-white' :
                                                        'bg-slate-900/80 text-white'
                                                    }`}>
                                                    {item.status === 'pending' ? 'Evaluando' : item.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{COLLATERAL_TYPES.find(t => t.value === item.type)?.label}</p>
                                                        <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{item.brandModel}</h3>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Valor</p>
                                                        <p className="font-black text-slate-900 text-xl tracking-tight">{(item.estimatedValue / 100).toFixed(0)}€</p>
                                                    </div>
                                                    <div className="w-[1px] h-8 bg-slate-100" />
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estado</p>
                                                        <p className="font-bold text-slate-600 text-sm capitalize">{item.condition.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <Button
                                                    className={`w-full rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all duration-500 ${item.status === 'approved'
                                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700'
                                                        : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                                                        }`}
                                                    disabled={item.status !== 'approved'}
                                                >
                                                    Solicitar Crédito
                                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
