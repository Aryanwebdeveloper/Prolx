// Client-side certificate generation using jsPDF
import QRCode from 'qrcode';
import { CERTIFICATE_CONFIGS, CertificateType, formatCertDateFull } from './certificates';

async function getJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
}

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to load image'));
    reader.readAsDataURL(blob);
  });
}

export interface GenerateParams {
  type?: CertificateType | string;
  recipientName: string;
  courseTitle?: string;
  courseDuration?: string;
  startDate?: string;
  completionDate?: string;
  certId: string;
  issueDate: string;
  internshipField?: string;
  verificationUrl: string;
  customBodyText?: string;
  templateUrl?: string;
}

export async function generateCertificatePDF({
  type = 'course_completion',
  recipientName,
  courseTitle,
  courseDuration,
  startDate,
  completionDate,
  certId,
  issueDate,
  internshipField,
  verificationUrl,
  customBodyText,
  templateUrl,
}: GenerateParams): Promise<Blob> {
  const jsPDF  = await getJsPDF();
  const certType = (type as CertificateType) in CERTIFICATE_CONFIGS ? (type as CertificateType) : 'course_completion';
  const config = CERTIFICATE_CONFIGS[certType];

  // A4 Landscape: 297mm × 210mm
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── 1. Draw template background ──────────────────────────────────────────
  const bgUrl = templateUrl || config.templatePath || '/CourseresUIUXCertificate.png';
  try {
    const imgBase64 = await getBase64ImageFromUrl(bgUrl);
    doc.addImage(imgBase64, 'PNG', 0, 0, 297, 210);
  } catch (e) {
    console.warn("Could not load background template image, using solid fallback", e);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
  }

  // Generate dynamic QR Code for all certificate types
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 250,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });

  // ── COURSE COMPLETION CERTIFICATE (SPECIFIC DESIGN) ──────────────────────
  if (certType === 'course_completion') {
    // 1. Draw solid white rect background to completely hide pre-printed sample QR on template image
    doc.setFillColor(255, 255, 255);
    doc.rect(130.0, 144.0, 37, 36, 'F');

    // 2. Dynamic QR Code overlay precisely centered inside template QR ribbon frame
    doc.addImage(qrDataUrl, 'PNG', config.qrPos.x, config.qrPos.y, config.qrPos.size, config.qrPos.size);

    // 2. Recipient Name (Centered & Scaled in designated area below ribbon)
    doc.setFont('helvetica', 'bold');
    let nameFontSize = 28;
    if (recipientName.length > 35) {
      nameFontSize = 14;
    } else if (recipientName.length > 25) {
      nameFontSize = 18;
    } else if (recipientName.length > 18) {
      nameFontSize = 23;
    }
    doc.setFontSize(nameFontSize);
    doc.setTextColor(config.namePos.color || '#0F172A');
    doc.text(recipientName, config.namePos.x, config.namePos.y, { align: 'center' });

    // 3. Custom Body Text Overlay if specified
    if (customBodyText && customBodyText.trim().length > 0) {
      doc.setFillColor(255, 255, 255);
      doc.rect(32, 105, 233, 20, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#334155');
      const lines = doc.splitTextToSize(customBodyText, 220);
      doc.text(lines, 148.5, 110, { align: 'center' });
    }

    // 4. Right-Side Metadata Stacked Vertically (Cert ID & Issue Date)
    const rightX = config.idPos.x;
    // Certificate ID Label & Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#64748B');
    doc.text('Certificate ID:', rightX, 144);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#009B8E'); // template teal
    doc.text(certId, rightX, 150);

    // Issued on Label & Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#64748B');
    doc.text('Issued on:', rightX, 158);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#0F172A');
    doc.text(formatCertDateFull(issueDate), rightX, 164);

    return doc.output('blob');
  }

  // ── OTHER CERTIFICATE TYPES (UNTOUCHED LEGACY LAYOUT) ─────────────────────
  // White backing box for legacy templates
  doc.setFillColor(255, 255, 255);
  doc.rect(130, 128, 35, 34, 'F');

  // Render QR code
  doc.addImage(qrDataUrl, 'PNG', config.qrPos.x, config.qrPos.y, config.qrPos.size, config.qrPos.size);

  // Recipient Name
  doc.setFont('helvetica', 'bold');
  let nameFontSize = config.namePos.fontSize;
  if (recipientName.length > 22) {
    nameFontSize = Math.max(16, nameFontSize - (recipientName.length - 22) * 0.55);
  }
  doc.setFontSize(nameFontSize);
  doc.setTextColor(config.namePos.color);
  doc.text(recipientName, config.namePos.x, config.namePos.y, { align: 'center' });

  // Custom Body Text
  if (customBodyText && customBodyText.trim().length > 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(32, 105, 233, 20, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#334155');
    const lines = doc.splitTextToSize(customBodyText, 220);
    doc.text(lines, 148.5, 110, { align: 'center' });
  }

  // Metadata Grid for Legacy Certificates
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  doc.text('Certificate ID:', 30, 140);

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(config.idPos.color);
  doc.text(certId, 64, 140);

  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(30, 142, 135, 142);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  doc.text('Issued on:', 165, 140);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(config.datePos.color);
  doc.text(formatCertDateFull(issueDate), 191, 140);

  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(165, 142, 260, 142);

  return doc.output('blob');
}
