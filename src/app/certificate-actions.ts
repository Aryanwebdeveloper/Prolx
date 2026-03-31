"use server";

import { createClient } from "../../supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { generateCertificateId } from "@/lib/certificates";
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
    .select("*, profiles(full_name, email, role, avatar_url)")
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
    .select("*, profiles(full_name, email, role, avatar_url)")
    .eq("id", certId)
    .single();
  return { data, error };
}

export async function createCertificate(payload: {
  user_id: string;
  title: string;
  description?: string;
  recipient_name: string;
  recipient_email?: string;
  issue_date: string;
  expiry_date?: string;
  category?: string;
  issued_by?: string;
}) {
  const supabase = await createClient();
  const certId = generateCertificateId();

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      id: certId,
      status: "active",
      issued_by: "Prolx Digital Agency",
      ...payload,
    })
    .select()
    .single();

  // Log activity
  if (!error) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "CREATE_CERTIFICATE",
        target_type: "certificate",
        target_id: certId,
        details: { title: payload.title, recipient: payload.recipient_name },
      });
    }
  }

  revalidatePath("/dashboard");
  return { data, error, certId };
}

export async function updateCertificate(certId: string, payload: {
  title?: string;
  description?: string;
  recipient_name?: string;
  recipient_email?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: "active" | "inactive" | "expired";
  category?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .update(payload)
    .eq("id", certId)
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
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

export async function verifyCertificate(certId: string) {
  if (!certId || typeof certId !== "string") {
    return { data: null, error: new Error("Invalid Certificate ID") };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("id, title, description, recipient_name, recipient_email, issue_date, expiry_date, status, issued_by, category, created_at, profiles(full_name)")
    .eq("id", certId.trim().toUpperCase())
    .single();
  return { data, error };
}

// ====================================================
// ANALYTICS
// ====================================================

export async function getDashboardStats() {
  const supabase = await createClient();

  const [profilesRes, certsRes, pendingRes, activeRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("certificates").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }).eq("status", "pending"),
    supabase.from("certificates").select("id", { count: "exact" }).eq("status", "active"),
  ]);

  return {
    totalUsers: profilesRes.count ?? 0,
    totalCerts: certsRes.count ?? 0,
    pendingApprovals: pendingRes.count ?? 0,
    activeCerts: activeRes.count ?? 0,
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
