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
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                // Upload photos
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
                    estimatedValue: form.estimatedValue * 100, // convert to cents
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

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Prendas</h1>
                    <p className="text-slate-500">Registra y gestiona los artículos que deseas empeñar.</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-2xl px-6">
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar Nueva Prenda
                    </Button>
                )}
            </div>

            {isAdding ? (
                <Card className="border-slate-200/60 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                    <CardHeader>
                        <CardTitle>Nueva Prenda para Empeño</CardTitle>
                        <CardDescription>Completa los detalles del artículo para que podamos evaluarlo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tipo de Artículo</Label>
                                    <select
                                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as CollateralType })}
                                    >
                                        {COLLATERAL_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Marca y Modelo</Label>
                                    <Input
                                        className="rounded-xl border-slate-200"
                                        placeholder="Ej: iPhone 15 Pro, Rolex Submariner..."
                                        value={form.brandModel}
                                        onChange={(e) => setForm({ ...form, brandModel: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Nº Serie / IMEI (Opcional)</Label>
                                    <Input
                                        className="rounded-xl border-slate-200"
                                        placeholder="Para mayor seguridad"
                                        value={form.serialImei}
                                        onChange={(e) => setForm({ ...form, serialImei: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Estado del Artículo</Label>
                                    <select
                                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                    >
                                        <option value="new">Nuevo / Sellado</option>
                                        <option value="like_new">Como Nuevo</option>
                                        <option value="good">Buen Estado (Uso normal)</option>
                                        <option value="fair">Aceptable (Marcas de uso)</option>
                                        <option value="poor">Desgastado</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Valor Estimado (€)</Label>
                                    <Input
                                        type="number"
                                        className="rounded-xl border-slate-200"
                                        placeholder="¿Cuánto crees que vale?"
                                        value={form.estimatedValue || ''}
                                        onChange={(e) => setForm({ ...form, estimatedValue: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Fotos del Artículo</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {photos.map((p, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                                            <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="Preview" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all"
                                        onClick={() => document.getElementById('photo-input')?.click()}
                                    >
                                        <Camera className="h-6 w-6 mb-1" />
                                        <span className="text-[10px] font-bold">Añadir</span>
                                    </button>
                                    <input
                                        id="photo-input"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files || [])])}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Mínimo 2-3 fotos para una evaluación más rápida (frente, atrás, encendido).</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl" disabled={uploading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-slate-900 rounded-xl shadow-xl shadow-slate-200" disabled={uploading || mutation.isPending || photos.length === 0}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Subiendo fotos...
                                        </>
                                    ) : (
                                        'Registrar Prenda'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items?.length === 0 ? (
                        <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center text-center px-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">No tienes prendas registradas</h3>
                            <p className="text-slate-400 text-sm max-w-[300px] mt-1">Añade tu primera prenda para poder solicitar un préstamo inmediato.</p>
                            <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-6 rounded-xl">
                                Empezar ahora
                            </Button>
                        </div>
                    ) : (
                        items?.map((item) => (
                            <Card key={item.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group">
                                <div className="h-48 bg-slate-100 relative overflow-hidden">
                                    {item.photosRefs?.[0] ? (
                                        <img src={item.photosRefs[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.brandModel} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-200 text-slate-700'
                                        }`}>
                                        {item.status === 'pending' ? 'Bajo Revisión' : item.status.toUpperCase()}
                                    </div>
                                </div>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 truncate">{item.brandModel}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                {COLLATERAL_TYPES.find(t => t.value === item.type)?.label}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400">VALOR ESTIMADO</p>
                                            <p className="font-black text-blue-600 text-lg">{(item.estimatedValue / 100).toFixed(2)}€</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                                        <Button variant="outline" className="flex-1 rounded-xl text-xs h-9" disabled={item.status !== 'approved'}>
                                            Pedir Préstamo
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
