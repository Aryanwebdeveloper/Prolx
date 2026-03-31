// Client-side DOCX generation using the docx package
// Generates .docx files as Blob downloads in the browser

import type { LetterType } from "@/types/erp";

async function getDocx() {
  const docx = await import("docx");
  return docx;
}

// ── Load stamp as ArrayBuffer for DOCX embedding ──
let stampBufferCache: ArrayBuffer | null = null;

async function loadStampBuffer(): Promise<ArrayBuffer | null> {
  if (stampBufferCache) return stampBufferCache;
  try {
    const response = await fetch("/ProlxStampsBD.png");
    const buffer = await response.arrayBuffer();
    stampBufferCache = buffer;
    return buffer;
  } catch {
    return null;
  }
}

export async function generateLetterDOCX(params: {
  letterId: string;
  letterType: LetterType;
  recipientName: string;
  subject: string;
  content: Record<string, string>;
  date: string;
}): Promise<Blob> {
  const {
    Document, Packer, Paragraph, TextRun, AlignmentType,
    HeadingLevel, BorderStyle, Table, TableRow, TableCell,
    WidthType, ShadingType, Header, ImageRun,
  } = await getDocx();

  const teal = "0D9488";
  const dark = "0F172A";

  // Build body paragraphs based on letter type
  const bodyText = buildDocxLetterBody(params.letterType, params.content, params.recipientName);

  // Load stamp image
  const stampBuffer = await loadStampBuffer();

  const stampParagraphs: InstanceType<typeof Paragraph>[] = [];
  if (stampBuffer) {
    stampParagraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: stampBuffer,
            transformation: { width: 150, height: 150 },
            type: "png",
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROLX DIGITAL AGENCY",
                    bold: true,
                    size: 36,
                    color: "FFFFFF",
                  }),
                ],
                shading: {
                  type: ShadingType.CLEAR,
                  fill: teal,
                  color: "auto",
                },
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "info@prolx.com | www.prolx.com",
                    size: 18,
                    color: "FFFFFF",
                  }),
                  new TextRun({ text: " | Ref: ", size: 18, color: "FFFFFF" }),
                  new TextRun({ text: params.letterId, size: 18, color: "FFFFFF", bold: true }),
                ],
                shading: { type: ShadingType.CLEAR, fill: teal, color: "auto" },
                spacing: { after: 200 },
              }),
            ],
          }),
        },
        children: [
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${params.date || new Date().toLocaleDateString("en-GB")}`,
                size: 20,
                color: "64748B",
              }),
            ],
            spacing: { before: 200, after: 300 },
          }),

          // Recipient
          new Paragraph({
            children: [new TextRun({ text: params.recipientName, bold: true, size: 24, color: dark })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Prolx Digital Agency", size: 20, color: "64748B" })],
            spacing: { after: 400 },
          }),

          // Subject line
          new Paragraph({
            children: [new TextRun({ text: `Subject: ${params.subject}`, bold: true, size: 24, color: dark })],
            border: {
              bottom: { style: BorderStyle.SINGLE, color: teal, size: 4 },
            },
            spacing: { after: 300 },
          }),

          // Body
          ...bodyText.map(
            (line) => {
              // Check if line is a heading (all caps or starts with number followed by period)
              const isHeading = /^(TERMS|INTERNSHIP|PAID|FINAL|IMPORTANT|CLEARANCE|DEFINITION|NDA|\d+\.)/.test(line) && line.length < 80;
              return new Paragraph({
                children: [new TextRun({ 
                  text: line, 
                  size: isHeading ? 22 : 22, 
                  color: dark,
                  bold: isHeading,
                })],
                spacing: { after: line === "" ? 100 : 200 },
                alignment: AlignmentType.JUSTIFIED,
              });
            }
          ),

          // Spacing before signature
          new Paragraph({ spacing: { before: 600 } }),

          // Signature
          new Paragraph({
            children: [new TextRun({ text: "Yours sincerely,", size: 22, color: dark })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "________________________", size: 22, color: dark })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Authorized Signatory", bold: true, size: 22, color: dark })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Prolx Digital Agency", size: 20, color: "64748B" })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Human Resources Department", size: 20, color: "64748B" })],
            spacing: { after: 200 },
          }),

          // Stamp image
          ...stampParagraphs,

          // Verification line
          new Paragraph({
            children: [
              new TextRun({
                text: `Document Ref: ${params.letterId} | Generated: ${new Date().toLocaleDateString("en-GB")} | Digitally verified by Prolx Digital Agency`,
                size: 14,
                color: "94A3B8",
                italics: true,
              }),
            ],
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}

function buildDocxLetterBody(
  type: LetterType,
  content: Record<string, string>,
  recipientName: string
): string[] {
  const salutation = `Dear ${recipientName},`;

  switch (type) {
    case "offer_letter":
      return [
        salutation,
        "",
        `We are pleased to offer you the position of ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.`,
        "",
        `Your monthly compensation will be PKR ${content.salary || "_____"}. Your employment will commence on ${content.start_date || "_____"}.${content.probation_months ? ` There will be a probation period of ${content.probation_months} month(s), during which either party may terminate the employment with a 7-day written notice.` : ""}`,
        "",
        ...(content.reporting_to ? [`You will report directly to ${content.reporting_to}.`, ""] : []),
        ...(content.office_location ? [`Your primary work location will be at ${content.office_location}.`, ""] : []),
        "TERMS & CONDITIONS:",
        "",
        "1. Employment Nature: Your employment is on a full-time basis. You are expected to devote your full professional attention to the duties assigned. Any outside employment or freelance work must be pre-approved by management.",
        "",
        "2. Working Hours: Standard working hours are Monday to Friday, 9:00 AM to 6:00 PM, with a one-hour break. Overtime may be required as per project needs.",
        "",
        "3. Compensation & Benefits: Your salary will be disbursed on the last working day of each month via bank transfer. All applicable statutory deductions will be withheld as per the laws of Pakistan.",
        "",
        "4. Leave Policy: You are entitled to annual leaves, casual leaves, and sick leaves as per the company leave policy.",
        "",
        "5. Confidentiality: You agree to maintain strict confidentiality regarding all proprietary information, trade secrets, client data, source code, and business strategies. This obligation survives termination.",
        "",
        "6. Intellectual Property: All work product, code, designs, and creative materials developed during your employment shall be the exclusive property of Prolx Digital Agency.",
        "",
        "7. Non-Compete: During employment and for 6 months after termination, you agree not to engage in competing business or solicit company clients.",
        "",
        "8. Termination: Either party may terminate by providing 30-day written notice or payment in lieu thereof.",
        "",
        "9. Code of Conduct: You are expected to maintain professional conduct, integrity, and adherence to all company policies.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "Please confirm your acceptance by signing and returning a copy of this letter within 7 business days.",
        "",
        "We look forward to having you as part of the Prolx team.",
      ];

    case "internship_letter":
      return [
        salutation,
        "",
        `We are pleased to offer you an internship position as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.`,
        "",
        `Internship Duration: ${content.duration || "_____"}, commencing from ${content.start_date || "_____"}${content.end_date ? ` until ${content.end_date}` : ""}.`,
        "",
        ...(content.working_hours ? [`Working Hours: ${content.working_hours}.`, ""] : []),
        ...(content.mentor_name ? [`Mentor: ${content.mentor_name}.`, ""] : []),
        ...(content.reporting_to ? [`Reporting To: ${content.reporting_to}.`, ""] : []),
        ...(content.office_location ? [`Work Location: ${content.office_location}.`, ""] : []),
        "INTERNSHIP TERMS & CONDITIONS:",
        "",
        "1. Nature of Internship: This is an unpaid internship designed to provide practical experience and professional development. This does not constitute an employment relationship.",
        "",
        "2. Learning Objectives: You will be exposed to real-world projects, industry best practices, and professional methodologies with hands-on training and mentorship.",
        "",
        "3. Attendance: Regular attendance is mandatory. Maintain at least 80% attendance throughout the internship.",
        "",
        "4. Professional Conduct: Dress appropriately, behave professionally, and respect workplace policies.",
        "",
        "5. Confidentiality: Keep all proprietary information, client data, project details, and source code strictly confidential during and after the internship.",
        "",
        "6. Intellectual Property: All work created during the internship is the exclusive property of Prolx Digital Agency.",
        "",
        "7. Evaluation: Performance will be evaluated periodically with a formal review at the end.",
        "",
        "8. Certificate: Upon successful completion, you will receive an official Internship Completion Certificate.",
        "",
        "9. Termination: Either party may terminate with 7 days written notice.",
        "",
        "10. No Employment Guarantee: This internship does not guarantee subsequent employment.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "Please confirm your acceptance by signing and returning a copy of this letter.",
      ];

    case "paid_internship_letter":
      return [
        salutation,
        "",
        `We are pleased to offer you a paid internship position as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.`,
        "",
        `Internship Duration: ${content.duration || "_____"}, commencing from ${content.start_date || "_____"}${content.end_date ? ` until ${content.end_date}` : ""}.`,
        "",
        `Monthly Stipend: PKR ${content.stipend || "_____"}${content.payment_schedule ? `, payable ${content.payment_schedule}` : ", payable Monthly"}.`,
        "",
        ...(content.working_hours ? [`Working Hours: ${content.working_hours}.`, ""] : []),
        ...(content.mentor_name ? [`Mentor: ${content.mentor_name}.`, ""] : []),
        ...(content.reporting_to ? [`Reporting To: ${content.reporting_to}.`, ""] : []),
        ...(content.office_location ? [`Work Location: ${content.office_location}.`, ""] : []),
        "PAID INTERNSHIP TERMS & CONDITIONS:",
        "",
        "1. Nature: This is a paid internship for practical experience. The stipend is a learning allowance, not an employment salary.",
        "",
        `2. Stipend & Payment: Monthly stipend of PKR ${content.stipend || "_____"} disbursed ${content.payment_schedule || "monthly"} via bank transfer. Tax deductions apply as per law.`,
        "",
        "3. Learning Objectives: You will work on real projects with mentorship, code reviews, and skill development workshops.",
        "",
        "4. Attendance: Maintain at least 80% attendance. Stipend deductions may apply for unexcused absences.",
        "",
        "5. Professional Conduct: Maintain professional behavior and respect company policies.",
        "",
        "6. Confidentiality: Maintain strict confidentiality regarding all proprietary information. This obligation continues after the internship.",
        "",
        "7. Intellectual Property: All work product is the exclusive property of Prolx Digital Agency.",
        "",
        "8. Evaluation: Performance reviewed periodically. Final evaluation determines certificate grade.",
        "",
        "9. Certificate: Upon completion, receive an official Paid Internship Completion Certificate.",
        "",
        "10. Termination: Either party may terminate with 7 days notice. Stipend calculated pro-rata.",
        "",
        "11. No Employment Guarantee: Outstanding performers may be considered for permanent roles.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "Please confirm your acceptance by signing and returning a copy of this letter.",
      ];

    case "appointment_letter":
      return [
        salutation,
        "",
        `We are delighted to appoint you as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} at Prolx Digital Agency.`,
        "",
        `Your joining date is ${content.joining_date || "_____"}, with employment type: ${content.employment_type || "Full-time"}.${content.salary ? ` Your monthly salary will be PKR ${content.salary}.` : ""}`,
        "",
        "TERMS & CONDITIONS:",
        "",
        "1. You are expected to abide by all company rules, regulations, and policies.",
        "",
        "2. Your appointment is subject to satisfactory verification of qualifications and background.",
        "",
        "3. Maintain confidentiality of all company information and intellectual property.",
        "",
        "4. The company reserves the right to transfer you as per business requirements.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "We congratulate you on this appointment and look forward to your contributions.",
      ];

    case "experience_letter":
      return [
        salutation,
        "",
        `This is to certify that ${recipientName} was employed at Prolx Digital Agency as ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""}, from ${content.joining_date || "_____"} to ${content.leaving_date || "_____"}.`,
        "",
        `During the tenure, ${recipientName} demonstrated ${content.performance || "good"} performance and professional conduct. They made valuable contributions to the organization.`,
        "",
        `${recipientName} has been relieved of all duties and there are no outstanding obligations from either party.`,
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "We wish them all the best in their future endeavors.",
      ];

    case "termination_letter":
      return [
        salutation,
        "",
        `We regret to inform you that your employment with Prolx Digital Agency as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""} is hereby terminated, effective ${content.termination_date || "_____"}.`,
        "",
        `Reason for Termination: ${content.reason || "_____"}.`,
        "",
        ...(content.reason_details ? [`Details: ${content.reason_details}`, ""] : []),
        ...(content.notice_period ? [`Notice Period: ${content.notice_period} has been provided as per company policy.`, ""] : []),
        "FINAL SETTLEMENT & OBLIGATIONS:",
        "",
        "1. Final Settlement: Pending salary and dues will be processed within 30 days after deductions.",
        "",
        "2. Return of Property: Return all company property (laptop, access cards, documents) within 3 working days.",
        "",
        "3. Access Revocation: System and building access will be revoked on your last working day.",
        "",
        "4. Confidentiality: Your confidentiality obligations continue after termination.",
        "",
        "5. Non-Compete: Non-compete clauses remain in effect for the specified duration.",
        "",
        "6. Exit Clearance: Complete exit clearance including handover and knowledge transfer.",
        "",
        ...(content.settlement_details ? [`Settlement Details: ${content.settlement_details}`, ""] : []),
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "If you have concerns, please contact the HR department.",
      ];

    case "promotion_letter":
      return [
        salutation,
        "",
        "We are pleased to inform you that, in recognition of your outstanding performance and contributions, you have been promoted.",
        "",
        `Current Position: ${content.current_position || "_____"}`,
        `New Position: ${content.new_position || "_____"}`,
        ...(content.department ? [`Department: ${content.department}`] : []),
        `Effective Date: ${content.effective_date || "_____"}`,
        ...(content.new_salary ? [`Revised Monthly Salary: PKR ${content.new_salary}`] : []),
        ...(content.reporting_to ? [`Reporting To: ${content.reporting_to}`] : []),
        "",
        "TERMS & CONDITIONS:",
        "",
        "1. You will assume additional responsibilities commensurate with your new role.",
        "",
        "2. Revised compensation is effective from the date mentioned. Other terms remain unchanged.",
        "",
        "3. Progress will be reviewed after 3 months in the new role.",
        "",
        "4. All existing employment terms including confidentiality and IP clauses continue to apply.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "Congratulations on this well-deserved achievement.",
      ];

    case "warning_letter":
      return [
        salutation,
        "",
        `This letter serves as a ${content.warning_type || "formal warning"} regarding your conduct as ${content.position || "_____"}${content.department ? ` in the ${content.department} department` : ""}.`,
        "",
        ...(content.incident_date ? [`Date of Incident: ${content.incident_date}`, ""] : []),
        `Nature of Violation:`,
        content.violation || "_____",
        "",
        `Expected Corrective Action:`,
        content.corrective_action || "_____",
        "",
        ...(content.deadline ? [`Improvement Deadline: ${content.deadline}`, ""] : []),
        "IMPORTANT NOTICE:",
        "",
        "1. This warning will be documented in your personnel file.",
        "",
        "2. Failure to comply may result in further disciplinary action including termination.",
        "",
        ...(content.consequences ? [`3. Consequences: ${content.consequences}`, ""] : []),
        "3. You may submit a written response within 5 business days.",
        "",
        "4. Contact your manager or HR if you need support to address these issues.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "We value your contributions and expect prompt resolution.",
      ];

    case "nda_agreement":
      return [
        salutation,
        "",
        `This Non-Disclosure Agreement is entered into by Prolx Digital Agency ("Company") and ${recipientName} ("Receiving Party")${content.position ? `, holding the position of ${content.position}` : ""}.`,
        "",
        `Effective Date: ${content.effective_date || "_____"}`,
        `Duration: ${content.duration_years || "_____"} year(s)`,
        ...(content.project_name ? [`Project/Client: ${content.project_name}`] : []),
        "",
        "1. CONFIDENTIAL INFORMATION:",
        "Includes source code, algorithms, software architecture, database schemas, API keys, client lists, business strategies, financial data, and any proprietary information.",
        ...(content.scope ? [`Specific Scope: ${content.scope}`] : []),
        "",
        "2. OBLIGATIONS:",
        "(a) Maintain confidentiality and do not disclose to third parties without written consent.",
        "(b) Use information solely for role-related purposes.",
        "(c) Take reasonable measures to prevent unauthorized disclosure.",
        "",
        "3. PERMITTED DISCLOSURES:",
        "Only with written consent, when required by law (with prior notice), or when information becomes public through no fault of the Receiving Party.",
        "",
        "4. RETURN OF MATERIALS:",
        "Upon termination, return or destroy all Confidential Information including digital copies.",
        "",
        "5. INTELLECTUAL PROPERTY:",
        "All IP created using Confidential Information remains Company property.",
        "",
        "6. REMEDIES FOR BREACH:",
        "Breach may result in legal action including injunctive relief, monetary damages, and termination.",
        "",
        `7. DURATION: This Agreement remains in force for ${content.duration_years || "_____"} year(s) and survives termination of engagement.`,
        "",
        ...(content.governing_law ? [`8. GOVERNING LAW: Governed by the laws of ${content.governing_law}.`, ""] : []),
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "By signing below, both parties acknowledge and agree to these terms.",
      ];

    case "relieving_letter":
      return [
        salutation,
        "",
        `This confirms that ${recipientName} has been relieved from the position of ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""} at Prolx Digital Agency, effective ${content.last_working_date || "_____"}.`,
        "",
        `Date of Joining: ${content.joining_date || "_____"}`,
        `Last Working Date: ${content.last_working_date || "_____"}`,
        ...(content.resignation_date ? [`Resignation Submitted: ${content.resignation_date}`] : []),
        "",
        `${recipientName} has served the required notice period and completed all handover formalities. All company property has been returned.`,
        "",
        ...(content.performance ? [`Performance: ${recipientName} demonstrated ${content.performance} performance during their tenure.`, ""] : []),
        "CLEARANCE CONFIRMATION:",
        "",
        "1. All pending salaries and benefits have been settled.",
        "2. All company assets have been returned.",
        "3. Project handovers completed satisfactorily.",
        "4. No objections to the release of the employee.",
        "",
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        `We wish ${recipientName} all the best in future endeavors.`,
      ];

    case "salary_certificate":
      return [
        salutation,
        "",
        `This is to certify that ${recipientName} is a regular employee of Prolx Digital Agency, currently serving as ${content.position || "_____"}${content.department ? ` in the ${content.department} Department` : ""}.`,
        "",
        `Their monthly gross salary for ${content.month_year || "_____"} is PKR ${content.salary || "_____"}.`,
        "",
        ...(content.bank_name ? [`This salary is disbursed via ${content.bank_name}${content.account_number ? `, Account No: ${content.account_number}` : ""}.`, ""] : []),
        ...(content.extra_notes ? [content.extra_notes, ""] : []),
        "This certificate is issued on request of the employee for official purposes.",
      ];

    case "custom":
    default:
      return [salutation, "", ...(content.body || "").split("\n")];
  }
}
