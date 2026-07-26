"use server";

import { createClient } from "../../supabase/server";
import { createAdminClient } from "../../supabase/admin";
import { revalidatePath } from "next/cache";
import type { StaffAnnouncement, StaffLocation } from "@/types/erp";

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

export async function checkIn(
  userId: string,
  taskDescription?: string,
  checkInPhotoUrl?: string,
  locationData?: {
    location: string;
    lat?: number;
    lng?: number;
  }
) {
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
        check_out: null,
        task_description: updatedTask,
        check_in_photo_url: checkInPhotoUrl || existing.check_in_photo_url,
        ...(locationData && {
          check_in_location: locationData.location,
          check_in_lat: locationData.lat,
          check_in_lng: locationData.lng,
        }),
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
        sessions,
        ...(locationData && {
          check_in_location: locationData.location,
          check_in_lat: locationData.lat,
          check_in_lng: locationData.lng,
        }),
      })
      .select()
      .single();

    revalidatePath("/dashboard");
    return { data, error };
  }
}

export async function checkOut(
  userId: string,
  completedTasks?: string,
  checkOutPhotoUrl?: string,
  taskCompleted?: boolean,
  taskProofUrls?: string[],
  locationData?: {
    location: string;
    lat?: number;
    lng?: number;
  }
) {
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
      check_out: checkOutTime,
      sessions,
      completed_tasks: updatedTasks,
      check_out_photo_url: checkOutPhotoUrl || existing.check_out_photo_url,
      ...(taskCompleted !== undefined && { task_completed: taskCompleted }),
      ...(taskProofUrls && taskProofUrls.length > 0 && { task_proof_urls: taskProofUrls }),
      ...(locationData && {
        check_out_location: locationData.location,
        check_out_lat: locationData.lat,
        check_out_lng: locationData.lng,
      }),
    })
    .eq("id", existing.id)
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error };
}

