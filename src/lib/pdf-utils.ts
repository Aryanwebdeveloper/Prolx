// Client-side PDF generation utilities using jsPDF
// This runs in the browser - no server cost

import type { InvoiceWithItems } from "@/types/erp";
import type { LetterType } from "@/types/erp";

// Dynamic import helper to avoid SSR issues
async function getJsPDF() {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
}

// ============================================================
// STAMP IMAGE LOADER
// ============================================================
let stampCache: string | null = null;

async function loadStampImage(): Promise<string | null> {
  if (stampCache) return stampCache;
  try {
    const response = await fetch("/ProlxStampsBD.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        stampCache = reader.result as string;
        resolve(stampCache);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ============================================================
// INVOICE PDF
// ============================================================
export async function generateInvoicePDF(invoice: InvoiceWithItems): Promise<Blob> {
  const { jsPDF } = await getJsPDF();
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const teal = [13, 148, 136] as [number, number, number];
  const dark = [15, 23, 42] as [number, number, number];
  const gray = [100, 116, 139] as [number, number, number];
  const lightGray = [241, 245, 249] as [number, number, number];

  // Header background
  doc.setFillColor(...teal);
  doc.rect(0, 0, W, 45, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PROLX", 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Agency | Software House", 15, 28);
  doc.text("info@prolx.com | www.prolx.com", 15, 35);

  // INVOICE label top right
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", W - 15, 22, { align: "right" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.id, W - 15, 32, { align: "right" });

  // Reset color
  doc.setTextColor(...dark);

  // Invoice meta box
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, 52, 85, 30, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("BILL TO", 20, 60);
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client?.full_name || "—", 20, 67);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoice.client?.email || "", 20, 74);

  // Right meta
  const metaStart = W - 90;
  doc.setFillColor(...lightGray);
  doc.roundedRect(metaStart, 52, 80, 30, 2, 2, "F");
  const metaRows = [
    ["Issue Date:", invoice.issue_date || "—"],
    ["Due Date:", invoice.due_date || "—"],
    ["Status:", (invoice.status || "").toUpperCase()],
  ];
  metaRows.forEach(([label, value], i) => {
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(label, metaStart + 5, 60 + i * 8);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(value, metaStart + 75, 60 + i * 8, { align: "right" });
    doc.setFont("helvetica", "normal");
  });

  // Line items table
  const items = invoice.invoice_items || [];
  autoTable(doc, {
    startY: 90,
    head: [["#", "Description", "Qty", "Unit Price", "Total"]],
    body: items.map((item, i) => [
      i + 1,
      item.description,
      item.quantity,
      `PKR ${Number(item.unit_price).toLocaleString()}`,
      `PKR ${Number(item.total).toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: teal, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: dark },
    alternateRowStyles: { fillColor: lightGray },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // Totals section
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  const totalsX = W - 80;

  const totals = [
    ["Subtotal", `PKR ${Number(invoice.subtotal).toLocaleString()}`],
    [`Tax (${invoice.tax_rate}%)`, `PKR ${(Number(invoice.subtotal) * Number(invoice.tax_rate) / 100).toLocaleString()}`],
    ["Discount", `- PKR ${Number(invoice.discount).toLocaleString()}`],
  ];

  totals.forEach(([label, value], i) => {
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(label, totalsX, finalY + i * 8);
    doc.setTextColor(...dark);
    doc.text(value, W - 15, finalY + i * 8, { align: "right" });
  });

  // Total line
  const totalY = finalY + totals.length * 8 + 4;
  doc.setFillColor(...teal);
  doc.roundedRect(totalsX - 5, totalY - 6, W - totalsX + 5 - 10, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", totalsX, totalY + 2);
  doc.text(`PKR ${Number(invoice.total).toLocaleString()}`, W - 15, totalY + 2, { align: "right" });

  // Notes
  if (invoice.notes) {
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Notes:", 15, totalY + 16);
    doc.setTextColor(...dark);
    doc.text(invoice.notes, 15, totalY + 23, { maxWidth: 120 });
  }

  // ── Stamp Image (Verification Seal) ──
  const stampData = await loadStampImage();
  if (stampData) {
    const stampSize = 38;
    const stampX = 15;
    const stampY = totalY + 18;
    doc.saveGraphicsState();
    // @ts-expect-error jsPDF GState typing
    doc.setGState(new doc.GState({ opacity: 0.85 }));
    doc.addImage(stampData, "PNG", stampX, stampY, stampSize, stampSize);
    doc.restoreGraphicsState();
  }

  // Authorized signature area on right side
  const sigAreaY = totalY + 30;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Authorized Signatory", W - 55, sigAreaY);
  doc.setDrawColor(...teal);
  doc.setLineWidth(0.4);
  doc.line(W - 75, sigAreaY - 5, W - 15, sigAreaY - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("Prolx Digital Agency", W - 55, sigAreaY + 6);

  // Footer
  doc.setFillColor(...teal);
  doc.rect(0, 280, W, 17, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business! | Prolx Digital Agency", W / 2, 290, { align: "center" });

  return doc.output("blob");
}

// ============================================================
// LETTER PDF
// ============================================================
export async function generateLetterPDF(params: {
  letterId: string;
  letterType: LetterType;
  recipientName: string;
  subject: string;
  content: Record<string, string>;
  date: string;
}): Promise<Blob> {
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const H = 297;
  const teal = [13, 148, 136] as [number, number, number];
  const dark = [15, 23, 42] as [number, number, number];
  const gray = [100, 116, 139] as [number, number, number];

  const drawHeader = (isFirstPage: boolean) => {
    // Top banner
    doc.setFillColor(...teal);
    doc.rect(0, 0, W, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PROLX", 15, 16);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Agency | Software House", 15, 23);
    doc.text(`Ref: ${params.letterId}${!isFirstPage ? " (Cont'd)" : ""}`, W - 15, 23, { align: "right" });

    if (isFirstPage) {
      // Date
      doc.setTextColor(...gray);
      doc.setFontSize(9);
      doc.text(`Date: ${params.date || new Date().toLocaleDateString("en-GB")}`, 15, 50);

      // Recipient 
      doc.setTextColor(...dark);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(params.recipientName, 15, 62);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text("Prolx Digital Agency", 15, 69);

      // Subject
      doc.setTextColor(...dark);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Subject: ${params.subject}`, 15, 82);

      // Separator
      doc.setDrawColor(...teal);
      doc.setLineWidth(0.5);
      doc.line(15, 86, W - 15, 86);
    } else {
      // Minimal header separation on subsequent pages
      doc.setDrawColor(...teal);
      doc.setLineWidth(0.5);
      doc.line(15, 45, W - 15, 45);
    }
  };

  const drawVerificationAndFooter = () => {
    // Verification bar
    doc.setFillColor(241, 245, 249);
    doc.rect(0, H - 30, W, 13, "F");
    doc.setFontSize(6.5);
    doc.setTextColor(...gray);
    doc.text(
      `Document Ref: ${params.letterId} | Generated: ${new Date().toLocaleDateString("en-GB")} | This document is digitally verified by Prolx Digital Agency`,
      W / 2, H - 23, { align: "center" }
    );

    // Footer
    doc.setFillColor(...teal);
    doc.rect(0, H - 17, W, 17, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text("Prolx Digital Agency | info@prolx.com | www.prolx.com | This is an official company document.", W / 2, H - 7, { align: "center" });
  };

  drawHeader(true);

  // Body based on letter type
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...dark);

  const bodyText = buildLetterBody(params.letterType, params.content, params.recipientName);
  const lines = doc.splitTextToSize(bodyText, W - 30);
  
  let currentY = 95;
  const lineHeight = 5.5; // lines spacing

  const pageBottomLimit = H - 35; // Leaving 35mm for verification/footer

  for (let i = 0; i < lines.length; i++) {
    if (currentY > pageBottomLimit) {
      drawVerificationAndFooter(); // Draw footer on current page
      doc.addPage();
      drawHeader(false); // Draw minimal header on new page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...dark);
      currentY = 55; // start text a bit lower on second page to clear minimal header
    }
    doc.text(lines[i], 15, currentY);
    currentY += lineHeight;
  }

  // ── Signature block ──
  // Check if we have enough space for signature block and stamp
  if (currentY > H - 85) { 
    // Not enough space (stamp and sig block take up roughly 45mm, footer takes 35mm)
    drawVerificationAndFooter();
    doc.addPage();
    drawHeader(false);
    currentY = 55;
  }

  const sigY = currentY + 25;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("Authorized Signatory", 15, sigY);
  doc.setDrawColor(...teal);
  doc.setLineWidth(0.4);
  doc.line(15, sigY - 5, 80, sigY - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("Prolx Digital Agency", 15, sigY + 7);
  doc.text("Human Resources Department", 15, sigY + 14);

  // Stamp Image
  const stampData = await loadStampImage();
  if (stampData) {
    const stampSize = 42;
    const stampX = W - 15 - stampSize;
    const stampY = sigY - 15;
    doc.saveGraphicsState();
    // @ts-expect-error jsPDF GState typing
    doc.setGState(new doc.GState({ opacity: 0.85 }));
    doc.addImage(stampData, "PNG", stampX, stampY, stampSize, stampSize);
    doc.restoreGraphicsState();
  } else {
    // Fallback: text-based stamp
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    doc.circle(W - 40, sigY + 5, 20);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text("PROLX", W - 40, sigY + 3, { align: "center" });
    doc.text("DIGITAL AGENCY", W - 40, sigY + 8, { align: "center" });
    doc.text("OFFICIAL STAMP", W - 40, sigY + 13, { align: "center" });
  }

  drawVerificationAndFooter(); // Draw footer on the final page

  return doc.output("blob");
}

// ============================================================
// LETTER BODY BUILDER — with full Terms & Conditions
// ============================================================
function buildLetterBody(
  type: LetterType,
  content: Record<string, string>,
  recipientName: string
): string {
  const salutation = `Dear ${recipientName},\n\n`;

  switch (type) {
    case "offer_letter":
      return (
        salutation +
        `We are pleased to offer you the position of ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.\n\n` +
        `Your monthly compensation will be PKR ${content.salary || "_____"}. Your employment will commence on ${content.start_date || "_____"}.${content.probation_months ? ` There will be a probation period of ${content.probation_months} month(s), during which either party may terminate the employment with a 7-day written notice.` : ""}\n\n` +
        (content.reporting_to ? `You will report directly to ${content.reporting_to}.\n\n` : "") +
        (content.office_location ? `Your primary work location will be at ${content.office_location}.\n\n` : "") +
        `TERMS & CONDITIONS:\n\n` +
        `1. Employment Nature: Your employment is on a full-time basis. You are expected to devote your full professional attention to the duties assigned. Any outside employment or freelance work must be pre-approved by management.\n\n` +
        `2. Working Hours: Standard working hours are Monday to Friday, 9:00 AM to 6:00 PM, with a one-hour break. Overtime may be required as per project needs.\n\n` +
        `3. Compensation & Benefits: Your salary will be disbursed on the last working day of each month via bank transfer. All applicable statutory deductions (income tax, provident fund) will be withheld as per the laws of Pakistan.\n\n` +
        `4. Leave Policy: You are entitled to annual leaves, casual leaves, and sick leaves as per the company leave policy. Leave entitlement will be shared upon joining.\n\n` +
        `5. Confidentiality: You agree to maintain strict confidentiality regarding all proprietary information, trade secrets, client data, source code, and business strategies. This obligation survives termination of employment.\n\n` +
        `6. Intellectual Property: All work product, code, designs, and creative materials developed during your employment shall be the exclusive property of Prolx Digital Agency.\n\n` +
        `7. Non-Compete: During employment and for a period of 6 months after termination, you agree not to engage in any competing business or solicit company clients.\n\n` +
        `8. Termination: Either party may terminate this employment by providing a 30-day written notice or payment in lieu thereof. The company reserves the right to terminate without notice in cases of gross misconduct.\n\n` +
        `9. Code of Conduct: You are expected to maintain professional conduct, integrity, and adherence to all company policies and procedures.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `Please confirm your acceptance by signing and returning a copy of this letter within 7 business days. Failure to respond within this period may result in withdrawal of this offer.\n\nWe look forward to having you as part of the Prolx team.\n\nYours sincerely,`
      );

    case "internship_letter":
      return (
        salutation +
        `We are pleased to offer you an internship position as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.\n\n` +
        `Internship Duration: ${content.duration || "_____"}, commencing from ${content.start_date || "_____"}${content.end_date ? ` until ${content.end_date}` : ""}.\n\n` +
        (content.working_hours ? `Working Hours: ${content.working_hours}.\n\n` : "") +
        (content.mentor_name ? `You will be mentored by ${content.mentor_name}` : "") +
        (content.reporting_to ? `${content.mentor_name ? " and reporting" : "You will be reporting"} to ${content.reporting_to}` : "") +
        ((content.mentor_name || content.reporting_to) ? ".\n\n" : "") +
        (content.office_location ? `Work Location: ${content.office_location}.\n\n` : "") +
        `INTERNSHIP TERMS & CONDITIONS:\n\n` +
        `1. Nature of Internship: This is an unpaid internship designed to provide you with practical experience and professional development in the field of software development and digital services. This internship does not constitute an employment relationship.\n\n` +
        `2. Learning Objectives: During your internship, you will be exposed to real-world projects, industry best practices, and professional work methodologies. You will receive hands-on training and mentorship to enhance your technical and soft skills.\n\n` +
        `3. Attendance & Punctuality: Regular attendance is mandatory. You must maintain at least 80% attendance throughout the internship period. Prior notice must be given for any absence.\n\n` +
        `4. Professional Conduct: You are expected to dress appropriately, behave professionally, and respect workplace policies. Any form of harassment, discrimination, or misconduct will result in immediate termination of the internship.\n\n` +
        `5. Confidentiality: You agree to keep all proprietary information, client data, project details, source code, and trade secrets strictly confidential during and after the internship. Breach of confidentiality may result in legal action.\n\n` +
        `6. Intellectual Property: All work, code, designs, and materials created during your internship are the exclusive property of Prolx Digital Agency. You may not use, share, or claim ownership of any such materials.\n\n` +
        `7. Evaluation & Feedback: Your performance will be evaluated periodically. A formal review will be conducted at the end of the internship period.\n\n` +
        `8. Certificate of Completion: Upon successful completion of the internship and satisfactory performance, you will receive an official Internship Completion Certificate from Prolx Digital Agency.\n\n` +
        `9. Termination: Either party may terminate this internship by providing 7 days written notice. The company reserves the right to terminate the internship immediately in cases of misconduct or policy violation.\n\n` +
        `10. No Employment Guarantee: This internship does not guarantee subsequent employment with Prolx Digital Agency. However, exceptional interns may be considered for available positions.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `Please confirm your acceptance by signing and returning a copy of this letter.\n\nYours sincerely,`
      );

    case "paid_internship_letter":
      return (
        salutation +
        `We are pleased to offer you a paid internship position as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.\n\n` +
        `Internship Duration: ${content.duration || "_____"}, commencing from ${content.start_date || "_____"}${content.end_date ? ` until ${content.end_date}` : ""}.\n\n` +
        `Monthly Stipend: PKR ${content.stipend || "_____"}${content.payment_schedule ? `, payable ${content.payment_schedule}` : ", payable Monthly"}.\n\n` +
        (content.working_hours ? `Working Hours: ${content.working_hours}.\n\n` : "") +
        (content.mentor_name ? `You will be mentored by ${content.mentor_name}` : "") +
        (content.reporting_to ? `${content.mentor_name ? " and reporting" : "You will be reporting"} to ${content.reporting_to}` : "") +
        ((content.mentor_name || content.reporting_to) ? ".\n\n" : "") +
        (content.office_location ? `Work Location: ${content.office_location}.\n\n` : "") +
        `PAID INTERNSHIP TERMS & CONDITIONS:\n\n` +
        `1. Nature of Internship: This is a paid internship designed to provide practical experience and professional development. The stipend is provided as a learning allowance and does not constitute an employment salary.\n\n` +
        `2. Stipend & Payment: Your monthly stipend of PKR ${content.stipend || "_____"} will be disbursed ${content.payment_schedule || "monthly"} via bank transfer or cheque. Applicable tax deductions will be made as per prevailing laws of Pakistan.\n\n` +
        `3. Learning Objectives: You will be assigned to real projects under professional supervision. Mentorship sessions, code reviews, and skill development workshops will be provided as part of your internship experience.\n\n` +
        `4. Attendance & Punctuality: Regular attendance is mandatory. You must maintain at least 80% attendance. Stipend deductions may apply for unexcused absences.\n\n` +
        `5. Professional Conduct: Maintain professional behavior, appropriate dress code, and respect company policies at all times.\n\n` +
        `6. Confidentiality: You agree to maintain strict confidentiality regarding all proprietary information, client data, source code, project details, and trade secrets of Prolx Digital Agency. This obligation continues after the internship concludes.\n\n` +
        `7. Intellectual Property: All work product, code, designs, and creative output developed during the internship period shall be the exclusive property of Prolx Digital Agency.\n\n` +
        `8. Performance Evaluation: Your performance will be reviewed periodically. Final evaluation will determine certificate grade and recommendation eligibility.\n\n` +
        `9. Certificate of Completion: Upon successful completion, you will receive an official Paid Internship Completion Certificate specifying your role, duration, and performance.\n\n` +
        `10. Termination: Either party may terminate this internship with 7 days written notice. Immediate termination may occur for misconduct or policy violations. Stipend will be calculated pro-rata up to the last working day.\n\n` +
        `11. No Employment Guarantee: This internship does not guarantee future employment. However, outstanding performers may be considered for permanent roles.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `Please confirm your acceptance by signing and returning a copy of this letter.\n\nYours sincerely,`
      );

    case "appointment_letter":
      return (
        salutation +
        `We are delighted to appoint you as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.\n\n` +
        `Your joining date is ${content.joining_date || "_____"}, with employment type: ${content.employment_type || "Full-time"}.` +
        (content.salary ? ` Your monthly salary will be PKR ${content.salary}.` : "") +
        `\n\n` +
        `TERMS & CONDITIONS:\n\n` +
        `1. You are expected to abide by all company rules, regulations, and policies as communicated during orientation.\n\n` +
        `2. Your appointment is subject to satisfactory verification of your educational qualifications, previous employment records, and background check.\n\n` +
        `3. You shall maintain confidentiality of all company information and intellectual property.\n\n` +
        `4. The company reserves the right to transfer you to any department or location as per business requirements.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `We congratulate you on this appointment and look forward to your contributions. Please retain this letter for your records.\n\nYours sincerely,`
      );

    case "experience_letter":
      return (
        salutation +
        `This is to certify that ${recipientName} was employed at Prolx Digital Agency as ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""}, ` +
        `from ${content.joining_date || "_____"} to ${content.leaving_date || "_____"}.\n\n` +
        `During the tenure, ${recipientName} demonstrated ${content.performance || "good"} performance and professional conduct. They made valuable contributions to the organization and displayed commendable work ethic, teamwork, and dedication.\n\n` +
        `${recipientName} has been relieved of all duties and responsibilities and has settled all dues with the organization. There are no outstanding obligations from either party.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `We wish them all the best in their future endeavors. This letter is issued upon request for official purposes.\n\nYours sincerely,`
      );

    case "termination_letter":
      return (
        salutation +
        `We regret to inform you that your employment with Prolx Digital Agency as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} is hereby terminated, effective ${content.termination_date || "_____"}.\n\n` +
        `Reason for Termination: ${content.reason || "_____"}.\n\n` +
        (content.reason_details ? `Details: ${content.reason_details}\n\n` : "") +
        (content.notice_period ? `Notice Period: ${content.notice_period} has been provided as per company policy and applicable labor laws.\n\n` : "") +
        `FINAL SETTLEMENT & OBLIGATIONS:\n\n` +
        `1. Final Settlement: All pending salary, earned leave encashment, and other dues (if any) will be processed and disbursed within 30 days of your last working date, after necessary deductions.\n\n` +
        `2. Return of Company Property: You are required to return all company property including but not limited to: laptop, access cards, keys, documents, and any other company assets in your possession within 3 working days.\n\n` +
        `3. Access Revocation: Your access to company email, systems, code repositories, and building premises will be revoked on your last working day.\n\n` +
        `4. Confidentiality: Your obligation to maintain confidentiality regarding company information, trade secrets, and client data continues even after termination as per your employment agreement.\n\n` +
        `5. Non-Compete & Non-Solicitation: The non-compete and non-solicitation clauses from your employment agreement remain in effect for the specified duration.\n\n` +
        `6. Exit Clearance: Please complete the exit clearance process including handover of ongoing projects, knowledge transfer, and signing of all necessary documents.\n\n` +
        (content.settlement_details ? `Settlement Details: ${content.settlement_details}\n\n` : "") +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `If you have any concerns, please contact the HR department.\n\nYours sincerely,`
      );

    case "promotion_letter":
      return (
        salutation +
        `We are pleased to inform you that, in recognition of your outstanding performance, dedication, and valuable contributions to Prolx Digital Agency, you have been promoted.\n\n` +
        `Current Position: ${content.current_position || "_____"}\n` +
        `New Position: ${content.new_position || "_____"}\n` +
        (content.department ? `Department: ${content.department}\n` : "") +
        `Effective Date: ${content.effective_date || "_____"}\n` +
        (content.new_salary ? `Revised Monthly Salary: PKR ${content.new_salary}\n` : "") +
        (content.reporting_to ? `Reporting To: ${content.reporting_to}\n` : "") +
        `\n` +
        `TERMS & CONDITIONS:\n\n` +
        `1. Responsibilities: With this promotion, you will assume additional responsibilities commensurate with your new role. A detailed role description will be shared separately.\n\n` +
        `2. Revised Compensation: Your revised compensation package is effective from the date mentioned above. All other terms and conditions of your employment remain unchanged unless specifically modified.\n\n` +
        `3. Performance Expectations: Continued high performance is expected. Your progress in the new role will be reviewed after 3 months.\n\n` +
        `4. All existing employment terms including confidentiality, intellectual property, and non-compete clauses continue to apply.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `Congratulations on this well-deserved achievement. We look forward to your continued success.\n\nYours sincerely,`
      );

    case "warning_letter":
      return (
        salutation +
        `This letter serves as a ${content.warning_type || "formal warning"} regarding your conduct and/or performance as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.\n\n` +
        (content.incident_date ? `Date of Incident: ${content.incident_date}\n\n` : "") +
        `Nature of Violation:\n${content.violation || "_____"}\n\n` +
        `Expected Corrective Action:\n${content.corrective_action || "_____"}\n\n` +
        (content.deadline ? `You are expected to demonstrate improvement by ${content.deadline}.\n\n` : "") +
        `IMPORTANT NOTICE:\n\n` +
        `1. This warning will be documented in your personnel file and may be referenced in future performance evaluations.\n\n` +
        `2. Failure to comply with the corrective measures outlined above may result in further disciplinary action, up to and including termination of employment.\n\n` +
        (content.consequences ? `3. Consequences of Non-Compliance: ${content.consequences}\n\n` : "") +
        `3. You have the right to submit a written response to this warning within 5 business days, which will be attached to this letter in your file.\n\n` +
        `4. If you require any support, training, or clarification to address the issues raised, please discuss with your manager or the HR department.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `We value your contributions and expect this matter to be resolved promptly.\n\nYours sincerely,`
      );

    case "nda_agreement":
      return (
        salutation +
        `This Non-Disclosure Agreement ("Agreement") is entered into by and between Prolx Digital Agency ("Company") and ${recipientName} ("Receiving Party")${content.position ? `, holding the position of ${content.position}` : ""}.\n\n` +
        `Effective Date: ${content.effective_date || "_____"}\n` +
        `Duration: ${content.duration_years || "_____"} year(s) from the effective date\n` +
        (content.project_name ? `Project/Client: ${content.project_name}\n` : "") +
        `\n` +
        `TERMS & CONDITIONS:\n\n` +
        `1. DEFINITION OF CONFIDENTIAL INFORMATION:\n` +
        `Confidential Information includes, but is not limited to: source code, algorithms, software architecture, database schemas, API keys, client lists, business strategies, financial data, marketing plans, unreleased products, project roadmaps, employee data, and any proprietary information disclosed by the Company.\n` +
        (content.scope ? `\nSpecific Scope: ${content.scope}\n` : "") +
        `\n` +
        `2. OBLIGATIONS OF RECEIVING PARTY:\n` +
        `(a) The Receiving Party shall maintain the confidentiality of all Confidential Information and shall not disclose it to any third party without prior written consent.\n` +
        `(b) The Receiving Party shall use Confidential Information solely for purposes related to their role at Prolx Digital Agency.\n` +
        `(c) The Receiving Party shall take all reasonable measures to prevent unauthorized disclosure or use.\n\n` +
        `3. PERMITTED DISCLOSURES:\n` +
        `Disclosure is permitted only: (a) with written consent from the Company, (b) when required by law or court order (with prior notice to the Company), or (c) when the information becomes publicly available through no fault of the Receiving Party.\n\n` +
        `4. RETURN OF MATERIALS:\n` +
        `Upon termination of this agreement or upon request, the Receiving Party shall return or destroy all Confidential Information, including digital copies, documents, and notes.\n\n` +
        `5. INTELLECTUAL PROPERTY:\n` +
        `All intellectual property created using or based on Confidential Information remains the exclusive property of Prolx Digital Agency.\n\n` +
        `6. REMEDIES FOR BREACH:\n` +
        `Any breach of this Agreement may result in legal action, including but not limited to: injunctive relief, monetary damages, and termination of employment or contract.\n\n` +
        `7. DURATION:\n` +
        `This Agreement shall remain in force for ${content.duration_years || "_____"} year(s) from the Effective Date, and shall survive the termination of the Receiving Party's engagement with the Company.\n\n` +
        (content.governing_law ? `8. GOVERNING LAW:\nThis Agreement shall be governed by the laws of ${content.governing_law}.\n\n` : "") +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `By signing below, both parties acknowledge and agree to the terms stated above.\n\nFor Prolx Digital Agency,`
      );

    case "relieving_letter":
      return (
        salutation +
        `This is to confirm that ${recipientName} has been relieved from the position of ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""} at Prolx Digital Agency, effective ${content.last_working_date || "_____"}.\n\n` +
        `Date of Joining: ${content.joining_date || "_____"}\n` +
        `Last Working Date: ${content.last_working_date || "_____"}\n` +
        (content.resignation_date ? `Resignation Submitted: ${content.resignation_date}\n` : "") +
        `\n` +
        `${recipientName} has duly served the required notice period and completed all handover formalities. All company property has been returned and there are no outstanding dues from either party.\n\n` +
        (content.performance ? `During the tenure at Prolx Digital Agency, ${recipientName} demonstrated ${content.performance} performance and maintained professional standards.\n\n` : "") +
        `CLEARANCE CONFIRMATION:\n\n` +
        `1. All pending salaries and benefits have been settled.\n` +
        `2. All company assets (laptop, access cards, documents) have been returned.\n` +
        `3. All project handovers have been completed satisfactorily.\n` +
        `4. There are no objections to the release of the employee.\n\n` +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `We wish ${recipientName} all the best in future endeavors. This letter is issued for official records.\n\nYours sincerely,`
      );

    case "salary_certificate":
      return (
        salutation +
        `This is to certify that ${recipientName} is a regular employee of Prolx Digital Agency, currently serving as ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""}.\n\n` +
        `Their monthly gross salary for ${content.month_year || "_____"} is PKR ${content.salary || "_____"}.\n\n` +
        (content.bank_name ? `This salary is disbursed via ${content.bank_name}${content.account_number ? `, Account No: ${content.account_number}` : ""}.\n\n` : "") +
        (content.extra_notes ? `${content.extra_notes}\n\n` : "") +
        `This certificate is issued on request of the employee for official purposes.\n\nYours sincerely,`
      );

    case "custom":
    default:
      return salutation + (content.body || "") + "\n\nYours sincerely,";
  }
}
