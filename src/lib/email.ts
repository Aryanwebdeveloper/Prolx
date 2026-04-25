// ============================================================
// Prolx Email Service — Premium Branded Templates
// Uses Resend. Graceful fallback if API key not set.
// NO rejected-application emails. Rejection is logged only.
// ============================================================

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_your_key_here"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = `Prolx Digital Agency <${process.env.RESEND_FROM_EMAIL || "no-reply@prolx.cloud"}>`;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.cloud";
const LOGO_BG = "#0D9488";

export const ADMIN_EMAIL = "prolxcontact@gmail.com";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// ── Core sender with retry (up to 3 attempts) ──────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    console.log(`[Prolx Email — No API Key] To: ${payload.to} | Subject: ${payload.subject}`);
    return { id: `mock-${Date.now()}` };
  }

  let lastError: string | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      if (error) {
        lastError = error.message;
        if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 800));
        continue;
      }
      return { id: data?.id };
    } catch (err: any) {
      lastError = err?.message || "Unknown error";
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 800));
    }
  }
  console.error(`[Prolx Email] Failed after 3 attempts: ${lastError}`);
  return { error: lastError };
}

// ── Base layout ────────────────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Prolx</title></head>
<body style="margin:0;padding:0;background:#F0FDFA;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDFA;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(13,148,136,0.12);">
<!-- HEADER -->
<tr><td style="background:linear-gradient(135deg,#0D9488 0%,#065F46 100%);padding:32px 40px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td><table cellpadding="0" cellspacing="0"><tr>
<td style="background:rgba(255,255,255,0.18);border-radius:10px;padding:8px 14px;"><span style="font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;">Px</span></td>
<td style="padding-left:12px;"><span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Prolx</span></td>
</tr></table></td>
<td align="right"><span style="font-size:12px;color:rgba(255,255,255,0.7);">Digital Agency</span></td>
</tr></table>
</td></tr>
<!-- BODY -->
<tr><td style="padding:40px;">${body}</td></tr>
<!-- FOOTER -->
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:28px 40px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td align="center">
<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#0D9488;">Prolx Digital Agency</p>
<p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">Premium Web Development &amp; Digital Products</p>
<p style="margin:0 0 12px;font-size:11px;color:#94A3B8;">Office 404, Tech District, Lahore, Pakistan</p>
<p style="margin:0;font-size:12px;"><a href="${SITE}" style="color:#0D9488;text-decoration:none;">${SITE}</a></p>
<p style="margin:16px 0 0;font-size:11px;color:#CBD5E1;line-height:1.5;">You are receiving this email because of a recent interaction with Prolx.<br/>This is an automated transactional message. Please do not reply directly to this email.</p>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function greeting(name: string): string {
  return `<p style="font-size:16px;color:#475569;margin:0 0 20px 0;">Hi <strong style="color:#0F172A;">${name}</strong>,</p>`;
}

function badge(text: string, bg: string, emoji: string): string {
  return `<div style="display:inline-block;padding:8px 20px;border-radius:100px;background:${bg};font-size:13px;font-weight:700;color:#fff;margin-bottom:20px;letter-spacing:0.3px;">${emoji}&nbsp;&nbsp;${text}</div>`;
}

function ctaButton(label: string, href: string, color = "#0D9488", showWhatsapp = true): string {
  const whatsappUrl = "https://wa.me/923300356046";
  const whatsappBtn = showWhatsapp ? `<br/><a href="${whatsappUrl}" style="display:inline-block;padding:14px 36px;background:#25D366;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.2px;margin-top:12px;">💬 Contact us on WhatsApp</a>` : "";
  
  return `<div style="text-align:center;margin:28px 0;">
<a href="${href}" style="display:inline-block;padding:14px 36px;background:${color};color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
${label}
</a>${whatsappBtn}
</div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;"/>`;
}

