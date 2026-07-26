"use server";

import { createAdminClient } from "../../supabase/admin";
import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// LEAVE TYPES
// ============================================================

export async function getLeaveTypes(activeOnly = true) {
  const supabase = createAdminClient();
  let query = supabase.from("leave_types").select("*").order("name", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createLeaveType(payload: {
  name: string; code: string; color?: string;
  default_days_per_year: number; is_paid: boolean;
  allow_half_day: boolean; requires_attachment: boolean;
  max_days?: number; carryover_days?: number; description?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leave_types").insert(payload).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function updateLeaveType(id: string, payload: Partial<{
  name: string; color: string; default_days_per_year: number;
  is_paid: boolean; allow_half_day: boolean; max_days: number;
  carryover_days: number; is_active: boolean; description: string;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leave_types").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// LEAVE BALANCES
// ============================================================

export async function getLeaveBalances(userId: string, year?: number) {
  const supabase = createAdminClient();
  const targetYear = year || new Date().getFullYear();
  const { data, error } = await supabase
    .from("leave_balances")
    .select("*, leave_type:leave_types(*)")
    .eq("user_id", userId)
    .eq("year", targetYear);
  return { data: data || [], error };
}

export async function getAllLeaveBalances(year?: number) {
  const supabase = createAdminClient();
  const targetYear = year || new Date().getFullYear();
  const { data, error } = await supabase
    .from("leave_balances")
    .select("*, leave_type:leave_types(*), user:profiles!leave_balances_user_id_fkey(id, full_name, email, avatar_url)")
    .eq("year", targetYear);
  return { data: data || [], error };
}

export async function upsertLeaveBalance(payload: {
  user_id: string; leave_type_id: string; year?: number;
  total_days: number; carried_over?: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_balances")
    .upsert({
      ...payload,
      year: payload.year || new Date().getFullYear(),
    }, { onConflict: "user_id,leave_type_id,year" })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function initLeaveBalancesForEmployee(userId: string, year?: number) {
  const supabase = await createClient();
  const targetYear = year || new Date().getFullYear();
  const { data: types } = await supabase.from("leave_types").select("*").eq("is_active", true);
  if (!types) return { error: "No leave types found" };

  const records = types.map((lt) => ({
    user_id: userId,
    leave_type_id: lt.id,
    year: targetYear,
    total_days: lt.default_days_per_year,
    used_days: 0,
    pending_days: 0,
    carried_over: 0,
  }));

  const { error } = await supabase
    .from("leave_balances")
    .upsert(records, { onConflict: "user_id,leave_type_id,year" });
  return { error };
}

// ============================================================
// LEAVE REQUESTS
// ============================================================

export async function submitLeaveRequest(payload: {
  leave_type_id: string; subject: string; reason: string;
  start_date: string; end_date: string; total_days: number;
  is_half_day?: boolean; half_day_period?: string;
  attachment_url?: string; emergency_contact?: string; emergency_phone?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  // Check balance
  const year = new Date(payload.start_date).getFullYear();
  const { data: balance } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("user_id", user.id)
    .eq("leave_type_id", payload.leave_type_id)
    .eq("year", year)
    .maybeSingle();

  if (balance) {
    const available = balance.total_days + balance.carried_over - balance.used_days - balance.pending_days;
    if (available < payload.total_days) {
      return {
        data: null,
        error: new Error(`Insufficient leave balance. Available: ${available} days, Requested: ${payload.total_days} days`)
      };
    }
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      ...payload,
      user_id: user.id,
      status: "pending",
      current_stage: "hr_review",
    })
    .select("*, leave_type:leave_types(*)")
    .single();

  if (!error && data) {
    // Update pending_days in balance
    if (balance) {
      await supabase.from("leave_balances")
        .update({ pending_days: balance.pending_days + payload.total_days })
        .eq("id", balance.id);
    }

    // Create notification for HR/Admin
    await createLeaveNotification(supabase, data.id, user.id, "leave_submitted");
  }

  revalidatePath("/dashboard");
  return { data, error };
}

export async function getLeaveRequests(filter?: {
  userId?: string; status?: string; month?: string; year?: number;
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("leave_requests")
    .select(`
      *,
      leave_type:leave_types(*),
      user:profiles!leave_requests_user_id_fkey(id, full_name, email, avatar_url, department, designation),
      approvals:leave_approvals(*, approver:profiles!leave_approvals_approver_id_fkey(id, full_name, role))
    `)
    .order("created_at", { ascending: false });

  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);
  if (filter?.year) {
    query = query.gte("start_date", `${filter.year}-01-01`).lte("start_date", `${filter.year}-12-31`);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getMyLeaveRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };
  return getLeaveRequests({ userId: user.id });
}

export async function approveLeaveRequest(
  leaveRequestId: string,
  stage: "hr_review" | "manager_review" | "admin_review",
  comment?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  // Get leave request
  const { data: lr } = await supabase.from("leave_requests").select("*").eq("id", leaveRequestId).single();
  if (!lr) return { error: new Error("Leave request not found") };

  // Determine next stage or final approval
  const stageOrder = ["hr_review", "manager_review", "admin_review"];
  const currentIdx = stageOrder.indexOf(stage);
  const nextStage = stageOrder[currentIdx + 1] as any;

  const newStatus = nextStage ? "pending" : "approved";
  const newStage = nextStage || "completed";

  // Record approval
  await supabase.from("leave_approvals").insert({
    leave_request_id: leaveRequestId,
    approver_id: user.id,
    stage,
    action: "approved",
    comment: comment || null,
  });

  // Update request
  const { error } = await supabase.from("leave_requests").update({
    status: newStatus,
    current_stage: newStage,
    updated_at: new Date().toISOString(),
  }).eq("id", leaveRequestId);

  // If fully approved, update balance
  if (newStatus === "approved") {
    const year = new Date(lr.start_date).getFullYear();
    const { data: balance } = await supabase
      .from("leave_balances")
      .select("*")
      .eq("user_id", lr.user_id)
      .eq("leave_type_id", lr.leave_type_id)
      .eq("year", year)
      .maybeSingle();

    if (balance) {
      await supabase.from("leave_balances").update({
        used_days: balance.used_days + lr.total_days,
        pending_days: Math.max(0, balance.pending_days - lr.total_days),
      }).eq("id", balance.id);
    }

    // Pre-mark attendance as on_leave
    const { getAttendanceSettings } = await import("./attendance-actions");
    const settings = await getAttendanceSettings();
    const holidays = new Set(settings.holidays || []);

    const dates: string[] = [];
    const start = new Date(lr.start_date);
    const end = new Date(lr.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
      const dateStr = d.toISOString().split("T")[0];
      if (holidays.has(dateStr)) continue; // skip holidays
      dates.push(dateStr);
    }

    if (dates.length > 0) {
      const adminSupabase = createAdminClient();
      const recordsToUpsert = dates.map(date => ({
        user_id: lr.user_id,
        date,
        status: "on_leave",
        task_description: `Approved Leave: ${lr.subject}`,
        notes: "System: Leave Approved",
        created_by: user.id,
      }));
      await adminSupabase
        .from("attendance")
        .upsert(recordsToUpsert, { onConflict: "user_id,date" });
    }

    // Notify employee
    await supabase.from("notifications").insert({
      recipient_id: lr.user_id,
      sender_id: user.id,
      type: "leave_approved",
      title: "Leave Request Approved",
      message: `Your leave request (${lr.subject}) has been fully approved.`,
      entity_type: "leave_request",
      entity_id: leaveRequestId,
      link: "/dashboard?tab=my-leave",
    });
  } else {
    // Moving to next stage — notify next approver role
    await createLeaveNotification(supabase, leaveRequestId, lr.user_id, "leave_submitted");
  }

  revalidatePath("/dashboard");
  return { error };
}

export async function rejectLeaveRequest(
  leaveRequestId: string,
  stage: "hr_review" | "manager_review" | "admin_review",
  reason: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { data: lr } = await supabase.from("leave_requests").select("*").eq("id", leaveRequestId).single();
  if (!lr) return { error: new Error("Leave request not found") };

  await supabase.from("leave_approvals").insert({
    leave_request_id: leaveRequestId,
    approver_id: user.id,
    stage,
    action: "rejected",
    comment: reason,
  });

  const { error } = await supabase.from("leave_requests").update({
    status: "rejected",
    rejection_reason: reason,
    current_stage: "completed",
    updated_at: new Date().toISOString(),
  }).eq("id", leaveRequestId);

  // Restore pending_days in balance
  const year = new Date(lr.start_date).getFullYear();
  const { data: balance } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("user_id", lr.user_id)
    .eq("leave_type_id", lr.leave_type_id)
    .eq("year", year)
    .maybeSingle();

  if (balance) {
    await supabase.from("leave_balances").update({
      pending_days: Math.max(0, balance.pending_days - lr.total_days),
    }).eq("id", balance.id);
  }

  // Notify employee
  await supabase.from("notifications").insert({
    recipient_id: lr.user_id,
    sender_id: user.id,
    type: "leave_rejected",
    title: "Leave Request Rejected",
    message: `Your leave request (${lr.subject}) was rejected. Reason: ${reason}`,
    entity_type: "leave_request",
    entity_id: leaveRequestId,
    link: "/dashboard?tab=my-leave",
  });

  revalidatePath("/dashboard");
  return { error };
}

export async function cancelLeaveRequest(leaveRequestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { data: lr } = await supabase.from("leave_requests").select("*").eq("id", leaveRequestId).single();
  if (!lr) return { error: new Error("Not found") };
  if (lr.user_id !== user.id) return { error: new Error("Unauthorized") };

  const { error } = await supabase.from("leave_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", leaveRequestId)
    .eq("status", "pending");

  // Restore pending balance
  if (!error) {
    const year = new Date(lr.start_date).getFullYear();
    const { data: balance } = await supabase
      .from("leave_balances")
      .select("*")
      .eq("user_id", lr.user_id)
      .eq("leave_type_id", lr.leave_type_id)
      .eq("year", year)
      .maybeSingle();
    if (balance) {
      await supabase.from("leave_balances").update({
        pending_days: Math.max(0, balance.pending_days - lr.total_days),
      }).eq("id", balance.id);
    }
  }

  // Remove any on_leave attendance records (in case it was approved somehow or pre-marked)
  const adminSupabase = createAdminClient();
  await adminSupabase
    .from("attendance")
    .delete()
    .eq("user_id", lr.user_id)
    .eq("status", "on_leave")
    .gte("date", lr.start_date)
    .lte("date", lr.end_date);

  revalidatePath("/dashboard");
  return { error };
}

// ============================================================
// LEAVE STATISTICS
// ============================================================

export async function getLeaveStats(year?: number) {
  const supabase = await createClient();
  const targetYear = year || new Date().getFullYear();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("status, total_days, leave_type:leave_types(name, code)")
    .gte("start_date", `${targetYear}-01-01`)
    .lte("start_date", `${targetYear}-12-31`);

  if (error) return { data: null, error };

  const stats = {
    total: data?.length || 0,
    pending: data?.filter(r => r.status === "pending").length || 0,
    approved: data?.filter(r => r.status === "approved").length || 0,
    rejected: data?.filter(r => r.status === "rejected").length || 0,
    totalDays: data?.filter(r => r.status === "approved").reduce((sum, r) => sum + r.total_days, 0) || 0,
  };
  return { data: stats, error: null };
}

// Helper: Create leave notification for HR/Admin
async function createLeaveNotification(supabase: any, leaveRequestId: string, employeeId: string, type: string) {
  const { data: hrAdmins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "hr_manager", "super_admin"]);

  if (!hrAdmins) return;

  const notifications = hrAdmins.map((u: { id: string }) => ({
    recipient_id: u.id,
    type: "leave_submitted",
    title: "New Leave Request",
    message: "A new leave request has been submitted and requires your review.",
    entity_type: "leave_request",
    entity_id: leaveRequestId,
    link: "/dashboard?tab=leave-management",
  }));

  await supabase.from("notifications").insert(notifications);
}
