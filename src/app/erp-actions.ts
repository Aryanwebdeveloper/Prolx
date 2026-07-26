"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// INTERNAL APPLICATIONS
// ============================================================

export async function submitInternalApplication(payload: {
  type: string; subject: string; description: string;
  priority?: string; attachment_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("internal_applications")
    .insert({ ...payload, user_id: user.id, status: "pending" })
    .select().single();

  if (!error) {
    // Notify HR/Admin
    const { data: hrAdmins } = await supabase
      .from("profiles").select("id").in("role", ["admin", "hr_manager", "super_admin"]);

    if (hrAdmins?.length) {
      await supabase.from("notifications").insert(
        hrAdmins.map((u: { id: string }) => ({
          recipient_id: u.id,
          sender_id: user.id,
          type: "application_status",
          title: "New Internal Application",
          message: `New ${payload.type.replace(/_/g, " ")} request: "${payload.subject}"`,
          entity_type: "internal_application",
          entity_id: data?.id,
          link: "/dashboard?tab=internal-applications",
        }))
      );
    }
  }

  revalidatePath("/dashboard");
  return { data, error };
}

export async function getInternalApplications(filter?: {
  userId?: string; type?: string; status?: string; limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("internal_applications")
    .select(`
      *,
      user:profiles!internal_applications_user_id_fkey(id, full_name, email, avatar_url, role),
      reviewer:profiles!internal_applications_reviewed_by_fkey(id, full_name),
      comments:internal_application_comments(
        *,
        user:profiles!internal_application_comments_user_id_fkey(id, full_name, avatar_url)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(filter?.limit || 100);

  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.type && filter.type !== "all") query = query.eq("type", filter.type);
  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getMyApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };
  return getInternalApplications({ userId: user.id });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "under_review" | "approved" | "rejected" | "on_hold",
  notes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { data: app } = await supabase
    .from("internal_applications").select("*").eq("id", applicationId).single();
  if (!app) return { error: new Error("Application not found") };

  const { error } = await supabase.from("internal_applications").update({
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    admin_notes: notes || null,
    updated_at: new Date().toISOString(),
  }).eq("id", applicationId);

  if (!error) {
    const statusLabels: Record<string, string> = {
      approved: "approved ✅",
      rejected: "rejected ❌",
      under_review: "under review 🔍",
      on_hold: "put on hold ⏸",
    };

    await supabase.from("notifications").insert({
      recipient_id: app.user_id,
      sender_id: user.id,
      type: "application_status",
      title: "Application Status Updated",
      message: `Your ${app.type.replace(/_/g, " ")} request has been ${statusLabels[status] || status}.`,
      entity_type: "internal_application",
      entity_id: applicationId,
      link: "/dashboard?tab=my-applications",
    });
  }

  revalidatePath("/dashboard");
  return { error };
}

export async function addApplicationComment(applicationId: string, comment: string, isInternal = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("internal_application_comments")
    .insert({ application_id: applicationId, user_id: user.id, comment, is_internal: isInternal })
    .select().single();

  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// PERFORMANCE REVIEWS
// ============================================================

export async function getReviewCriteria() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_criteria").select("*").eq("is_active", true).order("order_index");
  return { data: data || [], error };
}

export async function createPerformanceReview(payload: {
  employee_id: string; review_period: string; review_type?: string;
  strengths?: string; improvements?: string; goals_for_next_period?: string;
  recommendations?: string;
  ratings: Array<{ criteria_id: string; score: number; comment?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { ratings, ...reviewData } = payload;

  // Calculate overall score (weighted average)
  const { data: criteria } = await supabase.from("review_criteria").select("id, weight").eq("is_active", true);
  let totalWeight = 0;
  let weightedScore = 0;

  for (const r of ratings) {
    const crit = criteria?.find(c => c.id === r.criteria_id);
    const weight = crit?.weight || 1;
    weightedScore += r.score * weight;
    totalWeight += weight;
  }

  const overallScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : null;
  const overallRating = overallScore
    ? overallScore >= 9 ? "exceptional"
      : overallScore >= 7.5 ? "exceeds"
      : overallScore >= 6 ? "meets"
      : overallScore >= 4 ? "below"
      : "unsatisfactory"
    : undefined;

  const { data: review, error: reviewError } = await supabase
    .from("performance_reviews")
    .insert({
      ...reviewData,
      reviewer_id: user.id,
      overall_score: overallScore,
      overall_rating: overallRating,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select().single();

  if (reviewError || !review) return { data: null, error: reviewError };

  // Insert ratings
  const ratingsToInsert = ratings.map(r => ({
    review_id: review.id,
    criteria_id: r.criteria_id,
    score: r.score,
    comment: r.comment || null,
  }));
  await supabase.from("review_ratings").insert(ratingsToInsert);

  // Notify employee
  await supabase.from("notifications").insert({
    recipient_id: payload.employee_id,
    sender_id: user.id,
    type: "performance_review",
    title: "Performance Review Submitted",
    message: `Your performance review for ${payload.review_period} has been submitted. Overall score: ${overallScore}/10.`,
    entity_type: "performance_review",
    entity_id: review.id,
    link: "/dashboard?tab=my-performance",
  });

  revalidatePath("/dashboard");
  return { data: review, error: null };
}

export async function getPerformanceReviews(filter?: { employeeId?: string; reviewerId?: string }) {
  const { createAdminClient } = await import("../../supabase/admin");
  const supabase = createAdminClient();
  let query = supabase
    .from("performance_reviews")
    .select(`
      *,
      employee:profiles!performance_reviews_employee_id_fkey(id, full_name, email, avatar_url, role),
      reviewer:profiles!performance_reviews_reviewer_id_fkey(id, full_name),
      ratings:review_ratings(*, criteria:review_criteria(id, name, weight))
    `)
    .order("created_at", { ascending: false });

  if (filter?.employeeId) query = query.eq("employee_id", filter.employeeId);
  if (filter?.reviewerId) query = query.eq("reviewer_id", filter.reviewerId);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function acknowledgeReview(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("performance_reviews").update({
    status: "acknowledged",
    acknowledged_at: new Date().toISOString(),
  }).eq("id", reviewId);
  revalidatePath("/dashboard");
  return { error };
}

// ============================================================
// PAYROLL
// ============================================================

export async function getPayrollPeriods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_periods").select("*").order("year", { ascending: false }).order("month", { ascending: false });
  return { data: data || [], error };
}

export async function createPayrollPeriod(month: number, year: number) {
  const supabase = await createClient();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const { data, error } = await supabase
    .from("payroll_periods")
    .insert({ month, year, period_label: `${monthNames[month - 1]} ${year}`, status: "draft" })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function generatePayrollForPeriod(periodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  // Get all staff/employees
  const { data: employees, error: fetchError } = await supabase
    .from("profiles")
    .select("id, employee_profile:employee_profiles!employee_profiles_user_id_fkey(base_salary, salary_currency)")
    .in("role", ["admin", "hr_manager", "project_manager", "team_lead", "staff", "intern", "finance_manager", "recruiter"]);

  if (fetchError) {
    console.error("Error fetching employees for payroll:", fetchError);
    return { error: fetchError };
  }

  if (!employees || employees.length === 0) {
    return { error: new Error("No employees found") };
  }

  const records = employees.map(e => {
    const profile = (e.employee_profile as any)?.[0] || e.employee_profile;
    const salary = profile?.base_salary || 0;
    return {
      period_id: periodId,
      user_id: e.id,
      basic_salary: salary,
      gross_salary: salary,
      net_salary: salary,
      total_allowances: 0,
      total_deductions: 0,
      payment_status: "pending",
    };
  });

  const { error } = await supabase
    .from("payroll_records")
    .upsert(records, { onConflict: "period_id,user_id", ignoreDuplicates: true });

  if (!error) {
    await supabase.from("payroll_periods")
      .update({ status: "processing", processed_by: user.id, processed_at: new Date().toISOString() })
      .eq("id", periodId);
  }

  revalidatePath("/dashboard");
  return { error };
}

export async function getPayrollRecords(periodId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_records")
    .select("*, user:profiles!payroll_records_user_id_fkey(id, full_name, email, avatar_url, role), period:payroll_periods(*)")
    .eq("period_id", periodId)
    .order("created_at");
  return { data: data || [], error };
}

export async function updatePayrollRecord(recordId: string, payload: Partial<{
  basic_salary: number; allowances: any[]; deductions: any[];
  total_allowances: number; total_deductions: number;
  gross_salary: number; net_salary: number;
  overtime_hours: number; overtime_amount: number;
  advance_deduction: number; tax_deduction: number;
  payment_status: string; notes: string;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_records")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", recordId).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function markPayrollPeriodPaid(periodId: string) {
  const supabase = await createClient();
  const { error: recErr } = await supabase
    .from("payroll_records")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("period_id", periodId);
  if (recErr) return { error: recErr };

  const { error } = await supabase
    .from("payroll_periods")
    .update({ status: "paid", finalized_at: new Date().toISOString() })
    .eq("id", periodId);
  revalidatePath("/dashboard");
  return { error };
}

export async function getMyPayslips() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from("payroll_records")
    .select("*, period:payroll_periods(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

// ============================================================
// CRM
// ============================================================

export async function getClients(filter?: { status?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("*, assigned:profiles!clients_assigned_to_fkey(id, full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);

  const { data, error } = await query;
  let result = data || [];

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(c =>
      c.company_name?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }

  return { data: result, error };
}

export async function createClient_CRM(payload: {
  company_name: string; contact_person: string; email?: string;
  phone?: string; website?: string; industry?: string; country?: string;
  city?: string; status?: string; source?: string; notes?: string; tags?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...payload, assigned_to: user?.id })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function updateClient(id: string, payload: Partial<{
  company_name: string; contact_person: string; email: string;
  phone: string; website: string; industry: string; country: string;
  city: string; status: string; assigned_to: string; notes: string; tags: string[];
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  revalidatePath("/dashboard");
  return { error };
}

export async function getClientInteractions(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_interactions")
    .select("*, user:profiles!client_interactions_user_id_fkey(id, full_name, avatar_url)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function addClientInteraction(payload: {
  client_id: string; type: string; subject: string;
  notes?: string; outcome?: string; next_action?: string; next_action_date?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("client_interactions")
    .insert({ ...payload, user_id: user?.id })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// PROJECT ACTIONS
// ============================================================

export async function getProjects(filter?: { status?: string; managerId?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(`
      *,
      project_manager:profiles!projects_project_manager_id_fkey(id, full_name, avatar_url),
      client:profiles!projects_client_id_fkey(id, full_name, email),
      members:project_members(*, user:profiles!project_members_user_id_fkey(id, full_name, avatar_url)),
      milestones:project_milestones(id, title, is_completed, due_date)
    `)
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);
  if (filter?.managerId) query = query.eq("project_manager_id", filter.managerId);

  const { data, error } = await query;
  let result = data || [];

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(p => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }

  return { data: result, error };
}

export async function getMyProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from("project_members")
    .select("project:projects(*, milestones:project_milestones(id, title, is_completed), members:project_members(user_id))")
    .eq("user_id", user.id);

  return { data: data?.map(d => d.project).filter(Boolean) || [], error };
}

export async function createProject(payload: {
  title: string; description?: string; status?: string; priority?: string;
  client_id?: string; project_manager_id?: string;
  start_date?: string; end_date?: string; budget?: number;
  memberIds?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { memberIds, ...projectData } = payload;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...projectData, created_by: user?.id, progress: 0 })
    .select().single();

  if (error || !project) return { data: null, error };

  // Add members
  const members = [
    { project_id: project.id, user_id: user?.id, role: "lead" },
    ...(memberIds || []).map(uid => ({ project_id: project.id, user_id: uid, role: "member" })),
  ];
  await supabase.from("project_members").upsert(members, { onConflict: "project_id,user_id", ignoreDuplicates: true });

  // Notify assigned members
  if (memberIds?.length) {
    await supabase.from("notifications").insert(
      memberIds.map(uid => ({
        recipient_id: uid,
        sender_id: user?.id,
        type: "project_assigned",
        title: "Added to Project",
        message: `You've been added to the project: ${project.title}`,
        entity_type: "project",
        entity_id: project.id,
        link: "/dashboard?tab=projects",
      }))
    );
  }

  revalidatePath("/dashboard");
  return { data: project, error: null };
}

export async function updateProject(id: string, payload: Partial<{
  title: string; description: string; status: string; priority: string;
  health: string; start_date: string; end_date: string;
  budget: number; progress: number; tags: string[];
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/dashboard");
  return { error };
}

export async function getProjectStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("status, health, priority");
  if (error) return { data: null, error };

  return {
    data: {
      total: data.length,
      active: data.filter(p => p.status === "active").length,
      completed: data.filter(p => p.status === "completed").length,
      planning: data.filter(p => p.status === "planning").length,
      onHold: data.filter(p => p.status === "on_hold").length,
      atRisk: data.filter(p => p.health === "at_risk").length,
      behind: data.filter(p => p.health === "behind").length,
    },
    error: null
  };
}
