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

interface GenerateParams {
  type: CertificateType;
  recipientName: string;
  certId: string;
  issueDate: string;
  internshipField?: string;
  verificationUrl: string;
}

export async function generateCertificatePDF({
  type,
  recipientName,
  certId,
  issueDate,
  verificationUrl,
}: GenerateParams): Promise<Blob> {
  const jsPDF  = await getJsPDF();
  const config = CERTIFICATE_CONFIGS[type];
  if (!config) throw new Error(`Invalid certificate type: ${type}`);

  // A4 Landscape: 297mm × 210mm
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── 1. Draw full-bleed template background ────────────────────────────────
  const imgBase64 = await getBase64ImageFromUrl(config.templatePath);
  doc.addImage(imgBase64, 'PNG', 0, 0, 297, 210);

  // ── 2. White masking rectangles — erase ALL baked-in placeholder text ─────
  doc.setFillColor(255, 255, 255);

  // A) "ENTER NAME" zone — Y 77 → 91
  doc.rect(50, 77, 197, 14, 'F');

  // B) FULL Certificate ID zone — masks "Certificate ID:" label + dotted underline + value area
  //    X=28→138 (110mm), Y=131→145 (14mm)
  //    We redraw the label + value ourselves (step 5 below)
  doc.rect(28, 131, 110, 14, 'F');

  // C) FULL date zone — masks "Issued on:" label + "DD / MM / YYY" + underlines
  //    X=163→248 (85mm), Y=132→144 (12mm)
  //    We redraw label + value ourselves (step 7 below)
  doc.rect(163, 132, 85, 12, 'F');

  // D) QR placeholder — expanded to catch all black border/dot artifacts
  //    X=130→165 (35mm), Y=128→162 (34mm)
  doc.rect(130, 128, 35, 34, 'F');

  // ── 3. Dynamic QR Code ────────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 250,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
  doc.addImage(qrDataUrl, 'PNG', config.qrPos.x, config.qrPos.y, config.qrPos.size, config.qrPos.size);

  // ── 4. Recipient Name (centred) ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  let nameFontSize = config.namePos.fontSize;
  if (recipientName.length > 22) {
    nameFontSize = Math.max(18, nameFontSize - (recipientName.length - 22) * 0.6);
  }
  doc.setFontSize(nameFontSize);
  doc.setTextColor(config.namePos.color);
  doc.text(recipientName, config.namePos.x, config.namePos.y, { align: 'center' });

  // ── 5. "Certificate ID:" label (re-drawn) + cert ID value on SAME LINE ───
  //    Label: helvetica normal 8pt dark gray → matches template style
  //    Value: courier bold 10pt teal → clearly distinct, professional
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#374151');
  doc.text('Certificate ID:', 30, 140);

  // "Certificate ID:" at 8pt ≈ 30mm wide → value starts at X = 30 + 30 + 2 = 62
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(config.idPos.color);   // template teal
  doc.text(certId, 64, 140);

  // ── 6. Draw underline below the cert ID row ───────────────────────────────
  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(30, 142, 135, 142);

  // ── 7. "Issued on:" label (re-drawn) + date value on SAME LINE ───────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#374151');
  doc.text('Issued on:', 165, 140);

  // "Issued on:" at 8pt ≈ 24mm wide → date value starts at X = 165 + 24 + 2 = 191
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(config.datePos.color);
  doc.text(formatCertDateFull(issueDate), 191, 140);

  // ── 8. Draw underline below the date row ─────────────────────────────────
  doc.setDrawColor('#009B8E');
  doc.setLineWidth(0.3);
  doc.line(165, 142, 260, 142);

  return doc.output('blob');
}
