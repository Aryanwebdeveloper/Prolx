"use server";

import { createAdminClient } from "../../supabase/admin";
import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// DEPARTMENTS
// ============================================================
export async function getDepartments() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("departments").select("*, head:profiles!departments_head_id_fkey(id, full_name)").order("name");
  return { data: data || [], error };
}

export async function createDepartment(payload: { name: string; code?: string; description?: string; head_id?: string }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("departments").insert(payload).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function updateDepartment(id: string, payload: Partial<{ name: string; code: string; description: string; head_id: string; is_active: boolean }>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("departments").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// DESIGNATIONS
// ============================================================
export async function getDesignations(departmentId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("designations").select("*, department:departments(id, name)").order("level");
  if (departmentId) query = query.eq("department_id", departmentId);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createDesignation(payload: { title: string; department_id?: string; level?: number }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("designations").insert(payload).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// EMPLOYEE PROFILES
// ============================================================
export async function getEmployeeProfile(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      department:departments(id, name, code),
      designation:designations(id, title),
      reporting_manager:profiles!employee_profiles_reporting_manager_id_fkey(id, full_name, email, avatar_url)
    `)
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

export async function getAllEmployees(filter?: {
  department?: string; role?: string; status?: string; search?: string;
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("profiles")
    .select(`
      *,
      employee_profile:employee_profiles!employee_profiles_user_id_fkey(
        *,
        department:departments(id, name),
        designation:designations(id, title)
      )
    `)
    .neq("role", "client")
    .order("full_name");

  if (filter?.role && filter.role !== "all") query = query.eq("role", filter.role);
  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);
  if (filter?.department) {
    // This needs a join — handled client-side for now
  }

  const { data, error } = await query;
  let result = data || [];

  // Client-side search
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(e =>
      e.full_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      (e.employee_profile as any)?.department?.name?.toLowerCase().includes(q) ||
      (e.employee_profile as any)?.designation?.title?.toLowerCase().includes(q)
    );
  }

  // Department filter
  if (filter?.department && filter.department !== "all") {
    result = result.filter(e =>
      (e.employee_profile as any)?.department?.id === filter.department
    );
  }

  return { data: result, error };
}

export async function upsertEmployeeProfile(userId: string, payload: Partial<{
  department_id: string; designation_id: string; employment_type: string;
  joining_date: string; probation_end_date: string; work_location: string;
  reporting_manager_id: string; date_of_birth: string; gender: string;
  nationality: string; national_id: string; national_id_url: string;
  phone: string; alternate_phone: string; current_address: string;
  permanent_address: string; emergency_contact_name: string;
  emergency_contact_relation: string; emergency_contact_phone: string;
  emergency_contact_email: string; bio: string; skills: string[];
  languages: string[]; linkedin_url: string; github_url: string;
  portfolio_url: string; resume_url: string; education: any[];
  experience: any[]; certifications: any[]; bank_name: string;
  account_number: string; account_title: string; base_salary: number;
  salary_currency: string; admin_notes: string;
}>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee_profiles")
    .upsert({ user_id: userId, ...payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select().single();

  // Also update profiles table basics
  const profileUpdate: any = {};
  if (payload.department_id) profileUpdate.department = payload.department_id;
  if (payload.employment_type) profileUpdate.employment_type = payload.employment_type;
  if (payload.joining_date) profileUpdate.joining_date = payload.joining_date;
  if (payload.work_location) profileUpdate.work_location = payload.work_location;

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from("profiles").update(profileUpdate).eq("id", userId);
  }

  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// EMPLOYEE DOCUMENTS
// ============================================================
export async function getEmployeeDocuments(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee_documents")
    .select("*, uploader:profiles!employee_documents_uploaded_by_fkey(id, full_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function addEmployeeDocument(payload: {
  user_id: string; category: string; title: string;
  description?: string; file_url: string; file_type?: string;
  file_size?: number; is_visible_to_employee?: boolean;
}) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const { data, error } = await supabase
    .from("employee_documents")
    .insert({ ...payload, uploaded_by: user?.id })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteEmployeeDocument(docId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("employee_documents").delete().eq("id", docId);
  revalidatePath("/dashboard");
  return { error };
}

// ============================================================
// SALARY HISTORY
// ============================================================
export async function getSalaryHistory(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("salary_history")
    .select("*, recorder:profiles!salary_history_recorded_by_fkey(id, full_name)")
    .eq("user_id", userId)
    .order("effective_date", { ascending: false });
  return { data: data || [], error };
}

export async function addSalaryRecord(payload: {
  user_id: string; effective_date: string; base_salary: number;
  previous_salary?: number; increment_percentage?: number;
  increment_reason?: string; currency?: string; notes?: string;
}) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const { data, error } = await supabase
    .from("salary_history")
    .insert({ ...payload, recorded_by: user?.id })
    .select().single();

  // Update current salary on employee_profile
  if (!error) {
    await supabase.from("employee_profiles")
      .update({ base_salary: payload.base_salary })
      .eq("user_id", payload.user_id);
  }

  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// PROMOTION HISTORY
// ============================================================
export async function getPromotionHistory(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotion_history")
    .select("*, recorder:profiles!promotion_history_recorded_by_fkey(id, full_name)")
    .eq("user_id", userId)
    .order("effective_date", { ascending: false });
  return { data: data || [], error };
}

export async function addPromotionRecord(payload: {
  user_id: string; effective_date: string;
  from_designation?: string; to_designation?: string;
  from_department?: string; to_department?: string;
  from_role?: string; to_role?: string;
  reason?: string;
}) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const { data, error } = await supabase
    .from("promotion_history")
    .insert({ ...payload, recorded_by: user?.id })
    .select().single();

  // Apply role change if specified
  if (!error && payload.to_role) {
    await supabase.from("profiles").update({ role: payload.to_role }).eq("id", payload.user_id);
  }

  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// EMPLOYEE STATS FOR DASHBOARD
// ============================================================
export async function getEmployeeStats() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role, status, joining_date, department, employment_type")
    .neq("role", "client");

  if (error) return { data: null, error };

  const today = new Date();
  const stats = {
    total: data.length,
    active: data.filter(e => e.status === "active").length,
    inactive: data.filter(e => e.status !== "active").length,
    interns: data.filter(e => e.role === "intern" || e.employment_type === "internship").length,
    fullTime: data.filter(e => e.employment_type === "full-time").length,
    partTime: data.filter(e => e.employment_type === "part-time").length,
    hrManagers: data.filter(e => e.role === "hr_manager").length,
    projectManagers: data.filter(e => e.role === "project_manager").length,
    byDepartment: {} as Record<string, number>,
    newThisMonth: data.filter(e => {
      if (!e.joining_date) return false;
      const d = new Date(e.joining_date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length,
  };

  // By role
  data.forEach(e => {
    const dept = e.department || "Unassigned";
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
  });

  return { data: stats, error: null };
}