function infoRow(icon: string, label: string, value: string): string {
  return `<tr>
<td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;font-size:16px;">${icon}</td>
<td><span style="font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;">${label}</span><br/><span style="font-size:14px;font-weight:600;color:#0F172A;">${value}</span></td>
</tr></table>
</td></tr>`;
}

function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:4px 16px;margin:20px 0;">${rows}</table>`;
}

// ── Template: Application Received ────────────────────────────────────────
export function applicationReceivedTemplate(d: { name: string; role: string }): string {
  return wrap(`
${greeting(d.name)}
${badge("Application Received", "#0D9488", "✅")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Thank you for applying!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">We have successfully received your application for the <strong style="color:#0F172A;">${d.role}</strong> position at Prolx Digital Agency.</p>
${infoTable(
  infoRow("💼", "Position Applied", d.role) +
  infoRow("📅", "Application Status", "Under Review") +
  infoRow("⏱️", "Response Time", "5–7 Business Days")
)}
<div style="background:#F0FDFA;border-left:4px solid #0D9488;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
<p style="margin:0;font-size:14px;font-weight:700;color:#0F172A;">What happens next?</p>
<ul style="margin:8px 0 0;padding-left:18px;color:#475569;font-size:14px;line-height:2;">
<li>Our team will carefully review your application</li>
<li>Shortlisted candidates will be contacted for an interview</li>
<li>You will receive email updates at each stage</li>
</ul>
</div>
${ctaButton("Visit Prolx Digital Agency →", SITE)}
`);
}

// ── Template: Shortlisted ─────────────────────────────────────────────────
export function shortlistedTemplate(d: { name: string; role: string }): string {
  return wrap(`
${greeting(d.name)}
${badge("You've Been Shortlisted!", "#10B981", "🎉")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Great news — you're moving forward!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">After reviewing your application for the <strong style="color:#0F172A;">${d.role}</strong> position, we are pleased to inform you that you have been <strong>shortlisted</strong> for the next stage of our recruitment process.</p>
${infoTable(
  infoRow("💼", "Position", d.role) +
  infoRow("📊", "New Status", "Shortlisted — Moving Forward")
)}
<div style="background:#F0FFF4;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
<p style="margin:0;font-size:14px;color:#065F46;font-weight:600;">🌟 Our team will contact you shortly with the next steps. Please keep an eye on your inbox!</p>
</div>
${ctaButton("Explore Prolx →", SITE, "#10B981")}
`);
}

// ── Template: Interview Scheduled (Online or Physical) ────────────────────
export function interviewScheduledTemplate(d: {
  name: string;
  role: string;
  interviewDate: string;
  interviewType: string;
  interviewMode?: string;
  meetingLink?: string;
  officeAddress?: string;
}): string {
  const isOnline = d.interviewMode ? d.interviewMode !== "Physical" : (d.interviewType !== "In-Person" && d.interviewType !== "Physical");
  const locationBlock = isOnline
    ? (d.meetingLink
      ? `${infoRow("🔗", "Meeting Link", `<a href="${d.meetingLink}" style="color:#6366F1;word-break:break-all;">${d.meetingLink}</a>`)}`
      : infoRow("💻", "Format", "Online — Link will be shared separately"))
    : infoRow("📍", "Office Address", d.officeAddress || "Prolx Digital Agency — Address will be shared via email");

  const primaryBtnText = isOnline && d.meetingLink ? "Join Interview →" : (!isOnline && d.officeAddress ? "Get Directions →" : "View Details →");
  const primaryBtnLink = isOnline && d.meetingLink ? d.meetingLink : (!isOnline && d.officeAddress ? `https://maps.google.com/?q=${encodeURIComponent(d.officeAddress)}` : SITE);

  return wrap(`
${greeting(d.name)}
${badge("Interview Scheduled", "#6366F1", "📅")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">You're invited for an interview!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;">We are excited to invite you for an interview for the <strong style="color:#0F172A;">${d.role}</strong> position at Prolx Digital Agency. Please find the details below:</p>
${infoTable(
  infoRow("💼", "Position", d.role) +
  infoRow("📅", "Date & Time", d.interviewDate) +
  infoRow("💻", "Interview Format", d.interviewType) +
  locationBlock
)}
${ctaButton(primaryBtnText, primaryBtnLink, "#6366F1")}
<p style="font-size:13px;color:#94A3B8;text-align:center;margin:0;">Please confirm your availability by replying to this email or contact us on WhatsApp if you have any queries.</p>
`);
}

