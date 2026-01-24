import { Timestamp } from 'firebase/firestore';
import { KYC, KYCStatus } from '@/types';

export type KycDecision = {
  status: KYCStatus | 'fail';
  score: number;
  reasons: string[];
  extracted: KycExtracted;
  provider: 'mock';
  attempts: { auto: number; manualOverride: boolean };
};

export type KycExtracted = {
  fullName?: string;
  givenNames?: string;
  surname?: string;
  dateOfBirth?: string;
  documentNumber?: string;
  nationalRegisterNumber?: string;
  expiryDate?: string;
  docType?: string;
  mrzPresent?: boolean;
  mrzValid?: boolean;
  confidences?: {
    name?: number;
    dob?: number;
    docNumber?: number;
  };
};

export type KycFormData = NonNullable<KYC['formData']>;

const SCORE_WEIGHTS = { name: 40, dob: 30, doc: 30 };

export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function parseMrz(text: string): KycExtracted {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.includes('<'));
  const candidate = lines.slice(-2);
  if (candidate.length < 2) return { mrzPresent: false, mrzValid: false };
  const joined = candidate.join('');
  const docNumberMatch = joined.match(/[A-Z0-9]{8,12}/);
  const dobCandidates = joined.match(/\d{6}/g) || [];
  const dobValue = dobCandidates.map(toIsoDateFromYYMMDD).find(Boolean);
  const nameParts = candidate[1]?.split('<<') || [];
  const surname = nameParts[0]?.replace(/</g, ' ').trim();
  const given = nameParts[1]?.replace(/</g, ' ').trim();
  return {
    mrzPresent: true,
    mrzValid: !!docNumberMatch,
    documentNumber: docNumberMatch?.[0],
    dateOfBirth: dobValue,
    surname,
    givenNames: given,
    fullName: [given, surname].filter(Boolean).join(' ').trim(),
  };
}

function toIsoDateFromYYMMDD(value: string): string | undefined {
  if (value.length !== 6) return undefined;
  const year = parseInt(value.slice(0, 2), 10);
  const month = value.slice(2, 4);
  const day = value.slice(4, 6);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const fourYear = year >= 50 ? `19${value.slice(0, 2)}` : `20${value.slice(0, 2)}`;
  return `${fourYear}-${month}-${day}`;
}

export function computeScore(form: KycFormData, extracted: KycExtracted) {
  const reasons: string[] = [];
  let score = 0;

  const formName = normalizeName(form.fullName);
  const docName = normalizeName(extracted.fullName || '');
  if (docName && formName && docName === formName) {
    score += SCORE_WEIGHTS.name;
  } else {
    reasons.push('name_mismatch');
    score += Math.floor(SCORE_WEIGHTS.name * 0.3 * (extracted.confidences?.name ?? 0.5));
  }

  if (form.dob && extracted.dateOfBirth) {
    if (form.dob === extracted.dateOfBirth) {
      score += SCORE_WEIGHTS.dob;
    } else {
      reasons.push('dob_mismatch');
    }
  } else {
    reasons.push('dob_missing');
  }

  if (form.documentNumber && extracted.documentNumber) {
    if (normalizeDoc(form.documentNumber) === normalizeDoc(extracted.documentNumber)) {
      score += SCORE_WEIGHTS.doc;
    } else {
      reasons.push('doc_mismatch');
    }
  } else if (form.nationalNumber && extracted.nationalRegisterNumber) {
    if (normalizeDoc(form.nationalNumber) === normalizeDoc(extracted.nationalRegisterNumber)) {
      score += SCORE_WEIGHTS.doc;
    } else {
      reasons.push('national_mismatch');
    }
  } else {
    reasons.push('doc_missing');
  }

  if (extracted.mrzValid) score += 5;
  return { score: Math.min(100, score), reasons };
}

function normalizeDoc(v: string) {
  return v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function decideStatus(score: number, reasons: string[], extracted: KycExtracted): KYCStatus | 'fail' {
  const hasDobMismatch = reasons.includes('dob_mismatch');
  if (hasDobMismatch || score < 60) return 'fail';
  if (score >= 85) return 'verified';
  return 'needs_review';
}

export function evaluateKyc(form: KycFormData, extracted: KycExtracted, attemptsAuto = 1): KycDecision {
  const { score, reasons } = computeScore(form, extracted);
  const status = decideStatus(score, reasons, extracted);
  return {
    status,
    score,
    reasons,
    extracted,
    provider: 'mock',
    attempts: { auto: attemptsAuto, manualOverride: false },
  };
}

export function mockExtractFromFile(fileName: string, form: KycFormData): KycExtracted {
  const lower = fileName.toLowerCase();
  const isMock = typeof globalThis !== 'undefined' && (globalThis as any)?.process?.env?.MOCK_OCR === 'true';
  if (isMock) {
    return {
      fullName: form.fullName,
      dateOfBirth: form.dob,
      documentNumber: form.documentNumber || 'MOCK123456',
      nationalRegisterNumber: form.nationalNumber,
      mrzPresent: true,
      mrzValid: true,
      docType: 'id',
      confidences: { name: 0.9, dob: 0.9, docNumber: 0.9 },
    };
  }

  if (lower.includes('fail')) {
    return {
      fullName: 'UNKNOWN PERSON',
      dateOfBirth: '1990-01-01',
      documentNumber: 'ZZ999999',
      mrzPresent: true,
      mrzValid: false,
      confidences: { name: 0.3, dob: 0.3, docNumber: 0.3 },
    };
  }

  return {
    fullName: form.fullName,
    dateOfBirth: form.dob,
    documentNumber: form.documentNumber || 'ID123456',
    mrzPresent: true,
    mrzValid: true,
    confidences: { name: 0.7, dob: 0.8, docNumber: 0.8 },
  };
}

export function buildVerificationRecord(decision: KycDecision, locale: string): KYC['verification'] {
  return {
    status: decision.status as KYCStatus,
    score: decision.score,
    reasons: decision.reasons,
    extracted: decision.extracted,
    provider: decision.provider,
    attempts: decision.attempts,
    verifiedAt: Timestamp.now(),
    localeAtVerification: locale,
  };
}

export function manualReviewOverride(current: KYC['verification'] | undefined): KYC['verification'] {
  return {
    status: 'manual_review_requested',
    score: current?.score ?? 0,
    reasons: [...(current?.reasons || []), 'manual_override'],
    extracted: current?.extracted,
    provider: current?.provider ?? 'mock',
    attempts: { auto: current?.attempts?.auto ?? 1, manualOverride: true },
    verifiedAt: Timestamp.now(),
    localeAtVerification: current?.localeAtVerification,
    manualReason: 'AUTO_FAIL_USER_OVERRIDE',
  };
}
