"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function submitContact(payload: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  client_id?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      status: "New",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      service: payload.service,
      budget: payload.budget,
      message: payload.message,
    })
    .select()
    .single();
  
  if (data && !error) {
    try {
      const { sendEmail, contactConfirmationTemplate, ADMIN_EMAIL } = await import("@/lib/email");
      const { createAdminClient } = await import("../../supabase/admin"); // We need admin client to log email if we want, or we can just send it.
      const supabaseAdmin = createAdminClient();
      
      const emailHtml = contactConfirmationTemplate({ name: payload.name, service: payload.service, message: payload.message });
      const emailResult = await sendEmail({
        to: payload.email,
        subject: `Thanks for reaching out to Prolx, ${payload.name}!`,
        html: emailHtml,
      });

      // Log it
      await supabaseAdmin.from("email_logs").insert({
        recipient_email: payload.email,
        recipient_name: payload.name,
        subject: `Thanks for reaching out to Prolx, ${payload.name}!`,
        template_type: "custom",
        status: emailResult.error ? "failed" : "sent",
        error_message: emailResult.error || null,
        resend_id: emailResult.id || null,
      });

      // Admin Notification
      const { adminNotificationTemplate } = await import("@/lib/email");
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[New Contact] Message from ${payload.name}`,
        html: adminNotificationTemplate({
          title: "New Contact Form Submission",
          message: `<strong>${payload.name}</strong> has submitted a new contact form.<br/><br/>Email: ${payload.email}<br/>Phone: ${payload.phone || "N/A"}<br/>Service: ${payload.service || "N/A"}<br/>Budget: ${payload.budget || "N/A"}<br/><br/><strong>Message:</strong><br/>${payload.message}`,
          actionLabel: payload.phone ? "Chat with Client on WhatsApp" : "View in Dashboard",
          actionUrl: payload.phone ? `https://wa.me/${payload.phone.replace(/[^0-9]/g, '')}` : `${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.cloud"}/dashboard?tab=overview`,
        }),
      });
    } catch (err) {
      console.error("Email send error (non-fatal):", err);
    }
  }

  return { data, error };
}

export async function getContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function updateContactStatus(id: string, status: "New" | "Read" | "Replied") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
    
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);
    
  revalidatePath("/dashboard");
  return { error };
}
