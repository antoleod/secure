import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchKyc, saveKycDecision, saveKycDocument, updateProfile, requestManualReview, uploadFile, sanitizeFileName } from '@/lib/firestoreClient';
import { useI18n } from '@/contexts/I18nContext';
import {
  Loader2,
  CheckCircle,
  User,
  MapPin,
  Save,
  ShieldCheck,
  Fingerprint,
  Info,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { IDUpload } from '@/components/IDUpload';
import { evaluateKyc, mockExtractFromFile } from '@/lib/kycEngine';

export default function CustomerIdentity() {
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    addressCityPostal: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [docForm, setDocForm] = useState({ documentNumber: '', nationalNumber: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfileForm({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        dob: userData.dob || '',
        addressCityPostal: userData.addressCityPostal || '',
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
      if (!docFile) throw new Error('Document required');
      setUploading(true);
      try {
        const ext = docFile.name.split('.').pop() || 'bin';
        const path = `users/${user.uid}/kyc/${Date.now()}-${sanitizeFileName(docFile.name || `id.${ext}`)}`;
        const stored = await uploadFile(path, docFile);
        if (!stored) throw new Error('Upload failed');

        const formData = {
          fullName: profileForm.fullName,
          dob: profileForm.dob,
          documentNumber: docForm.documentNumber,
          nationalNumber: docForm.nationalNumber,
          email: userData?.email || '',
          locale: 'en',
        };

        await saveKycDocument(user.uid, { path: stored, type: docFile.type }, formData);
        const extracted = mockExtractFromFile(docFile.name, formData);
        const decision = evaluateKyc(formData, extracted, (kyc?.verification?.attempts?.auto || 0) + 1);
        await saveKycDecision(user.uid, decision, formData.locale);
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.uid] });
      setDocFile(null);
      setSelfieFile(null);
    },
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(user.uid, profileForm);
      setProfileMsg({ type: 'success', text: t('identity.personal.success') });
    } catch {
      setProfileMsg({ type: 'error', text: t('identity.personal.error') });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleManualOverride = async () => {
    if (!user) return;
    await requestManualReview(user.uid, kyc || null);
    queryClient.invalidateQueries({ queryKey: ['kyc', user?.uid] });
  };

  if (kycLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="h-[500px] rounded-[3rem]" />
        <Skeleton className="h-[500px] rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 font-sans animate-in fade-in duration-1000">
      <div className="text-left space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Fingerprint className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('identity.center.label')}</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">{t('identity.center.title')}</h1>
        <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">{t('identity.center.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight leading-none">{t('identity.personal.title')}</CardTitle>
                  <CardDescription>{t('identity.personal.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <AnimatePresence>
                  {profileMsg && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center ${
                        profileMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {profileMsg.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.fullName')}</Label>
                    <div className="relative group">
                      <Input
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-blue-500 transition-all"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder={t('field.fullName')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.phone')}</Label>
                      <Input
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+32 ..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.dob')}</Label>
                      <Input
                        type="date"
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.address')}</Label>
                    <div className="relative">
                      <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input
                        className="h-14 pl-5 pr-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={profileForm.addressCityPostal}
                        onChange={(e) => setProfileForm((p) => ({ ...p, addressCityPostal: e.target.value }))}
                        placeholder={t('field.address')}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 opacity-50">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.email')}</Label>
                    <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" value={userData?.email || ''} readOnly />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-slate-200 mt-4 text-sm font-black uppercase tracking-widest"
                  disabled={profileSaving}
                >
                  {profileSaving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                  {t('identity.personal.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-none shadow-2xl shadow-slate-100 rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight leading-none">{t('identity.kyc.title')}</CardTitle>
                  <CardDescription>{t('identity.kyc.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              {kyc?.verification?.status === 'verified' ? (
                <div className="py-12 flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl shadow-emerald-100">
                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-3xl tracking-tighter">{t('identity.kyc.verified.title')}</h3>
                    <p className="text-slate-500 font-medium max-w-xs leading-relaxed">{t('identity.kyc.verified.subtitle')}</p>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/50 text-slate-400 font-black text-[10px] uppercase tracking-widest mt-6">
                    <Info className="h-4 w-4" />
                    {t('identity.kyc.status.verified')}
                  </div>
                </div>
              ) : kyc?.verification?.status === 'needs_review' || kyc?.verification?.status === 'manual_review_requested' ? (
                <div className="py-12 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">{t('identity.kyc.status.needsReview')}</h3>
                  <p className="text-slate-500 text-sm">{t('identity.kyc.review.requested')}</p>
                </div>
              ) : kyc?.status === 'pending' ? (
                <div className="py-20 flex flex-col items-center text-center gap-6 animate-pulse">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight">{t('identity.kyc.pending.title')}</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{t('identity.kyc.pending.subtitle')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); kycMutation.mutate(); }} className="space-y-8">
                  {kyc?.verification?.status === 'fail' && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center space-y-2">
                      <p className="text-xs font-black uppercase text-red-600 tracking-widest">{t('identity.kyc.status.fail')}</p>
                      <p className="text-sm text-red-800 font-bold italic">{kyc?.verification?.reasons?.join(', ') || t('identity.kyc.review.notice')}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.fullName')}</Label>
                      <Input
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.dob')}</Label>
                      <Input
                        type="date"
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('kyc.id.national')}</Label>
                      <Input
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={docForm.nationalNumber}
                        onChange={(e) => setDocForm((p) => ({ ...p, nationalNumber: e.target.value }))}
                        placeholder="BE..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('kyc.id.passport')}</Label>
                      <Input
                        className="h-14 pl-5 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                        value={docForm.documentNumber}
                        onChange={(e) => setDocForm((p) => ({ ...p, documentNumber: e.target.value }))}
                        placeholder="XX1234567"
                      />
                    </div>
                  </div>

                  <IDUpload label={t('identity.kyc.document.title')} onFileSelected={setDocFile} t={t} />

                  <div
                    className={`relative h-28 rounded-3xl border-2 border-dashed transition-all flex items-center justify-center gap-4 cursor-pointer group ${
                      selfieFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover-border-indigo-400 hover:bg-indigo-50/50'
                    }`}
                    onClick={() => document.getElementById('selfie-file')?.click()}
                  >
                    <Upload className={`h-6 w-6 ${selfieFile ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{t('identity.kyc.selfie')}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{selfieFile ? selfieFile.name : t('identity.kyc.document.subtitle')}</p>
                    </div>
                    <input id="selfie-file" type="file" accept="image/*" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                  </div>

                  <Button
                    type="button"
                    onClick={() => kycMutation.mutate()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 text-sm font-black uppercase tracking-widest"
                    disabled={uploading || kycMutation.isPending || !docFile || !profileForm.fullName || !profileForm.dob}
                  >
                    {uploading || kycMutation.isPending ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="mr-3 h-5 w-5" />}
                    {t('identity.kyc.submit')}
                  </Button>

                  {kyc?.verification?.status === 'fail' && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-700">{t('identity.kyc.review.notice')}</p>
                      <Button variant="outline" className="w-full h-12" onClick={handleManualOverride}>
                        {t('identity.kyc.review.sendAnyway')}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
