import { describe, it, expect } from 'vitest';
import { computeScore, decideStatus, evaluateKyc, normalizeName, parseMrz } from '@/lib/kycEngine';

describe('kycEngine', () => {
  it('normalizes names removing accents and casing', () => {
    expect(normalizeName('José Pérez')).toBe('JOSE PEREZ');
    expect(normalizeName('   anna  marie ')).toBe('ANNA MARIE');
  });

  it('parses MRZ-like text', () => {
    const parsed = parseMrz('P<GBRTEST<<PERSON\n123456789<GBR8001019M2001012<<<<<<<<<<<<<<04');
    expect(parsed.mrzPresent).toBe(true);
    expect(parsed.documentNumber).toContain('123456');
    expect(parsed.dateOfBirth).toBe('1980-01-01');
  });

  it('computes score and status', () => {
    const form = { fullName: 'John Doe', dob: '1980-01-01', documentNumber: 'AA123456', nationalNumber: '', email: '', locale: 'en' };
    const extracted = { fullName: 'JOHN DOE', dateOfBirth: '1980-01-01', documentNumber: 'AA123456', mrzValid: true };
    const { score } = computeScore(form, extracted);
    expect(score).toBeGreaterThan(90);
    const status = decideStatus(score, [], extracted);
    expect(status).toBe('verified');
  });

  it('flags fail on dob mismatch', () => {
    const decision = evaluateKyc(
      { fullName: 'Jane Roe', dob: '1990-02-02', documentNumber: 'BB999', nationalNumber: '', email: '', locale: 'en' },
      { fullName: 'JANE ROE', dateOfBirth: '1991-02-02', documentNumber: 'BB999', mrzValid: false }
    );
    expect(decision.status).toBe('fail');
  });
});
