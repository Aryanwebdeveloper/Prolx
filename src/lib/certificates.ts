// Certificate utility functions
import { customAlphabet } from 'nanoid';

// Generate a unique readable certificate ID like: PROLX-CERT-AB12CD
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export function generateCertificateId(): string {
  return `PROLX-${nanoid()}`;
}

// Generate the verification URL for a certificate
export function getCertVerificationUrl(certId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://prolx.digital');
  return `${base}/certificates/${certId}`;
}

// Format date for display
export function formatCertDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Determine certificate status (may be auto-expired)
export function getCertStatus(status: string, expiryDate?: string | null): 'active' | 'inactive' | 'expired' {
  if (status === 'inactive') return 'inactive';
  if (expiryDate && new Date(expiryDate) < new Date()) return 'expired';
  return status as 'active' | 'inactive' | 'expired';
}
