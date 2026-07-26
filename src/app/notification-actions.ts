"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// NOTIFICATION ACTIONS
// ============================================================

export async function getMyNotifications(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], unreadCount: 0 };

  const { data, error } = await supabase
    .from("notifications")
    .select("*, sender:profiles!notifications_sender_id_fkey(id, full_name, avatar_url)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const unreadCount = data?.filter(n => !n.is_read).length || 0;
  return { data: data || [], unreadCount, error };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", user.id);
  return { error };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("is_read", false);
  return { error };
}

export async function getUnreadNotificationCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);
  return count || 0;
}

export async function createNotification(payload: {
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  entity_type?: string;
  entity_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("notifications").insert({
    ...payload,
    sender_id: user?.id || null,
  });
  return { error };
}

export async function createBulkNotification(
  recipientIds: string[],
  payload: { type: string; title: string; message: string; link?: string; entity_type?: string; entity_id?: string; }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const notifications = recipientIds.map(id => ({
    ...payload,
    recipient_id: id,
    sender_id: user?.id || null,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  return { error };
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("recipient_id", user.id);
  return { error };
}

// ============================================================
// AUDIT LOG ACTIONS
// ============================================================

export async function logAuditEvent(payload: {
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_label?: string;
  old_values?: any;
  new_values?: any;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("audit_logs").insert({
    user_id: user?.id || null,
    ...payload,
    old_values: payload.old_values ? payload.old_values : null,
    new_values: payload.new_values ? payload.new_values : null,
  });
}

export async function getAuditLogs(filter?: {
  userId?: string;
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();
  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    return { data: [], error: new Error("Unauthorized") };
  }

  let query = supabase
    .from("audit_logs")
    .select("*, user:profiles!audit_logs_user_id_fkey(id, full_name, email, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(filter?.limit || 200);

  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.entityType) query = query.eq("entity_type", filter.entityType);
  if (filter?.action) query = query.eq("action", filter.action);
  if (filter?.dateFrom) query = query.gte("created_at", filter.dateFrom);
  if (filter?.dateTo) query = query.lte("created_at", filter.dateTo + "T23:59:59Z");

  const { data, error } = await query;
  return { data: data || [], error };
}

// ============================================================
// CALENDAR ACTIONS
// ============================================================

export async function getCompanyEvents(filter?: {
  month?: number; year?: number; eventType?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  let query = supabase
    .from("company_events")
    .select("*, creator:profiles!company_events_created_by_fkey(id, full_name)")
    .eq("is_public", true)
    .order("start_date", { ascending: true });

  if (filter?.eventType) query = query.eq("event_type", filter.eventType);
  if (filter?.month !== undefined && filter?.year !== undefined) {
    const start = `${filter.year}-${String(filter.month + 1).padStart(2, "0")}-01`;
    const end = new Date(filter.year, filter.month + 1, 0).toISOString().split("T")[0];
    query = query.gte("start_date", start).lte("start_date", end);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function createCompanyEvent(payload: {
  title: string; description?: string; event_type: string; color?: string;
  start_date: string; end_date?: string; start_time?: string; end_time?: string;
  is_all_day?: boolean; target_user_ids?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("company_events")
    .insert({ ...payload, created_by: user.id })
    .select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function updateCompanyEvent(id: string, payload: Partial<{
  title: string; description: string; start_date: string; end_date: string;
  color: string; is_all_day: boolean;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_events").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteCompanyEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("company_events").delete().eq("id", id);
  revalidatePath("/dashboard");
  return { error };
}

// Auto-generate birthday + anniversary events from profiles
export async function syncEmployeeCalendarEvents() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, joining_date")
    .in("role", ["admin", "hr_manager", "project_manager", "team_lead", "staff", "intern", "finance_manager", "recruiter"]);

  if (!profiles) return;

  const currentYear = new Date().getFullYear();
  const eventsToUpsert: any[] = [];

  for (const p of profiles) {
    if (p.joining_date) {
      const joining = new Date(p.joining_date);
      const anniversaryDate = `${currentYear}-${String(joining.getMonth() + 1).padStart(2, "0")}-${String(joining.getDate()).padStart(2, "0")}`;
      eventsToUpsert.push({
        title: `🎂 ${p.full_name}'s Work Anniversary`,
        event_type: "anniversary",
        start_date: anniversaryDate,
        is_all_day: true,
        color: "#6366F1",
        linked_entity_type: "profile",
        linked_entity_id: p.id,
        created_by: null,
      });
    }
  }

  if (eventsToUpsert.length > 0) {
    await supabase.from("company_events").upsert(eventsToUpsert, {
      onConflict: "linked_entity_id,event_type,start_date",
      ignoreDuplicates: true,
    });
  }
}
