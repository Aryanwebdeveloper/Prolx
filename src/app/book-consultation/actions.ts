"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";

export async function submitConsultation(payload: {
  type: string;
  date: string;
  time: string;
  name: string;
  email: string;
  company?: string;
  projectDesc: string;
  budget?: string;
  timeline?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      status: "Scheduled",
      type: payload.type,
      date: payload.date,
      time: payload.time,
      name: payload.name,
      email: payload.email,
      company: payload.company,
      project_desc: payload.projectDesc,
      budget: payload.budget,
      timeline: payload.timeline,
    })
    .select()
    .single();
  
  if (data && !error) {
    try {
      const { sendEmail, bookingConfirmationTemplate, ADMIN_EMAIL } = await import("@/lib/email");
      const { createAdminClient } = await import("../../../supabase/admin");
      const supabaseAdmin = createAdminClient();
      
      const emailHtml = bookingConfirmationTemplate({ 
        name: payload.name, 
        consultationType: payload.type,
        date: payload.date,
        time: payload.time
      });
      
      const emailResult = await sendEmail({
        to: payload.email,
        subject: `Consultation Confirmed: ${payload.date} at ${payload.time}`,
        html: emailHtml,
      });

      // Log it
      await supabaseAdmin.from("email_logs").insert({
        recipient_email: payload.email,
        recipient_name: payload.name,
        subject: `Consultation Confirmed: ${payload.date} at ${payload.time}`,
        template_type: "custom",
        status: emailResult.error ? "failed" : "sent",
        error_message: emailResult.error || null,
        resend_id: emailResult.id || null,
      });

      // Admin Notification
      const { adminNotificationTemplate } = await import("@/lib/email");
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[New Booking] Consultation with ${payload.name}`,
        html: adminNotificationTemplate({
          title: "New Consultation Booked",
          message: `<strong>${payload.name}</strong> has booked a <strong>${payload.type}</strong> consultation.<br/><br/>Date: ${payload.date}<br/>Time: ${payload.time}<br/>Email: ${payload.email}<br/>Company: ${payload.company || "N/A"}<br/>Budget: ${payload.budget || "N/A"}<br/>Timeline: ${payload.timeline || "N/A"}<br/><br/><strong>Project Description:</strong><br/>${payload.projectDesc}`,
          actionLabel: "View in Dashboard",
          actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.com"}/dashboard?tab=overview`,
        }),
      });
    } catch (err) {
      console.error("Email send error (non-fatal):", err);
    }
  }

  return { data, error };
}

export async function getConsultations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function updateConsultationStatus(id: string, status: "Scheduled" | "Completed" | "Cancelled") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
    
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteConsultation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("consultations")
    .delete()
    .eq("id", id);
    
  revalidatePath("/dashboard");
  return { error };
}
