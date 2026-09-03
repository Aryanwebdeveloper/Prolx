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

  // ── 2. White backing for QR code block only ──────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(130, 128, 35, 34, 'F');

  // ── 3. Render Dynamic QR Code ─────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 250,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
  doc.addImage(qrDataUrl, 'PNG', config.qrPos.x, config.qrPos.y, config.qrPos.size, config.qrPos.size);

  // ── 4. Recipient Name (Centered & Auto-Scaled) ───────────────────────────
  doc.setFont('helvetica', 'bold');
  let nameFontSize = config.namePos.fontSize;
  // Dynamic scaling: If name length exceeds 22 chars, scale down font size gracefully
  if (recipientName.length > 22) {
    nameFontSize = Math.max(16, nameFontSize - (recipientName.length - 22) * 0.55);
  }
  doc.setFontSize(nameFontSize);
  doc.setTextColor(config.namePos.color);
  doc.text(recipientName, config.namePos.x, config.namePos.y, { align: 'center' });

  // ── 5. Optional Custom / Dynamic Body Text Overlay ───────────────────────
  // If customBodyText or specific course/dates provided, render formatted text
  if (customBodyText || courseTitle) {
    const displayCourse = courseTitle || internshipField || "Web & Graphic Design";
    const durationStr = courseDuration ? ` ${courseDuration}` : "";
    const startStr = startDate ? formatCertDateFull(startDate) : "";
    const endStr = completionDate ? formatCertDateFull(completionDate) : formatCertDateFull(issueDate);
    const dateRangeStr = (startStr && endStr) ? `conducted from ${startStr} to ${endStr}` : `completed on ${endStr}`;

    const bodyText = customBodyText ||
      `This certificate is proudly presented in recognition of successfully completing the${durationStr} course in ${displayCourse}, demonstrating dedication, creativity, and practical skills. The course was ${dateRangeStr}, covering essential concepts, tools, and practical projects.`;

    // Mask placeholder text area cleanly if replacing baked text
    doc.setFillColor(255, 255, 255);
    // Cover the middle paragraph zone between Y=104 and Y=124
    doc.rect(32, 105, 233, 20, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#334155');

    // Split text into lines spanning 220mm
    const lines = doc.splitTextToSize(bodyText, 220);
    doc.text(lines, 148.5, 110, { align: 'center' });
  }

  // ── 6. Certificate ID & Issued Date Metadata Grid ────────────────────────
  // Certificate ID (Left alignment metadata)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  doc.text('Certificate ID:', 30, 140);

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(config.idPos.color);   // template teal #009B8E
  doc.text(certId, 64, 140);

  // Draw line under cert ID
  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(30, 142, 135, 142);

  // Issued Date (Right alignment metadata)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#475569');
  doc.text('Issued on:', 165, 140);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(config.datePos.color);
  doc.text(formatCertDateFull(issueDate), 191, 140);

  // Draw line under date
  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(165, 142, 260, 142);

  return doc.output('blob');
}
