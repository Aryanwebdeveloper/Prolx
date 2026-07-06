"use server";

import { createClient } from "../../supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { generateCertificateId, getCertVerificationUrl } from "@/lib/certificates";
import { revalidatePath } from "next/cache";

// Helper for admin auth actions
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ====================================================
// PROFILE / USER MANAGEMENT ACTIONS
// ====================================================

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function getAllProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function updateProfileStatus(userId: string, status: "active" | "rejected" | "pending") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  revalidatePath("/dashboard");
  return { error };
}

export async function updateProfileRole(userId: string, role: "admin" | "staff" | "client") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  revalidatePath("/dashboard");
  return { error };
}

export async function updateProfile(userId: string, data: {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
  revalidatePath("/dashboard");
  return { error };
}

export async function deleteProfile(userId: string) {
  const supabaseAdmin = getAdminClient();
  // This cascades to certificates
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  revalidatePath("/dashboard");
  return { error };
}

export async function adminResetUserPassword(userId: string, newPassword?: string) {
  const supabaseAdmin = getAdminClient();
  
  if (!newPassword || newPassword.length < 6) {
    return { error: { message: "Password must be at least 6 characters." } };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  return { error };
}

// ====================================================
// CERTIFICATE ACTIONS
// ====================================================

export async function getAllCertificates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*, profiles:profiles!certificates_user_id_fkey(full_name, email, role, avatar_url)")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getUserCertificates(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getCertificateById(certId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*, profiles:profiles!certificates_user_id_fkey(full_name, email, role, avatar_url)")
    .eq("id", certId)
    .single();
  return { data, error };
}

export async function createCertificate(payload: {
  user_id: string;
  certificate_type: string;
  internship_field?: string;
  issue_date: string;
  recipient_name: string;
  recipient_email?: string;
  title: string;
  category: string;
}) {
  const supabase = await createClient();
  
  // Get current admin user ID to track who created it
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Generate unique short ID: PROLX-XXXXXX (6 uppercase alphanumeric chars)
  // Using JS generator directly for consistent short format across all environments
  let certId = generateCertificateId();
  
  // Ensure uniqueness against existing certificates (retry up to 5 times)
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('id', certId)
      .maybeSingle();
    if (!existing) break; // ID is unique
    certId = generateCertificateId();   // collision — regenerate
  }

  const verificationUrl = getCertVerificationUrl(certId);

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      id: certId,
      user_id: payload.user_id,
      recipient_name: payload.recipient_name,
      recipient_email: payload.recipient_email || null,
      title: payload.title,
      category: payload.category,
      issue_date: payload.issue_date,
      status: "active",
      issued_by: "Prolx Digital Agency",
      certificate_type: payload.certificate_type,
      internship_field: payload.internship_field || null,
      qr_code_url: verificationUrl,
      created_by: currentUser?.id || null,
    })
    .select()
    .single();

  // Log activity
  if (!error) {
    if (currentUser) {
      await supabase.from("activity_logs").insert({
        user_id: currentUser.id,
        action: "CREATE_CERTIFICATE",
        target_type: "certificate",
        target_id: certId,
        details: { title: payload.title, recipient: payload.recipient_name },
      });
    }

    if (payload.recipient_email) {
      try {
        const { sendEmail, certificateIssuedTemplate } = await import("@/lib/email");
        const { createAdminClient } = await import("../../supabase/admin");
        const supabaseAdmin = createAdminClient();

        const emailHtml = certificateIssuedTemplate({
          name: payload.recipient_name,
          title: payload.title,
          certId,
          issueDate: payload.issue_date,
          category: payload.category,
        });

        const subject = `Your Certificate of Achievement: ${payload.title}`;
        const emailResult = await sendEmail({
          to: payload.recipient_email,
          subject,
          html: emailHtml,
        });

        await supabaseAdmin.from("email_logs").insert({
          recipient_email: payload.recipient_email,
          recipient_name: payload.recipient_name,
          subject,
          template_type: "certificate_issued",
          status: emailResult.error ? "failed" : "sent",
          error_message: emailResult.error || null,
          resend_id: emailResult.id || null,
        });
      } catch (err) {
        console.error("Certificate email error:", err);
      }
    }
  }

  revalidatePath("/dashboard");
  return { data, error, certId };
}

export async function updateCertificate(certId: string, payload: {
  title?: string;
  issue_date?: string;
  status?: "active" | "inactive" | "expired" | "revoked";
  category?: string;
  internship_field?: string;
  revoked_reason?: string;
}) {
  const supabase = await createClient();
  
  // If revoking, automatically set revoked_at
  const updates: any = { ...payload };
  if (payload.status === 'revoked') {
    updates.revoked_at = new Date().toISOString();
  } else if (payload.status === 'active' || payload.status === 'inactive') {
    updates.revoked_at = null;
    updates.revoked_reason = null;
  }

  const { data, error } = await supabase
    .from("certificates")
    .update(updates)
    .eq("id", certId)
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function revokeCertificate(certId: string, reason?: string) {
  return updateCertificate(certId, {
    status: "revoked",
    revoked_reason: reason || "Revoked by Administrator",
  });
}

export async function deleteCertificate(certId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("certificates")
    .delete()
    .eq("id", certId);
  revalidatePath("/dashboard");
  return { error };
}

export async function bulkRevokeCertificates(certIds: string[], reason?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoked_reason: reason || "Revoked by Bulk Action",
      revoked_at: new Date().toISOString(),
    })
    .in("id", certIds);
  revalidatePath("/dashboard");
  return { error };
}

export async function bulkDeleteCertificates(certIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("certificates")
    .delete()
    .in("id", certIds);
  revalidatePath("/dashboard");
  return { error };
}

export async function verifyCertificate(certId: string) {
  if (!certId || typeof certId !== "string") {
    return { data: null, error: new Error("Invalid Certificate ID") };
  }
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*, profiles:profiles!certificates_user_id_fkey(full_name)")
    .eq("id", certId.trim().toUpperCase())
    .single();
  return { data, error };
}

// ====================================================
// ANALYTICS & STATS
// ====================================================

export async function getCertificateStats() {
  const supabase = await createClient();
  
  const { data: certs, error } = await supabase
    .from("certificates")
    .select("certificate_type, status");
    
  if (error || !certs) {
    return {
      total: 0,
      internships: 0,
      awards: 0,
      excellence: 0,
      active: 0,
      revoked: 0,
    };
  }

  let total = certs.length;
  let internships = 0;
  let awards = 0;
  let excellence = 0;
  let active = 0;
  let revoked = 0;

  certs.forEach((c) => {
    const type = c.certificate_type || 'internship';
    if (type.startsWith('internship')) {
      internships++;
    } else if (type === 'opa') {
      awards++;
    } else if (type === 'excellence') {
      excellence++;
    }

    if (c.status === 'active') active++;
    if (c.status === 'revoked') revoked++;
  });

  return {
    total,
    internships,
    awards,
    excellence,
    active,
    revoked,
  };
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [profilesRes, certsRes, pendingRes, activeRes, revokedRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("certificates").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }).eq("status", "pending"),
    supabase.from("certificates").select("id", { count: "exact" }).eq("status", "active"),
    supabase.from("certificates").select("id", { count: "exact" }).eq("status", "revoked"),
  ]);

  return {
    totalUsers: profilesRes.count ?? 0,
    totalCerts: certsRes.count ?? 0,
    pendingApprovals: pendingRes.count ?? 0,
    activeCerts: activeRes.count ?? 0,
    revokedCerts: revokedRes.count ?? 0,
  };
}

export async function getActivityLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(50);
  return { data, error };
}
