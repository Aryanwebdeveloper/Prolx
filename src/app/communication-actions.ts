"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TeamMessage = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  reads?: { user_id: string; full_name: string }[];
};

export type StaffTask = {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done" | "cancelled";
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string; avatar_url?: string; role: string };
  assigner?: { full_name: string };
};

export type StaffMember = {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
};

// ─── Team Chat Actions ────────────────────────────────────────────────────────

/**
 * Fetch the latest N team messages (newest first, reversed for display).
 */
export async function getTeamMessages(limit = 80): Promise<{ data: TeamMessage[]; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("team_messages")
    .select(`
      id, sender_id, content, created_at,
      profiles!sender_id(full_name, avatar_url, role),
      team_message_reads(
        user_id,
        profiles(full_name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  const messages: TeamMessage[] = (data || []).map((row: any) => ({
    id: row.id,
    sender_id: row.sender_id,
    content: row.content,
    created_at: row.created_at,
    sender: row.profiles
      ? {
          full_name: row.profiles.full_name || "Unknown",
          avatar_url: row.profiles.avatar_url,
          role: row.profiles.role,
        }
      : undefined,
    reads: row.team_message_reads
      ? row.team_message_reads
          .map((r: any) => ({
            user_id: r.user_id,
            full_name: r.profiles?.full_name || "Unknown"
          }))
      : [],
  }));

  // Return in ascending order (oldest first) for display
  return { data: messages.reverse(), error: null };
}

/**
 * Send a message to the global team chat.
 */
export async function sendTeamMessage(content: string): Promise<{ error: string | null }> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "Message cannot be empty" };
  if (trimmed.length > 2000) return { error: "Message too long (max 2000 chars)" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify the user is staff or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role) || profile.status !== "active") {
    return { error: "Access denied" };
  }

  const { error } = await supabase.from("team_messages").insert({
    sender_id: user.id,
    content: trimmed,
  });

  return { error: error ? error.message : null };
}

/**
 * Delete a team message (sender or admin only).
 */
export async function deleteTeamMessage(messageId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("team_messages").delete().eq("id", messageId);
  return { error: error ? error.message : null };
}

/**
 * Mark a batch of messages as read by the current user.
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<{ error: string | null }> {
  if (messageIds.length === 0) return { error: null };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const rows = messageIds.map((msgId) => ({
    message_id: msgId,
    user_id: user.id,
  }));

  const { error } = await supabase
    .from("team_message_reads")
    .upsert(rows, { onConflict: "message_id,user_id" });

  return { error: error ? error.message : null };
}

// ─── Task Actions ─────────────────────────────────────────────────────────────

/**
 * Get tasks. Admins see all; staff see only their own.
 */
export async function getStaffTasks(): Promise<{ data: StaffTask[]; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("staff_tasks")
    .select(`
      id, title, description, assigned_to, assigned_by, priority, status, due_date, created_at, updated_at,
      assignee:profiles!assigned_to(full_name, avatar_url, role),
      assigner:profiles!assigned_by(full_name)
    `)
    .order("created_at", { ascending: false });

  // Staff only see their own tasks
  if (profile?.role === "staff") {
    query = query.eq("assigned_to", user.id);
  }

  const { data, error } = await query;

  if (error) return { data: [], error: error.message };

  const tasks: StaffTask[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    assigned_to: row.assigned_to,
    assigned_by: row.assigned_by,
    priority: row.priority,
    status: row.status,
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assignee: row.assignee
      ? { full_name: row.assignee.full_name, avatar_url: row.assignee.avatar_url, role: row.assignee.role }
      : undefined,
    assigner: row.assigner ? { full_name: row.assigner.full_name } : undefined,
  }));

  return { data: tasks, error: null };
}

/**
 * Create a task — admin only. Sends email notification to the assigned staff member.
 */
export async function createStaffTask(payload: {
  title: string;
  description?: string;
  assigned_to: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
}): Promise<{ data: StaffTask | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    return { data: null, error: "Only admins can assign tasks" };
  }

  // Fetch assignee profile for the email
  const { data: assigneeProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", payload.assigned_to)
    .single();

  const { data, error } = await supabase
    .from("staff_tasks")
    .insert({
      title: payload.title,
      description: payload.description || null,
      assigned_to: payload.assigned_to,
      assigned_by: user.id,
      priority: payload.priority,
      due_date: payload.due_date || null,
      status: "todo",
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Send email notification to the assigned staff member
  if (assigneeProfile?.email) {
    try {
      const { sendEmail } = await import("@/lib/email");
      const priorityColors: Record<string, string> = {
        urgent: "#EF4444",
        high: "#F97316",
        medium: "#3B82F6",
        low: "#64748B",
      };
      const color = priorityColors[payload.priority] || "#3B82F6";
      const dueDateStr = payload.due_date
        ? new Date(payload.due_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : "No due date set";

      await sendEmail({
        to: assigneeProfile.email,
        subject: `[Task Assigned] ${payload.title}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <tr>
          <td style="background:#0F172A;padding:28px 32px;text-align:center;">
            <span style="display:inline-block;width:36px;height:36px;background:#0D9488;border-radius:8px;line-height:36px;color:#fff;font-weight:800;font-size:14px;margin-bottom:12px;">Px</span>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">New Task Assigned</h1>
            <p style="margin:8px 0 0;color:#94A3B8;font-size:13px;">Prolx Internal Task System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;color:#64748B;font-size:14px;">Hi <strong style="color:#0F172A;">${assigneeProfile.full_name}</strong>,</p>
            <p style="margin:0 0 24px;color:#64748B;font-size:14px;">A new task has been assigned to you by <strong>${adminProfile.full_name}</strong>.</p>
            
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#0F172A;font-size:17px;font-weight:700;">${payload.title}</h2>
              ${payload.description ? `<p style="margin:0 0 16px;color:#64748B;font-size:14px;line-height:1.6;">${payload.description}</p>` : ""}
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:6px 0;"><span style="color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Priority</span></td>
                  <td style="padding:6px 0;text-align:right;">
                    <span style="display:inline-block;padding:2px 10px;background:${color}20;color:${color};border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;">${payload.priority}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-top:1px solid #F1F5F9;"><span style="color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Due Date</span></td>
                  <td style="padding:6px 0;border-top:1px solid #F1F5F9;text-align:right;"><span style="color:#0F172A;font-size:13px;font-weight:500;">${dueDateStr}</span></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-top:1px solid #F1F5F9;"><span style="color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Assigned by</span></td>
                  <td style="padding:6px 0;border-top:1px solid #F1F5F9;text-align:right;"><span style="color:#0F172A;font-size:13px;font-weight:500;">${adminProfile.full_name}</span></td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;margin-bottom:24px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.cloud"}/dashboard" 
                 style="display:inline-block;padding:12px 28px;background:#0D9488;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
                View My Tasks →
              </a>
            </div>

            <p style="margin:0;color:#94A3B8;font-size:12px;text-align:center;">
              This is an automated notification from the Prolx internal team system.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;text-align:center;">
            <p style="margin:0;color:#CBD5E1;font-size:11px;">© 2025 Prolx. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error("Task assignment email error:", emailErr);
      // Don't fail the whole operation for email errors
    }
  }

  revalidatePath("/dashboard");
  return { data: data as StaffTask, error: null };
}

