"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, CheckCircle, AlertCircle, LogIn, LogOut, Camera, MapPin,
  Home, Building2, Globe, WifiOff, Plus, Trash2, RefreshCw, Bell, BellDot,
  X, Check, ChevronRight, Upload
} from "lucide-react";
import {
  getTodayAttendance, checkIn, checkOut, getMyAttendance,
  getMyLocations, saveStaffLocation, deleteStaffLocation,
  getAnnouncements, markAnnouncementRead
} from "@/app/attendance-actions";
import type { AttendanceRecord, StaffLocation, StaffAnnouncement } from "@/types/erp";
import { createClient } from "../../../supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type AttendanceStatus = "present" | "absent" | "late" | "half_day";

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  absent: { label: "Absent", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  late: { label: "Late", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  half_day: { label: "Half Day", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
} as const;

const LOCATION_ICONS: Record<string, any> = {
  Home, Office: Building2, Outside: Globe, Offline: WifiOff,
};
const LOCATION_COLORS: Record<string, string> = {
  Home: "bg-blue-100 text-blue-700",
  Office: "bg-emerald-100 text-emerald-700",
  Outside: "bg-orange-100 text-orange-700",
  Offline: "bg-gray-100 text-gray-500",
};
const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};
const TYPE_CONFIG = {
  announcement: { label: "Announcement", icon: Bell },
  task: { label: "Task", icon: CheckCircle },
  meeting: { label: "Meeting", icon: Clock },
  urgent: { label: "Urgent", icon: AlertCircle },
};

function LocationBadge({ location }: { location?: string | null }) {
  if (!location) return null;
  const Icon = LOCATION_ICONS[location] || Globe;
  const color = LOCATION_COLORS[location] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      <Icon size={12} />{location}
    </span>
  );
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function calcDuration(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "—";
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function calcTotalDuration(sessions: Array<{ check_in: string; check_out: string | null }> | null | undefined): string {
  if (!sessions || sessions.length === 0) return "—";
  let totalDiff = 0;
  for (const s of sessions) {
    if (s.check_in && s.check_out) {
      totalDiff += new Date(s.check_out).getTime() - new Date(s.check_in).getTime();
    }
  }
  if (totalDiff <= 0) return "—";
  const h = Math.floor(totalDiff / 3600000);
  const m = Math.floor((totalDiff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-mono font-bold text-[#0F172A] tracking-wider tabular-nums">{time}</div>
      <div className="text-sm text-[#64748B] mt-2">{date}</div>
    </div>
  );
}

// ─── Location Setup Modal ─────────────────────────────────────────
function LocationSetupModal({
  userId, locations, onClose, onSaved,
}: { userId: string; locations: StaffLocation[]; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getCurrentPosition = () => {
    setGettingLocation(true);
    setError("");
    if (!navigator.geolocation) { setError("Geolocation not supported."); setGettingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
        setSuccess("GPS captured!");
        setTimeout(() => setSuccess(""), 3000);
      },
      (err) => { setError("Could not get location: " + err.message); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!newName.trim()) { setError("Enter a location name."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await saveStaffLocation(userId, newName.trim(), currentCoords?.lat, currentCoords?.lng);
    setSaving(false);
    if (err) { setError(err.message); } else { setNewName(""); setCurrentCoords(null); onSaved(); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteStaffLocation(id);
    setDeleting(null);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MapPin size={18} className="text-[#0D9488]" /> My Work Locations</DialogTitle>
          <DialogDescription>Set predefined working locations for automatic location detection during attendance.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {locations.length > 0 && (
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[#0D9488]" />
                    <span className="text-sm font-medium text-[#0F172A]">{loc.name}</span>
                    {loc.lat && loc.lng && (
                      <span className="text-[10px] text-[#94A3B8] font-mono">({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    {deleting === loc.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-[#0F172A]">Add New Location</p>
            <input type="text" placeholder="e.g. Home, Office, Branch"
              value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            />
            <div className="flex gap-2">
              <button onClick={getCurrentPosition} disabled={gettingLocation}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F0FDFA] hover:border-[#0D9488] text-[#0D9488] font-medium transition">
                {gettingLocation ? <><RefreshCw size={13} className="animate-spin" /> Getting...</> : <><MapPin size={13} /> Capture GPS</>}
              </button>
              <button onClick={handleSave} disabled={saving || !newName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 font-semibold">
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />} Save
              </button>
            </div>
            {currentCoords && <p className="text-xs text-[#0D9488] font-mono bg-[#F0FDFA] px-3 py-1.5 rounded-lg">📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}</p>}
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">✓ {success}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Announcements Panel ──────────────────────────────────────────
function AnnouncementsPanel({ userId }: { userId: string }) {
  const [announcements, setAnnouncements] = useState<StaffAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAnnouncements(userId);
    setAnnouncements((data as StaffAnnouncement[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("ann-staff")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_announcements" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleExpand = async (ann: StaffAnnouncement) => {
    setExpanded(expanded === ann.id ? null : ann.id);
    if (!ann.is_read) {
      await markAnnouncementRead(ann.id, userId);
      setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_read: true } : a));
    }
  };

  const unreadCount = announcements.filter(a => !a.is_read).length;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? <BellDot size={20} className="text-[#0D9488]" /> : <Bell size={20} className="text-[#94A3B8]" />}
          <h3 className="font-bold text-[#0F172A]">Updates & Tasks</h3>
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </div>
        <button onClick={load} className="p-1.5 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] rounded-lg"><RefreshCw size={14} /></button>
      </div>
      {loading ? (
        <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" /></div>
      ) : announcements.length === 0 ? (
        <div className="p-10 text-center">
          <Bell size={24} className="text-[#CBD5E1] mx-auto mb-2" />
          <p className="text-sm text-[#94A3B8]">No updates from admin yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F8FAFC]">
          {announcements.map((ann) => {
            const TypeIcon = TYPE_CONFIG[ann.type as keyof typeof TYPE_CONFIG]?.icon || Bell;
            const isExpanded = expanded === ann.id;
            return (
              <div key={ann.id} className={ann.is_read ? "bg-white" : "bg-[#F0FDFA]/40"}>
                <button onClick={() => handleExpand(ann)}
                  className="w-full p-4 flex items-start gap-3 text-left hover:bg-[#F8FAFC] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${ann.priority === "urgent" ? "bg-red-100" : ann.priority === "high" ? "bg-orange-100" : "bg-[#F0FDFA]"}`}>
                    <TypeIcon size={15} className={ann.priority === "urgent" ? "text-red-600" : ann.priority === "high" ? "text-orange-600" : "text-[#0D9488]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#0F172A]">{ann.title}</span>
                      {!ann.is_read && <span className="w-2 h-2 rounded-full bg-[#0D9488]" />}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[ann.priority as keyof typeof PRIORITY_CONFIG]?.color || "bg-gray-100 text-gray-600"}`}>{ann.priority}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">{ann.body}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      {new Date(ann.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {ann.creator && ` · ${ann.creator.full_name}`}
                    </p>
                  </div>
                  <ChevronRight size={13} className={`text-[#94A3B8] shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 ml-11">
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-sm text-[#475569] whitespace-pre-wrap border border-[#E2E8F0]">{ann.body}</div>
                    {ann.scheduled_date && <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1"><Clock size={11} /> Scheduled: <strong>{ann.scheduled_date}</strong></p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────
export default function AttendancePanel({ userId }: { userId: string }) {
  const supabase = createClient();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"attendance" | "updates">("attendance");

  // Location
  const [locations, setLocations] = useState<StaffLocation[]>([]);
  const [detectedLocation, setDetectedLocation] = useState<string>("Detecting...");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  // Modal
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [taskCompleted, setTaskCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const loadLocations = useCallback(async () => {
    const { data } = await getMyLocations(userId);
    setLocations((data as StaffLocation[]) || []);
  }, [userId]);

  const detectLocation = useCallback((coords: { lat: number; lng: number }, savedLocs: StaffLocation[]) => {
    if (!isOnline) { setDetectedLocation("Offline"); return; }
    for (const loc of savedLocs) {
      if (loc.lat && loc.lng && getDistanceMeters(coords.lat, coords.lng, loc.lat, loc.lng) <= loc.radius_meters) {
        setDetectedLocation(loc.name); return;
      }
    }
    setDetectedLocation("Outside");
  }, [isOnline]);

  const refreshLocation = useCallback(() => {
    if (!isOnline) { setDetectedLocation("Offline"); return; }
    if (!navigator.geolocation) { setDetectedLocation("Outside"); return; }
    setDetectedLocation("Detecting...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationCoords(coords);
        detectLocation(coords, locations);
      },
      () => setDetectedLocation("Outside"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [isOnline, locations, detectLocation]);

  useEffect(() => { loadLocations(); }, [loadLocations]);
  useEffect(() => { refreshLocation(); }, [locations, isOnline]);

  const load = useCallback(async () => {
    setLoading(true);
    const [todayRes, historyRes] = await Promise.all([
      getTodayAttendance(userId),
      getMyAttendance(userId, { month }),
    ]);
    setTodayRecord(todayRes.data as AttendanceRecord | null);
    setHistory((historyRes.data as AttendanceRecord[]) || []);
    setLoading(false);
  }, [userId, month]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("att-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance", filter: `user_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, load]);

  const uploadFiles = async (files: File[], prefix: string) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${todayRecord?.date || new Date().toISOString().split("T")[0]}/${prefix}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("attendance_proofs").upload(filePath, file);
      if (!uploadError) {
        const { data } = supabase.storage.from("attendance_proofs").getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const submitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const photoUrls = proofFiles.length > 0 ? await uploadFiles(proofFiles, userId) : [];
      const locationData = { location: isOnline ? detectedLocation : "Offline", lat: locationCoords?.lat, lng: locationCoords?.lng };
      const { error: err } = await checkIn(userId, taskDesc, photoUrls[0] || "", locationData);
      if (err) throw err;
      setShowCheckIn(false); setTaskDesc(""); setProofFiles([]);
      await load();
    } catch (err: any) { setError(err.message); }
    setActionLoading(false);
  };

  const submitCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim() || taskCompleted === null) return;
    setActionLoading(true);
    setError("");
    try {
      const proofUrls = proofFiles.length > 0 ? await uploadFiles(proofFiles, `${userId}-out`) : [];
      const locationData = { location: isOnline ? detectedLocation : "Offline", lat: locationCoords?.lat, lng: locationCoords?.lng };
      const { error: err } = await checkOut(userId, taskDesc, proofUrls[0] || "", taskCompleted, proofUrls, locationData);
      if (err) throw err;
      setShowCheckOut(false); setTaskDesc(""); setProofFiles([]); setTaskCompleted(null);
      await load();
    } catch (err: any) { setError(err.message); }
    setActionLoading(false);
  };

  const sessions = todayRecord?.sessions || [];
  const hasOpenSession = sessions.length > 0 && !sessions[sessions.length - 1].check_out;
  const canCheckIn = !todayRecord || !hasOpenSession;
  const canCheckOut = hasOpenSession;

  const summary = {
    present: history.filter(r => r.status === "present").length,
    late: history.filter(r => r.status === "late").length,
    absent: history.filter(r => r.status === "absent").length,
    half_day: history.filter(r => r.status === "half_day").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#F8FAFC] rounded-xl p-1 w-fit">
        {[{ id: "attendance", label: "Attendance" }, { id: "updates", label: "Updates & Tasks" }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === id ? "bg-white text-[#0D9488] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "updates" && <AnnouncementsPanel userId={userId} />}

      {activeTab === "attendance" && (
        <>
          {/* Clock & Check-in Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-8">
            <LiveClock />

            {/* Location Bar */}
            <div className="flex items-center justify-between mt-4 mb-4 bg-[#F8FAFC] rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <><MapPin size={14} className="text-[#0D9488]" /><span className="text-sm text-[#64748B]">Location:</span><LocationBadge location={detectedLocation} /></>
                ) : (
                  <><WifiOff size={14} className="text-gray-400" /><span className="text-sm text-gray-500">No Internet</span></>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={refreshLocation} className="p-1.5 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#F0FDFA] rounded-lg"><RefreshCw size={13} /></button>
                <button onClick={() => setShowLocationSetup(true)}
                  className="flex items-center gap-1 text-xs text-[#0D9488] hover:bg-[#F0FDFA] px-2 py-1 rounded-lg font-medium">
                  <MapPin size={11} /> Setup
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-center mb-5">
              {todayRecord ? (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.color || "bg-gray-100 text-gray-600"}`}>
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.dot || "bg-gray-400"} animate-pulse`} />
                  {STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.label || todayRecord.status} — Today
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-gray-400" /> Not Checked In Yet
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setTaskDesc(""); setProofFiles([]); setShowCheckIn(true); refreshLocation(); }}
                disabled={!canCheckIn}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${canCheckIn ? "bg-[#0D9488] text-white hover:bg-[#0f766e] shadow-lg shadow-teal-100 hover:scale-105" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                <LogIn size={18} /> Check In
              </button>
              <button onClick={() => { setTaskDesc(""); setProofFiles([]); setTaskCompleted(null); setShowCheckOut(true); refreshLocation(); }}
                disabled={!canCheckOut}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${canCheckOut ? "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg shadow-slate-100 hover:scale-105" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                <LogOut size={18} /> Check Out
              </button>
            </div>

            {/* Timestamps */}
            {todayRecord && !!todayRecord.check_in && (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#F8FAFC]">
                {[
                  { label: "First In", value: formatTime(todayRecord.check_in), icon: LogIn, color: "text-emerald-600" },
                  { label: "Last Out", value: formatTime(todayRecord.check_out), icon: LogOut, color: "text-[#0F172A]" },
                  { label: "Active Hrs", value: todayRecord.sessions?.length ? calcTotalDuration(todayRecord.sessions) : calcDuration(todayRecord.check_in, todayRecord.check_out), icon: Clock, color: "text-[#0D9488]" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="text-center">
                    <Icon size={17} className={`mx-auto mb-1 ${color}`} />
                    <div className="font-mono font-bold text-[#0F172A] text-sm">{value}</div>
                    <div className="text-xs text-[#94A3B8]">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Location proof */}
            {todayRecord?.check_in_location && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t border-[#F8FAFC]">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <MapPin size={12} className="text-[#0D9488]" /> Check-in: <LocationBadge location={todayRecord.check_in_location} />
                </div>
                {todayRecord.check_out_location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <MapPin size={12} className="text-[#94A3B8]" /> Check-out: <LocationBadge location={todayRecord.check_out_location} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Present", value: summary.present, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Late", value: summary.late, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
              { label: "Absent", value: summary.absent, color: "text-red-600", bg: "bg-red-50 border-red-100" },
              { label: "Half Day", value: summary.half_day, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                <div className="text-xs text-[#64748B] mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-bold text-[#0F172A]">Attendance History</h3>
              <input type="month" className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
                value={month} onChange={e => setMonth(e.target.value)} />
            </div>
            {history.length === 0 ? (
              <div className="p-12 text-center"><Clock size={28} className="text-[#CBD5E1] mx-auto mb-3" /><p className="text-[#64748B] text-sm">No records for this month</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#E2E8F0]">
                    {["Date", "Check In", "Check Out", "Location", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {history.map(record => {
                      const cfg = STATUS_CONFIG[record.status as AttendanceStatus] || STATUS_CONFIG.present;
                      return (
                        <tr key={record.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs text-[#64748B]">{record.date}</div>
                            {record.task_completed !== null && record.task_completed !== undefined && (
                              <div className={`flex items-center gap-1 text-[10px] mt-0.5 font-semibold ${record.task_completed ? "text-emerald-600" : "text-red-500"}`}>
                                {record.task_completed ? <Check size={10} /> : <X size={10} />} Task {record.task_completed ? "Done" : "Pending"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#0F172A]">
                            {formatTime(record.check_in)}
                            {record.task_description && <div className="text-[10px] text-[#64748B] font-sans truncate max-w-[110px]">{record.task_description}</div>}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#0F172A]">
                            {formatTime(record.check_out)}
                            {record.completed_tasks && <div className="text-[10px] text-[#64748B] font-sans truncate max-w-[110px]">{record.completed_tasks}</div>}
                          </td>
                          <td className="px-4 py-3"><LocationBadge location={record.check_in_location} /></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                            </span>
                            <div className="text-[10px] text-[#64748B] mt-0.5 font-mono">{calcTotalDuration(record.sessions)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Check In Modal */}
      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LogIn size={17} className="text-[#0D9488]" /> Check In</DialogTitle>
            <DialogDescription>Submit your check-in details for today.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckIn} className="space-y-4 mt-1">
            <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-xl px-4 py-2.5">
              <MapPin size={14} className="text-[#0D9488]" /><span className="text-sm text-[#64748B]">Location:</span>
              <LocationBadge location={isOnline ? detectedLocation : "Offline"} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Today's Planned Tasks <span className="text-red-500">*</span></label>
              <textarea required rows={3} placeholder="What tasks are you planning to work on?"
                value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proof / Photo (Optional)</label>
              <input type="file" accept="image/*,application/pdf" multiple capture="environment"
                className="w-full text-sm border border-[#E2E8F0] rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F0FDFA] file:text-[#0D9488] hover:file:bg-[#CCFBF1]"
                onChange={(e) => setProofFiles(Array.from(e.target.files || []))} />
              {proofFiles.length > 0 && <p className="text-xs text-emerald-600 mt-1">{proofFiles.length} file(s) selected</p>}
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={actionLoading || !taskDesc.trim()}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : <><LogIn size={14} /> Confirm Check In</>}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check Out Modal */}
      <Dialog open={showCheckOut} onOpenChange={setShowCheckOut}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LogOut size={17} className="text-[#0F172A]" /> Check Out</DialogTitle>
            <DialogDescription>Submit your daily work summary before checking out.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckOut} className="space-y-4 mt-1">
            <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-xl px-4 py-2.5">
              <MapPin size={14} className="text-[#0D9488]" /><span className="text-sm text-[#64748B]">Location:</span>
              <LocationBadge location={isOnline ? detectedLocation : "Offline"} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Task Completed Today? <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setTaskCompleted(true)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 transition-all ${taskCompleted === true ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-emerald-300"}`}>
                  <Check size={15} /> Yes, Completed
                </button>
                <button type="button" onClick={() => setTaskCompleted(false)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 transition-all ${taskCompleted === false ? "bg-red-50 border-red-400 text-red-600" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-red-300"}`}>
                  <X size={15} /> Not Fully Done
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Summary <span className="text-red-500">*</span></label>
              <textarea required rows={3} placeholder="What did you accomplish today?"
                value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task Proof (Optional)</label>
              <input type="file" accept="image/*,application/pdf" multiple capture="environment"
                className="w-full text-sm border border-[#E2E8F0] rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F8FAFC] file:text-gray-700 hover:file:bg-gray-100"
                onChange={(e) => setProofFiles(Array.from(e.target.files || []))} />
              {proofFiles.length > 0 && <p className="text-xs text-emerald-600 mt-1">{proofFiles.length} file(s) selected</p>}
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {taskCompleted === null && taskDesc.trim() && <p className="text-xs text-amber-500 text-center">Please select task completion status</p>}
            <button type="submit" disabled={actionLoading || !taskDesc.trim() || taskCompleted === null}
              className="w-full py-3 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : <><LogOut size={14} /> Confirm Check Out</>}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Location Setup Modal */}
      {showLocationSetup && (
        <LocationSetupModal userId={userId} locations={locations}
          onClose={() => setShowLocationSetup(false)}
          onSaved={async () => { await loadLocations(); refreshLocation(); }} />
      )}
    </div>
  );
}

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center">
      <div className="text-5xl font-mono font-bold text-[#0F172A] tracking-wider tabular-nums">{time}</div>
      <div className="text-sm text-[#64748B] mt-2">{date}</div>
    </div>
  );
}

export default function AttendancePanel({ userId }: { userId: string }) {
  const supabase = createClient();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");

  // Check In / Out Modal State
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  
  const [taskDesc, setTaskDesc] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [todayRes, historyRes] = await Promise.all([
      getTodayAttendance(userId),
      getMyAttendance(userId, { month }),
    ]);
    setTodayRecord(todayRes.data as AttendanceRecord | null);
    setHistory((historyRes.data as AttendanceRecord[]) || []);
    setLoading(false);
  }, [userId, month]);

  useEffect(() => { load(); }, [load]);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${todayRecord?.date || new Date().toISOString().split("T")[0]}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attendance_proofs')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from("attendance_proofs").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const submitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    
    setActionLoading(true);
    setError("");
    try {
      let photoUrl = "";
      if (proofFile) {
        photoUrl = await uploadFile(proofFile);
      }
      
      const { error: err } = await checkIn(userId, taskDesc, photoUrl);
      if (err) throw err;
      
      setShowCheckIn(false);
      setTaskDesc("");
      setProofFile(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const submitCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    
    setActionLoading(true);
    setError("");
    try {
      let photoUrl = "";
      if (proofFile) {
        photoUrl = await uploadFile(proofFile);
      }
      
      const { error: err } = await checkOut(userId, taskDesc, photoUrl);
      if (err) throw err;
      
      setShowCheckOut(false);
      setTaskDesc("");
      setProofFile(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const sessions = todayRecord?.sessions || [];
  const hasOpenSession = sessions.length > 0 && !sessions[sessions.length - 1].check_out;
  
  const canCheckIn = !todayRecord || !hasOpenSession;
  const canCheckOut = hasOpenSession;

  // Monthly summary
  const summary = {
    present: history.filter(r => r.status === "present").length,
    late: history.filter(r => r.status === "late").length,
    absent: history.filter(r => r.status === "absent").length,
    half_day: history.filter(r => r.status === "half_day").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Check-in / Check-out Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
        <LiveClock />

        {/* Today Status */}
        <div className="flex justify-center mt-6 mb-8">
          {todayRecord ? (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.color || "bg-gray-100 text-gray-600"}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.dot || "bg-gray-400"} animate-pulse`} />
              {STATUS_CONFIG[todayRecord.status as AttendanceStatus]?.label || todayRecord.status} — Today
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Not Checked In Yet
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => { setTaskDesc(""); setProofFile(null); setShowCheckIn(true); }}
            disabled={!canCheckIn}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${
              canCheckIn
                ? "bg-[#0D9488] text-white hover:bg-[#0f766e] shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogIn size={18} />
            Check In
          </button>
          <button
            onClick={() => { setTaskDesc(""); setProofFile(null); setShowCheckOut(true); }}
            disabled={!canCheckOut}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${
              canCheckOut
                ? "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg shadow-slate-200 hover:shadow-slate-300 hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogOut size={18} />
            Check Out
          </button>
        </div>

        {/* Today's timestamps */}
        {todayRecord && !!todayRecord.check_in && (
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#F8FAFC]">
            {[
              { label: "First In", value: formatTime(todayRecord.check_in), icon: LogIn, color: "text-emerald-600" },
              { label: "Last Out", value: formatTime(todayRecord.check_out), icon: LogOut, color: "text-[#0F172A]" },
              { label: "Active Hrs", value: todayRecord.sessions?.length ? calcTotalDuration(todayRecord.sessions) : calcDuration(todayRecord.check_in, todayRecord.check_out), icon: Clock, color: "text-[#0D9488]" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={18} className={`mx-auto mb-1 ${color}`} />
                <div className="font-mono font-bold text-[#0F172A]">{value}</div>
                <div className="text-xs text-[#94A3B8]">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Present", value: summary.present, color: "bg-emerald-100 text-emerald-700" },
          { label: "Late", value: summary.late, color: "bg-orange-100 text-orange-700" },
          { label: "Absent", value: summary.absent, color: "bg-red-100 text-red-700" },
          { label: "Half Day", value: summary.half_day, color: "bg-yellow-100 text-yellow-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${color.split(" ")[1]}`}>{value}</div>
            <div className="text-xs text-[#64748B] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-[#0F172A]">Attendance History</h3>
          <input
            type="month"
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 bg-white"
            value={month} onChange={e => setMonth(e.target.value)}
          />
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={28} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No attendance records for this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-0 border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Date", "Check In", "Check Out", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(record => {
                  const cfg = STATUS_CONFIG[record.status as AttendanceStatus] || STATUS_CONFIG.present;
                  return (
                    <tr key={record.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                       <td className="px-5 py-3 text-[#64748B] whitespace-nowrap">
                         <div className="font-mono text-xs">{record.date}</div>
                         {(record.check_in_photo_url || record.check_out_photo_url) && (
                            <div className="flex gap-1 mt-1 text-[#0D9488]">
                               <Camera size={14} />
                               <span className="text-[10px]">Photo Proof</span>
                            </div>
                         )}
                       </td>
                      <td className="px-5 py-3 font-mono text-[#0F172A] whitespace-nowrap">
                        {formatTime(record.check_in)}
                        {record.task_description && <div className="text-xs text-[#64748B] font-sans truncate max-w-[150px]" title={record.task_description}>{record.task_description}</div>}
                      </td>
                      <td className="px-5 py-3 font-mono text-[#0F172A] whitespace-nowrap">
                        {formatTime(record.check_out)}
                        {record.completed_tasks && <div className="text-xs text-[#64748B] font-sans truncate max-w-[150px]" title={record.completed_tasks}>{record.completed_tasks}</div>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <div className="text-xs text-[#64748B] mt-1 font-mono">
                           {record.sessions?.length ? calcTotalDuration(record.sessions) : calcDuration(record.check_in, record.check_out)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check In Modal */}
      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>Submit your check in details for today.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Today's Planned Tasks <span className="text-red-500">*</span></label>
              <textarea 
                required
                className="w-full text-sm px-3 py-2 border rounded-xl"
                rows={3} 
                placeholder="What tasks are you planning to work on?" 
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo Proof (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="w-full text-sm border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-gray-400 mt-1">Take a photo using mobile or upload an image.</p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button 
              type="submit" 
              disabled={actionLoading || !taskDesc.trim()} 
              className="w-full py-2 bg-[#0D9488] text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {actionLoading ? "Submitting..." : "Confirm Check In"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check Out Modal */}
      <Dialog open={showCheckOut} onOpenChange={setShowCheckOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>Submit your completed tasks before checking out.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCheckOut} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Completed Tasks <span className="text-red-500">*</span></label>
              <textarea 
                required
                className="w-full text-sm px-3 py-2 border rounded-xl"
                rows={3} 
                placeholder="What did you complete today?" 
                value={taskDesc} 
                onChange={(e) => setTaskDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo Proof (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="w-full text-sm border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button 
              type="submit" 
              disabled={actionLoading || !taskDesc.trim()} 
              className="w-full py-2 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {actionLoading ? "Submitting..." : "Confirm Check Out"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
