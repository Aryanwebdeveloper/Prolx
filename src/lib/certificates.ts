// Certificate utility functions and configurations
import { customAlphabet } from 'nanoid';

// Short, clean, professional ID: PROLX- + 6 uppercase alphanumeric
// e.g. PROLX-4F92A1, PROLX-260701, PROLX-A83D21
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
export function generateCertificateId(): string {
  return `PROLX-${nanoid()}`;
}

export type CertificateType =
  | 'excellence'
  | 'opa'
  | 'internship'
  | 'internship_wordpress'
  | 'internship_social'
  | 'internship_video'
  | 'internship_graphics';

export interface CertificateConfig {
  type: CertificateType;
  displayName: string;
  templatePath: string;
  namePos: { x: number; y: number; fontSize: number; color: string };
  // idPos: placed INLINE with the "Certificate ID:" label (same Y, right after label text)
  idPos: { x: number; y: number; fontSize: number; color: string };
  // datePos: placed INLINE with the "Issued on:" label (same Y, right after label text)
  datePos: { x: number; y: number; fontSize: number; color: string };
  qrPos: { x: number; y: number; size: number };
}

// ─── Coordinate Reference (A4 Landscape = 297mm × 210mm) ───────────────────
// Bottom row of template:
//   "Certificate ID:" label  → baked in PNG at X≈32, Y≈140 (baseline)
//   Our cert ID value        → same Y, starts right after label text: X≈84, Y≈140
//   QR code block            → X=138, Y=133, 21mm²
//   "Issued on:" label       → baked in PNG at X≈193, Y≈140 (baseline)
//   DD / MM / YYY placeholder → masked entirely; our date at X≈214, same Y
// ────────────────────────────────────────────────────────────────────────────

const SHARED = {
  namePos: { x: 148.5, y: 89,  fontSize: 30, color: '#0F172A' },
  idPos:   { x: 88,    y: 140, fontSize: 10, color: '#009B8E' },   // template teal
  datePos: { x: 216,   y: 140, fontSize: 10, color: '#009B8E' },   // template teal
  qrPos:   { x: 138.5, y: 133, size: 21 },
};

export const CERTIFICATE_CONFIGS: Record<CertificateType, CertificateConfig> = {
  excellence:           { type: 'excellence',           displayName: 'Certificate of Excellence',              templatePath: '/caertificate_Excellent-01.png',                        ...SHARED },
  opa:                  { type: 'opa',                  displayName: 'Outstanding Performance Award',           templatePath: '/caertificate_OPA-01.png',                              ...SHARED },
  internship:           { type: 'internship',           displayName: 'Internship Certificate (Default)',        templatePath: '/intership-caertificate_AllField_Interships-01.png',    ...SHARED },
  internship_wordpress: { type: 'internship_wordpress', displayName: 'WordPress Internship Certificate',       templatePath: '/intership_caertificate_wordpress-01.png',               ...SHARED },
  internship_social:    { type: 'internship_social',    displayName: 'Social Media Management Internship',     templatePath: '/Intership-caertificate_SocialMEdiaManagers-01.png',    ...SHARED },
  internship_video:     { type: 'internship_video',     displayName: 'Video Editing Internship Certificate',   templatePath: '/intership-caertificate_VideoEditing-01.png',            ...SHARED },
  internship_graphics:  { type: 'internship_graphics',  displayName: 'Graphic Designer Internship',            templatePath: '/_intershipcaertificate_graphic_desginer-01.png',       ...SHARED },
};

// Always use production domain so QR codes work when scanned
export function getCertVerificationUrl(certId: string): string {
  return `https://prolx.cloud/certificates/${certId}`;
}

export function formatCertDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date for certificate PDF: "06 July 2026"
export function formatCertDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day   = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year  = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getCertStatus(status: string, expiryDate?: string | null): 'active' | 'inactive' | 'expired' | 'revoked' {
  if (status === 'revoked')  return 'revoked';
  if (status === 'inactive') return 'inactive';
  if (expiryDate && new Date(expiryDate) < new Date()) return 'expired';
  return status as 'active' | 'inactive' | 'expired' | 'revoked';
}