// ── Template: Hired ────────────────────────────────────────────────────────
export function hiredTemplate(d: { name: string; role: string }): string {
  return wrap(`
${greeting(d.name)}
${badge("Welcome to the Prolx Team!", "#0D9488", "🎊")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Congratulations — You're hired! 🎉</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">We are thrilled to offer you the <strong style="color:#0F172A;">${d.role}</strong> position at Prolx Digital Agency. After a thorough evaluation, we are confident you are the perfect addition to our team!</p>
${infoTable(
  infoRow("💼", "Position Offered", d.role) +
  infoRow("🏢", "Company", "Prolx Digital Agency") +
  infoRow("📋", "Next Step", "HR will contact you within 24–48 hours")
)}
<div style="background:#F0FDFA;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
<p style="margin:0 0 8px;font-size:22px;">🚀</p>
<p style="margin:0;font-size:15px;font-weight:700;color:#0D9488;">Welcome to the family!</p>
<p style="margin:4px 0 0;font-size:13px;color:#475569;">Our HR team will reach out with onboarding details, contract, and your first-day schedule.</p>
</div>
${ctaButton("Visit Prolx →", SITE)}
`);
}

// ── Template: Contact Form Confirmation ───────────────────────────────────
export function contactConfirmationTemplate(d: { name: string; service?: string; message?: string }): string {
  return wrap(`
${greeting(d.name)}
${badge("Message Received", "#0D9488", "📬")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Thanks for reaching out!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">We have received your message and our team will get back to you within <strong>1–2 business days</strong>. For a faster response, feel free to drop us a message on WhatsApp!</p>
${infoTable(
  (d.service ? infoRow("🛠️", "Service Interested In", d.service) : "") +
  infoRow("⏱️", "Expected Response", "1–2 Business Days") +
  infoRow("📧", "Response Will Be Sent To", "Your registered email")
)}
${d.message ? `<div style="background:#F8FAFC;border-radius:12px;padding:16px 20px;margin:20px 0;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;">Your Message</p><p style="margin:0;font-size:14px;color:#475569;font-style:italic;line-height:1.7;">"${d.message}"</p></div>` : ""}

${ctaButton("Visit Prolx →", SITE)}
`);
}

// ── Template: Booking Confirmation ────────────────────────────────────────
export function bookingConfirmationTemplate(d: {
  name: string;
  consultationType: string;
  date: string;
  time: string;
}): string {
  return wrap(`
${greeting(d.name)}
${badge("Consultation Booked!", "#6366F1", "📅")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Your consultation is confirmed!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;">We're looking forward to speaking with you. Here are your booking details:</p>
${infoTable(
  infoRow("🎯", "Consultation Type", d.consultationType) +
  infoRow("📅", "Date", d.date) +
  infoRow("🕐", "Time", d.time) +
  infoRow("💻", "Format", "Video Call — Link will be sent shortly")
)}
<div style="background:#EEF2FF;border-radius:12px;padding:18px 20px;margin:20px 0;">
<p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#312E81;">📋 Before your call:</p>
<ul style="margin:0;padding-left:18px;color:#4338CA;font-size:14px;line-height:2;">
<li>Prepare a brief overview of your project</li>
<li>Have your budget and timeline in mind</li>
<li>Write down any specific questions you have for us</li>
</ul>
</div>
${ctaButton("View Our Portfolio →", `${SITE}/portfolio`, "#6366F1")}
`);
}

