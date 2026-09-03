// Certificate utility functions and configurations
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

// Formats:
// 1. Configurable sequence format: PRLX-CERT-26-000001
// 2. Short random format: PROLX-4F92A1
export function generateCertificateId(prefix = 'PRLX-CERT', sequence?: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  if (sequence !== undefined) {
    const seqStr = String(sequence).padStart(6, '0');
    return `${prefix}-${year}-${seqStr}`;
  }
  return `PROLX-${nanoid()}`;
}

export type CertificateType =
  | 'course_completion'
  | 'training_completion'
  | 'internship_completion'
  | 'participation'
  | 'achievement'
  | 'appreciation'
  | 'excellence'
  | 'opa'
  | 'contributor'
  | 'project_completion'
  | 'team_player'
  | 'invitation_award'
  | 'employee_recognition'
  | 'leadership_excellence'
  | 'digital_marketing'
  | 'internship'
  | 'internship_wordpress'
  | 'internship_social'
  | 'internship_video';

export interface CertificateConfig {
  type: CertificateType;
  displayName: string;
  templatePath: string;
  namePos: { x: number; y: number; fontSize: number; color: string };
  idPos: { x: number; y: number; fontSize: number; color: string };
  datePos: { x: number; y: number; fontSize: number; color: string };
  qrPos: { x: number; y: number; size: number };
}

// ─── Coordinate Reference (A4 Landscape = 297mm × 210mm) ───────────────────
// Template grid matching CourseresUIUXCertificate.png:
//   Name area             → centered at X=148.5, Y=89
//   "Certificate ID:"     → X=30, Y=140
//   QR code block         → X=138.5, Y=133, 21mm²
//   "Issued on:"          → X=165, Y=140
// ────────────────────────────────────────────────────────────────────────────

const SHARED = {
  namePos: { x: 148.5, y: 89,  fontSize: 30, color: '#0F172A' },
  idPos:   { x: 88,    y: 140, fontSize: 10, color: '#009B8E' },   // template teal
  datePos: { x: 216,   y: 140, fontSize: 10, color: '#009B8E' },   // template teal
  qrPos:   { x: 138.5, y: 133, size: 21 },
};

export const CERTIFICATE_CONFIGS: Record<CertificateType, CertificateConfig> = {
  // ── Academy / Completion ────────────────────────────────────────────────
  course_completion:     { type: 'course_completion',     displayName: 'Certificate of Completion',              templatePath: '/CourseresUIUXCertificate.png',                             ...SHARED },
  training_completion:   { type: 'training_completion',   displayName: 'Training Completion Certificate',        templatePath: '/caertificate OF TRENNING COMPTION-01.png',                 ...SHARED },
  internship_completion: { type: 'internship_completion', displayName: 'Internship Completion Certificate',      templatePath: '/caertificate OF INTERSHIP COMPITATION for all.png',        ...SHARED },
  participation:         { type: 'participation',         displayName: 'Certificate of Participation',           templatePath: '/CourseresUIUXCertificate.png',                             ...SHARED },
  achievement:           { type: 'achievement',           displayName: 'Certificate of Achievement',             templatePath: '/caertificate OF ACHIVEment.png',                           ...SHARED },
  appreciation:          { type: 'appreciation',          displayName: 'Certificate of Appreciation',            templatePath: '/caertificate OF APPrication.png',                          ...SHARED },
  // ── Award / Recognition ──────────────────────────────────────────────────
  excellence:            { type: 'excellence',            displayName: 'Certificate of Excellence',              templatePath: '/caertificate OF EXCELLENCE-01.png',                       ...SHARED },
  opa:                   { type: 'opa',                   displayName: 'Outstanding Performance Award',           templatePath: '/caertificate OF outstaniding awar PERFORMANCE-01.png',    ...SHARED },
  contributor:           { type: 'contributor',           displayName: 'Certificate of Contributor',             templatePath: '/caertificate OF CONTRIBUTER-01.png',                       ...SHARED },
  project_completion:    { type: 'project_completion',    displayName: 'Certificate of Project Completion',      templatePath: '/caertificate OF PROJECT COM-01.png',                       ...SHARED },
  team_player:           { type: 'team_player',           displayName: 'Certificate of Team Player',             templatePath: '/caertificate OF TEAM PLAYER-01.png',                       ...SHARED },
  invitation_award:      { type: 'invitation_award',      displayName: 'Certificate of Invitation Award',        templatePath: '/caertificate OF invitation AWARD-01.png',                  ...SHARED },
  employee_recognition:  { type: 'employee_recognition',  displayName: 'Employee Recognition Certificate',       templatePath: '/caertificate OF EMPLOY recongination.png',                 ...SHARED },
  leadership_excellence: { type: 'leadership_excellence', displayName: 'Leadership Excellence Certificate',      templatePath: '/caertificate OF LEADERship excucation EXC-01.png',         ...SHARED },
  digital_marketing:     { type: 'digital_marketing',     displayName: 'Digital Marketing Certificate',          templatePath: '/caertificate DEGITAL Marketing.png',                       ...SHARED },
  // ── Legacy Internships ────────────────────────────────────────────────────
  internship:            { type: 'internship',            displayName: 'Graphic Design Internship',              templatePath: '/caertificateGD-01.png',                                    ...SHARED },
  internship_wordpress:  { type: 'internship_wordpress',  displayName: 'WordPress Internship Certificate',       templatePath: '/caertificateWP-01.png',                                    ...SHARED },
  internship_social:     { type: 'internship_social',     displayName: 'Social Media Management Internship',     templatePath: '/caertificateSOCIAL-01.png',                                ...SHARED },
  internship_video:      { type: 'internship_video',      displayName: 'Video Editing Internship Certificate',   templatePath: '/caertificateVEDIO-01.png',                                 ...SHARED },
};

export function getCertVerificationUrl(certId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/verify-certificate/${certId.trim().toUpperCase()}`;
  }
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://prolx.cloud';
  return `${domain}/verify-certificate/${certId.trim().toUpperCase()}`;
}

export function formatCertDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Format date for certificate PDF: "03 September 2026"
export function formatCertDateFull(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year  = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function getCertStatus(status: string, expiryDate?: string | null): 'active' | 'inactive' | 'expired' | 'revoked' {
  if (status === 'revoked')  return 'revoked';
  if (status === 'inactive' || status === 'draft' || status === 'cancelled') return 'inactive';
  if (expiryDate && new Date(expiryDate) < new Date()) return 'expired';
  return 'active';
}
