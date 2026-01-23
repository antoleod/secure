import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listCollaterals, registerCollateralWithRefs, uploadFile } from '@/lib/firestoreClient';
import { ENABLE_UPLOADS } from '@/lib/firebase';
import { useI18n } from '@/contexts/I18nContext';
import { Collateral, CollateralType } from '@/types';
import {
    Plus,
    Smartphone,
    Watch,
    Car,
    Home,
    Package,
    Camera,
    Loader2,
    Trash2,
    Image as ImageIcon,
    ArrowUpRight,
    ShieldCheck,
    type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

type CollateralForm = Pick<Collateral, 'type' | 'brandModel' | 'serialImei' | 'condition' | 'estimatedValue'>;

export default function CustomerCollateral() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [isAdding, setIsAdding] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState<CollateralForm>({
        type: 'electronics',
        brandModel: '',
        serialImei: '',
        condition: '', // Like "New", "Used", etc.
        estimatedValue: 0,
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: items, isLoading } = useQuery({
        queryKey: ['collaterals', user?.uid],
        queryFn: () => listCollaterals(user!.uid),
        enabled: !!user?.uid,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            setErrorMsg(null);
            if (photos.length === 0 && ENABLE_UPLOADS) {
                setErrorMsg('Agrega al menos 1 foto para poder continuar.');
                return;
            }
            setLoading(true);
            try {
                const photosRefs: string[] = [];

                if (ENABLE_UPLOADS && photos.length > 0) {
                    const timestamp = Date.now();
                    const uploads = photos.map((photo, idx) =>
                        uploadFile(`collaterals/${user.uid}/${timestamp}-${idx}-${photo.name}`, photo)
                    );
                    const uploaded = await Promise.all(uploads);
                    uploaded.filter(Boolean).forEach((url) => photosRefs.push(url as string));
                }

                const newCollateral: Omit<Collateral, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'updatedAt'> = {
                    ...form,
                    photosRefs,
                    estimatedValue: form.estimatedValue * 100, // Convert to cents
                    checklist: { functional: true, screenIntact: true, noWaterDamage: true },
                    declarations: { isOwner: true, noLiens: true }
                };

                await registerCollateralWithRefs(user.uid, newCollateral);
            } catch (err) {
                console.error(err);
                setErrorMsg('No pudimos guardar la prenda. Verifica tu conexión y los permisos de almacenamiento.');
            } finally {
                setLoading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collaterals', user?.uid] });
            setIsAdding(false);
            setForm({ type: 'electronics', brandModel: '', serialImei: '', condition: '', estimatedValue: 0 });
            setPhotos([]);
        },
    });

    const categories: Array<{
        id: CollateralType;
        label: string;
        icon: LucideIcon;
    }> = useMemo(() => ([
        { id: 'electronics', label: t('collateral.type.electronics'), icon: Smartphone },
        { id: 'jewelry', label: t('collateral.type.jewelry'), icon: Watch },
        { id: 'vehicle', label: t('collateral.type.vehicle'), icon: Car },
        { id: 'property', label: t('collateral.type.property'), icon: Home },
        { id: 'other', label: t('collateral.type.other'), icon: Package },
    ]), [t]);

    if (isLoading) return (
        <div className="space-y-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <Package className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('collateral.manage.label')}</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{t('collateral.manage.title')}</h1>
                    <p className="text-slate-500 mt-4 text-lg max-w-md">{t('collateral.manage.subtitle')}</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="bg-[#0f3d5c] hover:bg-[#0d3049] text-white h-16 px-8 rounded-[1.5rem] shadow-2xl shadow-emerald-200 text-sm font-black uppercase tracking-widest transition-all active:scale-95">
                        <Plus className="mr-2 h-5 w-5" />
                        {t('collateral.add.cta')}
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[3rem] shadow-2xl shadow-slate-100 overflow-hidden border border-slate-50"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Form side */}
                            <div className="p-10 md:p-16 border-r border-slate-100">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t('collateral.form.title')}</h2>
                                <p className="text-slate-400 font-medium mb-10">{t('collateral.form.subtitle')}</p>

                                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
                                    {(!ENABLE_UPLOADS) && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-semibold px-4 py-3">
                                            Subida de fotos deshabilitada. Activa <code className="font-mono text-xs">VITE_ENABLE_UPLOADS=true</code> y configura Firebase Storage para adjuntar imágenes.
                                        </div>
                                    )}
                                    {errorMsg && (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold px-4 py-3">
                                            {errorMsg}
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('collateral.form.category')}</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, type: cat.id })}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${form.type === cat.id ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <cat.icon className="h-6 w-6" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('collateral.form.brandModel')}</Label>
                                            <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" placeholder="Ej: MacBook Pro M3 14'" value={form.brandModel} onChange={e => setForm({ ...form, brandModel: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('collateral.form.serial')}</Label>
                                                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" placeholder="IMEI / Serial Number" value={form.serialImei} onChange={e => setForm({ ...form, serialImei: e.target.value })} />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('collateral.form.condition')}</Label>
                                                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" placeholder="Ej: Como nuevo" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('collateral.form.estimatedValue')}</Label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">€</span>
                                                <Input type="number" className="h-14 pl-10 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-xl" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" type="button" onClick={() => setIsAdding(false)} className="flex-1 h-14 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                        <Button className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100" disabled={loading || mutation.isPending}>
                                            {loading || mutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                            {t('collateral.form.submit')}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* Info/Media side */}
                            <div className="bg-slate-50 p-10 md:p-16">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">{t('collateral.form.photos')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {photos.map((p, i) => (
                                        <div key={i} className="aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden relative group">
                                            <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="Preview" />
                                            <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {photos.length < 6 && (
                                        <label className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 group transition-all">
                                            <Camera className="h-8 w-8 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:scale-110" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('collateral.form.addPhoto')}</span>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={e => e.target.files && setPhotos([...photos, ...Array.from(e.target.files)])} />
                                        </label>
                                    )}
                                </div>
                                <div className="mt-12 p-6 bg-[#0f3d5c] rounded-[2rem] text-white">
                                    <ShieldCheck className="h-8 w-8 mb-4" />
                                    <h4 className="font-black text-lg leading-tight mb-2">Protocolo de Custodia Secure</h4>
                                    <p className="text-xs text-emerald-100 font-medium leading-relaxed">Sus pertenencias se almacenan en bóvedas de alta seguridad con control climático y vigilancia 24/7. Están 100% aseguradas contra todo riesgo.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items?.length === 0 ? (
                            <div className="col-span-full py-24 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300">
                                    <Package className="h-10 w-10" />
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('collateral.list.empty.title')}</h3>
                                    <p className="text-slate-400 mt-2 font-medium">{t('collateral.list.empty.subtitle')}</p>
                                </div>
                                <Button onClick={() => setIsAdding(true)} variant="link" className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">{t('collateral.add.cta')}</Button>
                            </div>
                        ) : (
                            items?.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={item.id}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                        {item.photosRefs?.[0] ? (
                                            <img src={item.photosRefs[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.brandModel} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${item.status === 'approved' ? 'bg-emerald-500/90 text-white' :
                                                item.status === 'rejected' ? 'bg-red-500/90 text-white' : 'bg-white/90 text-slate-900'
                                                }`}>
                                                {t(`common.status.${item.status}`)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                            {categories.find(c => c.id === item.type)?.icon && React.createElement(categories.find(c => c.id === item.type)!.icon, { className: "h-3 w-3" })}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t(`collateral.type.${item.type}`)}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{item.brandModel}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{item.serialImei}</p>

                                        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('collateral.status.evaluating')}</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tighter italic">{(item.estimatedValue / 100).toLocaleString('es-ES')}€</p>
                                            </div>
                                            <Link to="/app/new-loan">
                                                <Button size="icon" className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-[#0f3d5c] hover:shadow-xl hover:shadow-emerald-200 transition-all duration-500">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
