"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// ATTENDANCE SETTINGS
// ============================================================

export type AttendanceSettings = {
  expectedCheckInTime: string; // e.g. "09:00" (HH:mm)
  holidays: string[]; // e.g. ["2026-03-25", "2026-12-25"]
};

export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "attendance_config")
    .maybeSingle();

  if (data?.value) {
    return data.value as AttendanceSettings;
  }
  return { expectedCheckInTime: "09:00", holidays: [] };
}

export async function updateAttendanceSettings(settings: AttendanceSettings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: new Error("Unauthorized") };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "attendance_config", value: settings as any });

  revalidatePath("/dashboard");
  return { error };
}

// ============================================================
// ATTENDANCE ACTIONS
// ============================================================

export async function getTodayAttendance(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();
  return { data, error };
}

export async function checkIn(userId: string, taskDescription?: string, checkInPhotoUrl?: string) {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const checkInTime = now.toISOString();

  // Get existing record to see if this is a return from break
  const { data: existing } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    const sessions = existing.sessions || [];
    const isAlreadyCheckedIn = sessions.length > 0 && !sessions[sessions.length - 1].check_out;
    if (isAlreadyCheckedIn) {
      return { data: existing, error: new Error("You are already checked in.") };
    }

    sessions.push({ check_in: checkInTime, check_out: null });
    
    const updatedTask = existing.task_description && taskDescription 
                         ? existing.task_description + "\n\n(Break Return) " + taskDescription 
                         : taskDescription || existing.task_description;

    const { data, error } = await supabase
      .from("attendance")
      .update({
        sessions,
        check_out: null, // Clear root check_out to indicate currently active
        task_description: updatedTask,
        check_in_photo_url: checkInPhotoUrl || existing.check_in_photo_url
      })
      .eq("id", existing.id)
      .select()
      .single();

    revalidatePath("/dashboard");
    return { data, error };
  } else {
    // Very first check-in of the day
    const settings = await getAttendanceSettings();
    const [expectedHour, expectedMinute] = settings.expectedCheckInTime.split(":").map(Number);
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > expectedHour || (hour === expectedHour && minute > expectedMinute);
    const status = isLate ? "late" : "present";

    const sessions = [{ check_in: checkInTime, check_out: null }];

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: userId,
        date: today,
        check_in: checkInTime,
        status,
        task_description: taskDescription,
        check_in_photo_url: checkInPhotoUrl || null,
        created_by: userId,
        sessions
      })
      .select()
      .single();

    revalidatePath("/dashboard");
    return { data, error };
  }
}

export async function checkOut(userId: string, completedTasks?: string, checkOutPhotoUrl?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const checkOutTime = new Date().toISOString();

  const { data: existing, error: fetchErr } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (!existing || fetchErr) {
    return { data: null, error: new Error("No check-in record found for today") };
  }

  const sessions = existing.sessions || [];
  if (sessions.length === 0 || sessions[sessions.length - 1].check_out) {
    return { data: existing, error: new Error("You are already checked out.") };
  }

  // Close the current session
  sessions[sessions.length - 1].check_out = checkOutTime;

  const updatedTasks = existing.completed_tasks && completedTasks
                       ? existing.completed_tasks + "\n\n(Break Out) " + completedTasks
                       : completedTasks || existing.completed_tasks;

  const { data, error } = await supabase
    .from("attendance")
    .update({ 
      check_out: checkOutTime, // Root checkout
      sessions,
      completed_tasks: updatedTasks,
      check_out_photo_url: checkOutPhotoUrl || existing.check_out_photo_url
    })
    .eq("id", existing.id)
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error };
}

export async function autoManageAbsences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: new Error("Unauthorized") };
  }

  const settings = await getAttendanceSettings();
  const holidays = new Set(settings.holidays);

  // Get all staff
  const { data: staffList } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "staff")
    .eq("status", "active");

  if (!staffList || staffList.length === 0) return { error: null };

  // Calculate past working days (let's say we check the last 7 days)
  const today = new Date();
  const datesToCheck: string[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Skip weekends (0 is Sunday, 6 is Saturday)
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    // Skip holidays
    if (holidays.has(dateStr)) continue;
    
    datesToCheck.push(dateStr);
  }

  // Get existing attendance for these days
  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("user_id, date")
    .in("date", datesToCheck);

  const existingMap = new Set(
    existingAttendance?.map(r => `${r.user_id}_${r.date}`) || []
  );

  const missingRecords: any[] = [];
  
  // Find missing records and insert as absent
  for (const date of datesToCheck) {
    for (const staff of staffList) {
      if (!existingMap.has(`${staff.id}_${date}`)) {
        missingRecords.push({
          user_id: staff.id,
          date,
          status: "absent",
          created_by: user?.id,
          task_description: "Auto-managed absent",
        });
      }
    }
  }

  if (missingRecords.length > 0) {
    const { error } = await supabase
      .from("attendance")
      .upsert(missingRecords, { onConflict: "user_id,date" });
    
    if (error) return { error };
  }

  revalidatePath("/dashboard");
  return { error: null, count: missingRecords.length };
}

export async function getMyAttendance(
  userId: string,
  filter?: { startDate?: string; endDate?: string; month?: string }
) {
  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filter?.startDate) query = query.gte("date", filter.startDate);
  if (filter?.endDate) query = query.lte("date", filter.endDate);
  if (filter?.month) {
    const [year, month] = filter.month.split("-");
    const start = `${year}-${month}-01`;
    const end = new Date(Number(year), Number(month), 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getAllAttendance(filter?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  month?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select(`*, user:profiles!attendance_user_id_fkey(id, full_name, email, avatar_url, role)`)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);
  if (filter?.startDate) query = query.gte("date", filter.startDate);
  if (filter?.endDate) query = query.lte("date", filter.endDate);
  if (filter?.month) {
    const [year, month] = filter.month.split("-");
    const start = `${year}-${month}-01`;
    const end = new Date(Number(year), Number(month), 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function upsertAttendance(payload: {
  user_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "present" | "absent" | "late" | "half_day";
  notes?: string;
  task_description?: string;
  completed_tasks?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      { ...payload, created_by: user?.id },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteAttendance(attendanceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("id", attendanceId);
  revalidatePath("/dashboard");
  return { error };
}

export async function getAttendanceSummary(filter?: {
  userId?: string;
  month?: string;
}) {
  const supabase = await createClient();
  let query = supabase.from("attendance").select("status, user_id");

  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.month) {
    const [year, month] = filter.month.split("-");
    const start = `${year}-${month}-01`;
    const end = new Date(Number(year), Number(month), 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  if (error) return { data: null, error };

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    total: data?.length || 0,
  };

  data?.forEach((r) => {
    if (r.status in summary) summary[r.status as keyof typeof summary]++;
  });

  return { data: summary, error: null };
}

export async function getTodayAllAttendance() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get all active staff
  const { data: staffList } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("role", "staff")
    .eq("status", "active");

  // Get today's attendance records
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", today);

  const attendanceMap = new Map(
    attendanceRecords?.map((r) => [r.user_id, r]) || []
  );

  const result = (staffList || []).map((staff) => ({
    ...staff,
    attendance: attendanceMap.get(staff.id) || null,
  }));

  const present = result.filter((s) => s.attendance?.status === "present").length;
  const late = result.filter((s) => s.attendance?.status === "late").length;
  const absent = result.filter((s) => !s.attendance || s.attendance.status === "absent").length;

  return {
    data: result,
    stats: { present, late, absent, total: staffList?.length || 0 },
    error: null,
  };
}