/**
 * Update a task's status (staff update their own; admin can update any).
 */
export async function updateTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "done" | "cancelled"
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  revalidatePath("/dashboard");
  return { error: error ? error.message : null };
}

/**
 * Delete a task — admin only.
 */
export async function deleteStaffTask(taskId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can delete tasks" };
  }

  const { error } = await supabase.from("staff_tasks").delete().eq("id", taskId);
  revalidatePath("/dashboard");
  return { error: error ? error.message : null };
}

/**
 * Get all active staff members for the task assignment dropdown.
 */
export async function getStaffList(): Promise<{ data: StaffMember[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .in("role", ["admin", "staff"])
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) return { data: [], error: error.message };

  return {
    data: (data || []) as StaffMember[],
    error: null,
  };
}

/**
 * Get the total number of unread team messages for the current user.
 */
export async function getUnreadMessagesCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // Fetch all messages
  const { data: messages } = await supabase
    .from("team_messages")
    .select("id, sender_id");

  if (!messages) return 0;

  // Fetch reads for this user
  const { data: reads } = await supabase
    .from("team_message_reads")
    .select("message_id")
    .eq("user_id", user.id);

  const readSet = new Set((reads || []).map((r) => r.message_id));

  const unreadCount = messages.filter(
    (m) => m.sender_id !== user.id && !readSet.has(m.id)
  ).length;

  return unreadCount;
}

// ============================================================
// TASK EXTENDED ACTIONS (CHECKLISTS, COMMENTS, TIME LOGS)
// ============================================================

export async function getTaskChecklist(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_checklists")
    .select("*")
    .eq("task_id", taskId)
    .order("order_index", { ascending: true });
  return { data: data || [], error };
}

export async function addTaskChecklistItem(taskId: string, title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_checklists")
    .insert({ task_id: taskId, title, is_completed: false })
    .select()
    .single();
  return { data, error };
}

export async function toggleTaskChecklistItem(itemId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_checklists")
    .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
    .eq("id", itemId)
    .select()
    .single();
  return { data, error };
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, user:profiles(id, full_name, avatar_url)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  return { data: data || [], error };
}

export async function addTaskComment(taskId: string, content: string, attachmentUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, user_id: user.id, content, attachment_url: attachmentUrl || null })
    .select("*, user:profiles(id, full_name, avatar_url)")
    .single();
  return { data, error };
}

export async function logTaskTime(taskId: string, durationMinutes: number, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch task details to get project_id if linked
  const { data: task } = await supabase.from("staff_tasks").select("project_id").eq("id", taskId).single();

  const { error } = await supabase.from("time_logs").insert({
    user_id: user.id,
    task_id: taskId,
    project_id: task?.project_id || null,
    description,
    started_at: new Date(Date.now() - durationMinutes * 60000).toISOString(),
    ended_at: new Date().toISOString(),
    duration_minutes: durationMinutes,
    is_billable: true
  });
  return { error };
}

export async function updateTaskProgress(taskId: string, progress: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_tasks")
    .update({ progress, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  return { error };
}
