import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchKyc, submitKyc, uploadFile, updateProfile } from '@/lib/firestoreClient';
import { Loader2, Upload, CheckCircle, AlertTriangle, User, Phone, Mail, Calendar, MapPin, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CustomerIdentity() {
    const { user, userData } = useAuth();
    const queryClient = useQueryClient();

    // Profile State
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phone: '',
        dob: '',
        addressCityPostal: ''
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // KYC State
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [kycError, setKycError] = useState<string | null>(null);

    useEffect(() => {
        if (userData) {
            setProfileForm({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                dob: userData.dob || '',
                addressCityPostal: userData.addressCityPostal || ''
            });
        }
    }, [userData]);

    const { data: kyc, isLoading: kycLoading } = useQuery({
        queryKey: ['kyc', user?.uid],
        queryFn: () => fetchKyc(user!.uid),
        enabled: !!user?.uid,
    });

    const kycMutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            if (!frontFile || !backFile) throw new Error("ID Front and Back are required");

            setUploading(true);
            try {
                const frontRef = await uploadFile(`users/${user.uid}/kyc/front`, frontFile);
                const backRef = await uploadFile(`users/${user.uid}/kyc/back`, backFile);
                const selfieRef = selfieFile ? await uploadFile(`users/${user.uid}/kyc/selfie`, selfieFile) : undefined;

                if (!frontRef || !backRef) throw new Error("Upload failed");

                await submitKyc(user.uid, {
                    frontIdRef: frontRef,
                    backIdRef: backRef,
                    selfieRef: selfieRef || undefined
                });
            } finally {
                setUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kyc', user?.uid] });
            setFrontFile(null);
            setBackFile(null);
            setSelfieFile(null);
            setKycError(null);
        },
        onError: (err) => {
            console.error(err);
            setKycError("Failed to submit documents. Please try again.");
        }
    });

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            await updateProfile(user.uid, profileForm);
            setProfileMsg({ type: 'success', text: 'Perfil actualizado correctamente.' });
            // Note: AuthContext doesn't automatically sync Firestore changes, 
            // but in many apps this triggers a reload or the user stays on page.
            // Ideally we'd have a way to refresh AuthContext or use useQuery for Profile too.
        } catch (err) {
            console.error(err);
            setProfileMsg({ type: 'error', text: 'Error al actualizar el perfil.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleKycSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setKycError(null);
        kycMutation.mutate();
    }

    if (kycLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
                <p className="text-slate-500">Gestiona tus datos personales y verifica tu identidad.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                {/* PERSONAL INFORMATION CARD */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden h-fit">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <CardTitle>Información Personal</CardTitle>
                        </div>
                        <CardDescription>Actualiza tus datos de contacto y residencia.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            {profileMsg && (
                                <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {profileMsg.text}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Nombre Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        className="pl-10"
                                        value={profileForm.fullName}
                                        onChange={(e) => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-10"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+32 ..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Fecha de Nacimiento</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            className="pl-10"
                                            value={profileForm.dob}
                                            onChange={(e) => setProfileForm(p => ({ ...p, dob: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Correo Electrónico</Label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input className="pl-10 bg-slate-50" value={userData?.email || ''} readOnly />
                                </div>
                                <p className="text-[10px] text-slate-400 italic">El correo no puede ser modificado por seguridad.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Dirección / Ciudad / CP</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        className="pl-10"
                                        value={profileForm.addressCityPostal}
                                        onChange={(e) => setProfileForm(p => ({ ...p, addressCityPostal: e.target.value }))}
                                        placeholder="Escribe tu dirección completa"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" disabled={profileSaving}>
                                {profileSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Guardar Cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* IDENTITY VERIFICATION CARD */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden h-fit">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Verificación de Identidad</CardTitle>
                        </div>
                        <CardDescription>Sube tus documentos para validar tu cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {kyc?.status === 'verified' && (
                            <div className="bg-green-50/50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 text-lg">¡Cuenta Verificada!</h3>
                                    <p className="text-sm text-green-700">Tu identidad ha sido confirmada con éxito. Ya puedes solicitar préstamos de mayor monto.</p>
                                </div>
                            </div>
                        )}

                        {kyc?.status === 'pending' && (
                            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-orange-900 text-lg">En Revisión</h3>
                                    <p className="text-sm text-orange-700">Estamos verificando tus documentos. Esto suele tomar menos de 24h.</p>
                                </div>
                            </div>
                        )}

                        {kyc?.status === 'rejected' && (
                            <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3 mb-6 font-sans">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 text-lg">Documentación Rechazada</h3>
                                    <p className="text-sm text-red-700 font-medium italic">"{kyc.rejectionReason || "Por favor, vuelve a subir fotos claras de tu ID."}"</p>
                                </div>
                            </div>
                        )}

                        {(!kyc || kyc.status === 'rejected' || kyc.status === 'pending') && (
                            <form onSubmit={handleKycSubmit} className="space-y-6">
                                {kycError && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{kycError}</p>}

                                <div className="space-y-4">
                                    <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group" onClick={() => document.getElementById('front-file')?.click()}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">ID Frontal</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{frontFile ? frontFile.name : "Click para subir foto frontal"}</p>
                                            </div>
                                            {frontFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <input id="front-file" type="file" accept="image/*" className="hidden" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
                                    </div>

                                    <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group" onClick={() => document.getElementById('back-file')?.click()}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">ID Posterior</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{backFile ? backFile.name : "Click para subir foto trasera"}</p>
                                            </div>
                                            {backFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <input id="back-file" type="file" accept="image/*" className="hidden" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
                                    </div>

                                    <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group" onClick={() => document.getElementById('selfie-file')?.click()}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">Selfie (Opcional)</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{selfieFile ? selfieFile.name : "Click para subir selfie con ID"}</p>
                                            </div>
                                            {selfieFile && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <input id="selfie-file" type="file" accept="image/*" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-slate-900 shadow-xl shadow-slate-200" disabled={uploading || kycMutation.isPending || !frontFile || !backFile}>
                                    {uploading || kycMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Subir Validación
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