/**
 * Calculates distance between two points in meters using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function syncHeartbeat(userId: string, lat: number, lng: number) {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .is("check_out", null)
    .maybeSingle();

  if (!attendance) return { status: "not_checked_in" };

  // Get user's active/locked location
  const { data: locations } = await supabase
    .from("staff_locations")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  let isOutside = false;
  let currentStatus = "Active";
  let outsideSince = attendance.outside_since;

  if (locations && locations.length > 0) {
    // Check if the user is within ANY of their active locations
    const withinAny = locations.some((loc) => {
      if (!loc.lat || !loc.lng) return true; // If no coords set, assume inside
      const dist = calculateDistance(lat, lng, loc.lat, loc.lng);
      return dist <= (loc.radius_meters || 100);
    });

    if (!withinAny) {
      isOutside = true;
      currentStatus = "Outside Location";
      if (!outsideSince) outsideSince = now.toISOString();
    } else {
      currentStatus = "Active";
      outsideSince = null;
    }
  }

  // Check if outside for more than 5 minutes
  if (outsideSince && isOutside) {
    const outsideTime = new Date(outsideSince);
    const diffMin = (now.getTime() - outsideTime.getTime()) / (1000 * 60);
    if (diffMin >= 5) {
      await checkOut(userId, "Auto Checked-Out: Moved outside allowed area", undefined, false, [], {
        location: "Outside Allowed Area",
        lat,
        lng,
      });
      // Update check_out reason specifically
      await supabase
        .from("attendance")
        .update({ checkout_reason: "Moved خارج allowed area" })
        .eq("id", attendance.id);

      return { status: "auto_checked_out", reason: "Moved outside allowed area" };
    }
  }

  const movementHistory = attendance.movement_history || [];
  movementHistory.push({ lat, lng, timestamp: now.toISOString(), status: currentStatus });
  // Keep history manageable
  if (movementHistory.length > 100) movementHistory.shift();

  const { error } = await supabase
    .from("attendance")
    .update({
      last_active_time: now.toISOString(),
      tracking_status: currentStatus,
      outside_since: outsideSince,
      movement_history: movementHistory,
    })
    .eq("id", attendance.id);

  return { error, status: currentStatus };
}

export async function sweepOfflineAttendance() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Find all active attendance records
  const { data: activeAttendances } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", today)
    .is("check_out", null);

  if (!activeAttendances) return { count: 0 };

  let count = 0;
  for (const att of activeAttendances) {
    const lastActive = att.last_active_time ? new Date(att.last_active_time) : new Date(att.check_in);
    const diffOfflineMin = (now.getTime() - lastActive.getTime()) / (1000 * 60);

    // Rule 1: Offline more than 10 minutes
    if (diffOfflineMin >= 10) {
      // Auto checkout and cap at last active time
      const sessions = att.sessions || [];
      if (sessions.length > 0) {
        sessions[sessions.length - 1].check_out = lastActive.toISOString();
      }

      await supabase
        .from("attendance")
        .update({
          check_out: lastActive.toISOString(),
          sessions,
          checkout_reason: "Offline/Inactivity",
          tracking_status: "Auto Checked-Out",
        })
        .eq("id", att.id);
      
      count++;
      continue;
    }

    // Rule 2: Outside more than 5 minutes (redundant check for syncHeartbeat failure)
    if (att.outside_since) {
      const outsideSince = new Date(att.outside_since);
      const diffOutsideMin = (now.getTime() - outsideSince.getTime()) / (1000 * 60);
      if (diffOutsideMin >= 5) {
        await checkOut(att.user_id, "Auto Checked-Out: Moved outside allowed area");
        await supabase
          .from("attendance")
          .update({ checkout_reason: "Moved خارج allowed area" })
          .eq("id", att.id);
        count++;
      }
    }
  }

  if (count > 0) revalidatePath("/dashboard");
  return { count };
}


export async function autoManageAbsencesInternal() {
  const supabase = createAdminClient();
  
  const settings = await getAttendanceSettings();
  const holidays = new Set(settings.holidays || []);

  const { data: staffList } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "staff")
    .eq("status", "active");

  if (!staffList || staffList.length === 0) return { error: null, count: 0 };

  const today = new Date();
  const datesToCheck: string[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    if (holidays.has(dateStr)) continue;
    
    datesToCheck.push(dateStr);
  }
  
  if (datesToCheck.length === 0) return { error: null, count: 0 };

  const minDate = datesToCheck[datesToCheck.length - 1];
  const maxDate = datesToCheck[0];

  const { data: leaves } = await supabase
    .from("leave_requests")
    .select("user_id, start_date, end_date")
    .eq("status", "approved")
    .or(`and(start_date.lte.${maxDate},end_date.gte.${minDate})`);

  const approvedLeavesMap = new Set<string>();
  if (leaves) {
    for (const leave of leaves) {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      for (const dateStr of datesToCheck) {
        const currentDate = new Date(dateStr);
        if (currentDate >= start && currentDate <= end) {
          approvedLeavesMap.add(`${leave.user_id}_${dateStr}`);
        }
      }
    }
  }

  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("id, user_id, date, status")
    .in("date", datesToCheck);

  const existingMap = new Map<string, { id: string; status: string }>(
    existingAttendance?.map(r => [`${r.user_id}_${r.date}`, { id: r.id, status: r.status }]) || []
  );

  const recordsToUpsert: any[] = [];
  
  for (const date of datesToCheck) {
    for (const staff of staffList) {
      const key = `${staff.id}_${date}`;
      const isOnLeave = approvedLeavesMap.has(key);
      const existing = existingMap.get(key);

      if (!existing) {
        recordsToUpsert.push({
          user_id: staff.id,
          date,
          status: isOnLeave ? "on_leave" : "absent",
          task_description: isOnLeave ? "Approved Leave" : "Auto-managed absent",
          notes: isOnLeave ? "Auto-managed: Approved Leave" : "Auto-managed absent",
          created_by: null,
        });
      } else if (existing.status === "absent" && isOnLeave) {
        recordsToUpsert.push({
          id: existing.id,
          user_id: staff.id,
          date,
          status: "on_leave",
          task_description: "Approved Leave (Retroactive)",
          notes: "Auto-managed: Retroactive Approved Leave",
        });
      }
    }
  }

  if (recordsToUpsert.length > 0) {
    const { error } = await supabase
      .from("attendance")
      .upsert(recordsToUpsert, { onConflict: "user_id,date" });
    
    if (error) return { error };
  }

  return { error: null, count: recordsToUpsert.length };
}

export async function autoManageAbsences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: new Error("Unauthorized") };
  }

  const result = await autoManageAbsencesInternal();
  revalidatePath("/dashboard");
  return result;
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
  status: "present" | "absent" | "late" | "half_day" | "on_leave";
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
    on_leave: 0,
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
  const onLeave = result.filter((s) => s.attendance?.status === "on_leave").length;
  // if no attendance record, or status is absent, count as absent
  const absent = result.filter((s) => !s.attendance || s.attendance.status === "absent").length;

  return {
    data: result,
    stats: { present, late, absent, onLeave, total: staffList?.length || 0 },
    error: null,
  };
}

// ============================================================
// STAFF LOCATION MANAGEMENT
// ============================================================

export async function getMyLocations(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_locations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return { data, error };
}

export async function saveStaffLocation(
  userId: string,
  name: string,
  lat?: number,
  lng?: number,
  radiusMeters: number = 200
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_locations")
    .upsert(
      { user_id: userId, name, lat, lng, radius_meters: radiusMeters, is_active: true, updated_at: new Date().toISOString() },
      { onConflict: "user_id,name" }
    )
    .select()
    .single();

  // Lock location after first setup
  if (!error && data) {
    await supabase
      .from("staff_locations")
      .update({ is_locked: true })
      .eq("id", data.id);
  }

  return { data, error };
}

export async function unlockStaffLocation(locationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: new Error("Unauthorized") };
  }

  const { error } = await supabase
    .from("staff_locations")
    .update({ is_locked: false })
    .eq("id", locationId);

  return { error };
}


export async function deleteStaffLocation(locationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_locations")
    .delete()
    .eq("id", locationId);
  return { error };
}

// ============================================================
// STAFF ANNOUNCEMENTS / TASKS
// ============================================================

export async function getAnnouncements(userId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("staff_announcements")
    .select(`*, creator:profiles!staff_announcements_created_by_fkey(id, full_name, email), reads:staff_announcement_reads(user_id)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error || !data) return { data: [], error };

  // Auto-fix any empty arrays to null for "All Staff" tasks/announcements
  // this resolves issues where RLS blocks empty arrays {} if they were accidentally saved
  for (const a of data) {
    if (a.target_user_ids !== null && Array.isArray(a.target_user_ids) && a.target_user_ids.length === 0) {
      try {
        await supabase.from("staff_announcements").update({ target_user_ids: null }).eq("id", a.id);
        a.target_user_ids = null; // Update local memory as well
      } catch (e) {
        // Ignore if we lack permission (e.g. normal staff)
      }
    }
  }

  if (userId) {
    // Filter: target_user_ids null/empty means all staff
    const filtered = data.filter((a: any) => {
      if (!a.target_user_ids || a.target_user_ids.length === 0) return true;
      return a.target_user_ids.includes(userId);
    });

    // Get read receipts for this user
    const { data: reads } = await supabase
      .from("staff_announcement_reads")
      .select("announcement_id")
      .eq("user_id", userId);

    const readSet = new Set((reads || []).map((r: any) => r.announcement_id));

    return {
      data: filtered.map((a: any) => ({ ...a, is_read: readSet.has(a.id) })),
      error: null,
    };
  }

  return { data, error: null };
}

export async function createAnnouncement(payload: {
  title: string;
  body: string;
  type: string;
  priority: string;
  target_user_ids?: string[] | null;
  scheduled_date?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (payload.target_user_ids && payload.target_user_ids.length === 0) {
    payload.target_user_ids = null;
  }

  const { data, error } = await supabase
    .from("staff_announcements")
    .insert({ ...payload, created_by: user?.id })
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<{
    title: string;
    body: string;
    type: string;
    priority: string;
    target_user_ids: string[] | null;
    is_active: boolean;
    scheduled_date: string;
  }>
) {
  const supabase = await createClient();

  if (payload.target_user_ids !== undefined && (payload.target_user_ids === null || payload.target_user_ids.length === 0)) {
    payload.target_user_ids = null;
  }

  const { data, error } = await supabase
    .from("staff_announcements")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_announcements")
    .delete()
    .eq("id", id);
  revalidatePath("/dashboard");
  return { error };
}

export async function markAnnouncementRead(announcementId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_announcement_reads")
    .upsert({ announcement_id: announcementId, user_id: userId }, { onConflict: "announcement_id,user_id" });
  return { error };
}