// ── Template: Invoice Sent ────────────────────────────────────────────────
export function invoiceSentTemplate(d: {
  name: string;
  invoiceId: string;
  amount: string;
  dueDate: string;
  items?: string;
}): string {
  return wrap(`
${greeting(d.name)}
${badge("Invoice Ready", "#F59E0B", "🧾")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Your invoice is ready</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;">Please find your invoice details below. Kindly make payment before the due date.</p>
${infoTable(
  infoRow("🧾", "Invoice Number", d.invoiceId) +
  infoRow("💰", "Amount Due", d.amount) +
  infoRow("📅", "Due Date", d.dueDate) +
  infoRow("🏢", "Issued By", "Prolx Digital Agency")
)}
${d.items ? `<div style="background:#FFFBEB;border-radius:12px;padding:16px 20px;margin:20px 0;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.8px;">Invoice Items</p><p style="margin:0;font-size:13px;color:#78350F;line-height:1.8;">${d.items}</p></div>` : ""}
<div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:0 12px 12px 0;padding:14px 18px;margin:20px 0;">
<p style="margin:0;font-size:13px;color:#92400E;">For any invoice queries, please reply to this email or contact us at <a href="${SITE}/contact" style="color:#D97706;">${SITE}/contact</a></p>
</div>
${ctaButton("Pay Invoice →", SITE, "#F59E0B")}
`);
}

// ── Template: Certificate Issued ──────────────────────────────────────────
export function certificateIssuedTemplate(d: {
  name: string;
  title: string;
  certId: string;
  issueDate: string;
  category?: string;
}): string {
  const verifyUrl = `${SITE}/certificates?id=${d.certId}`;
  return wrap(`
${greeting(d.name)}
${badge("Certificate Issued", "#8B5CF6", "🏆")}
<h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0 0 12px;line-height:1.3;">Your certificate is ready!</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;">Congratulations! Your official certificate has been issued by Prolx Digital Agency. You can view and verify it using the details below.</p>
<div style="background:linear-gradient(135deg,#EDE9FE 0%,#F5F3FF 100%);border:2px solid #8B5CF6;border-radius:16px;padding:24px;margin:20px 0;text-align:center;">
<p style="margin:0 0 6px;font-size:13px;color:#7C3AED;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Certificate of Achievement</p>
<p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#0F172A;">${d.title}</p>
<p style="margin:0 0 16px;font-size:14px;color:#475569;">Awarded to <strong>${d.name}</strong></p>
<div style="display:inline-block;background:rgba(139,92,246,0.1);border-radius:8px;padding:6px 16px;">
<span style="font-size:12px;font-weight:700;color:#6D28D9;letter-spacing:1px;">ID: ${d.certId}</span>
</div>
</div>
${infoTable(
  infoRow("📜", "Certificate Title", d.title) +
  infoRow("📅", "Issue Date", d.issueDate) +
  (d.category ? infoRow("🏷️", "Category", d.category) : "") +
  infoRow("🔐", "Certificate ID", d.certId)
)}
${ctaButton("View & Verify Certificate →", verifyUrl, "#8B5CF6")}
<p style="font-size:13px;color:#94A3B8;text-align:center;margin:0;">Share your achievement by using the verification link above.</p>
`);
}

// ── Template: Custom Email ─────────────────────────────────────────────────
export function customEmailTemplate(d: { name: string; body: string }): string {
  const lines = d.body.split("\n").map(l =>
    `<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 10px;">${l || "&nbsp;"}</p>`
  ).join("");
  return wrap(`
${greeting(d.name)}
${divider()}
${lines}
${divider()}
${ctaButton("Visit Prolx →", SITE)}
`);
}

// ── Template: Admin Notification ──────────────────────────────────────────
export function adminNotificationTemplate(d: {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}): string {
  return wrap(`
${badge("Admin Notification", "#0F172A", "🔔")}
<h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 12px;">${d.title}</h1>
<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;">${d.message}</p>
${d.actionLabel && d.actionUrl ? ctaButton(d.actionLabel, d.actionUrl, "#0F172A", false) : ""}
`);
}
