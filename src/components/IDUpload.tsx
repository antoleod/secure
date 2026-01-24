import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload as UploadIcon, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

type Props = {
  label: string;
  maxSizeMb?: number;
  accept?: string;
  onFileSelected: (file: File | null) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const DEFAULT_MAX_MB = 8;

export function IDUpload({ label, maxSizeMb = DEFAULT_MAX_MB, accept = 'image/*,application/pdf', onFileSelected, t }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: 'image' | 'pdf'; url: string; name: string } | null>(null);

  const inputId = useMemo(() => `id-upload-${Math.random().toString(36).slice(2)}`, []);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onFileSelected(null);
      return;
    }
    const allowed = ['image/', 'application/pdf'];
    const isAllowed = allowed.some((type) => file.type.startsWith(type));
    if (!isAllowed) {
      setError(t('identity.kyc.document.error.type'));
      return;
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(t('identity.kyc.document.error.size', { size: maxSizeMb }));
      return;
    }
    setError(null);
    if (file.type.startsWith('application/pdf')) {
      setPreview({ type: 'pdf', url: '', name: file.name });
    } else {
      setPreview({ type: 'image', url: URL.createObjectURL(file), name: file.name });
    }
    onFileSelected(file);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
        {label}
      </label>
      <div className="flex gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-w-[180px] h-12 justify-center gap-2 rounded-xl"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <Camera className="h-4 w-4" />
          {t('identity.kyc.document.takePhoto')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 min-w-[180px] h-12 justify-center gap-2 rounded-xl"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <UploadIcon className="h-4 w-4" />
          {t('identity.kyc.document.upload')}
        </Button>
        <input
          id={inputId}
          type="file"
          accept={accept}
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </div>
      <p className="text-xs text-slate-400">{t('identity.kyc.document.subtitle')} — {t('identity.kyc.document.maxSize', { size: maxSizeMb })}</p>
      {preview && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
          {preview.type === 'pdf' ? <FileText className="h-5 w-5 text-slate-500" /> : <ImageIcon className="h-5 w-5 text-slate-500" />}
          <span className="text-sm font-bold text-slate-700 truncate">{preview.name}</span>
          {preview.type === 'image' && <img src={preview.url} alt={preview.name} className="h-12 w-16 object-cover rounded-lg ml-auto" />}
          {preview.type === 'pdf' && <span className="text-xs text-slate-500 ml-auto">{t('identity.kyc.document.previewPdf')}</span>}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl text-sm font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
