"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, Plus, Edit3, Trash2, RefreshCw, X, CheckCircle,
  Clock, AlertCircle, Users, Search, Filter, Eye
} from "lucide-react";
import {
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement
} from "@/app/attendance-actions";
import { getAllProfiles } from "@/app/certificate-actions";
import type { StaffAnnouncement } from "@/types/erp";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

const TYPE_OPTIONS = ["announcement", "task", "meeting", "urgent"] as const;
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"] as const;

const TYPE_CONFIG = {
  announcement: { label: "Announcement", icon: Bell, color: "bg-blue-100 text-blue-700" },
  task: { label: "Task", icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
  meeting: { label: "Meeting", icon: Clock, color: "bg-purple-100 text-purple-700" },
  urgent: { label: "Urgent", icon: AlertCircle, color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

// ─── Form Modal ──────────────────────────────────────────────────
function AnnouncementForm({
  item,
  staffList,
  onClose,
  onSaved,
}: {
  item?: Partial<StaffAnnouncement>;
  staffList: { id: string; full_name: string; role: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [body, setBody] = useState(item?.body || "");
  const [type, setType] = useState(item?.type || "announcement");
  const [priority, setPriority] = useState(item?.priority || "normal");
  const [targetAll, setTargetAll] = useState(!item?.target_user_ids?.length);
  const [targetUsers, setTargetUsers] = useState<string[]>(item?.target_user_ids || []);
  const [scheduledDate, setScheduledDate] = useState(item?.scheduled_date || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleUser = (id: string) => {
    setTargetUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { setError("Title and body are required."); return; }
    setSaving(true);
    setError("");
    const payload = {
      title, body, type, priority,
      target_user_ids: targetAll ? [] : targetUsers,
      scheduled_date: scheduledDate || undefined,
    };
    let err;
    if (item?.id) {
      ({ error: err } = await updateAnnouncement(item.id, payload));
    } else {
      ({ error: err } = await createAnnouncement(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  const staff = staffList.filter(s => s.role === "staff");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item?.id ? "Edit Announcement" : "Create Announcement / Task"}</DialogTitle>
          <DialogDescription>Send updates, task assignments, or meeting alerts to your staff.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Title <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Enter announcement title..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map(t => {
                  const cfg = TYPE_CONFIG[t];
                  const Icon = cfg.icon;
                  return (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all ${type === t ? `${cfg.color} border-transparent font-semibold` : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488]"}`}>
                      <Icon size={13} />{cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITY_OPTIONS.map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={`px-3 py-2 text-xs rounded-xl border capitalize transition-all ${priority === p ? `${PRIORITY_CONFIG[p].color} border-transparent font-semibold` : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488]"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Message Body <span className="text-red-500">*</span></label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 resize-none"
              placeholder="Write the full announcement or task description..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Scheduled Date (Optional)</label>
            <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-2">Target Audience</label>
            <div className="flex gap-3 mb-3">
              <button type="button" onClick={() => setTargetAll(true)}
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all ${targetAll ? "bg-[#0D9488] text-white border-transparent font-semibold" : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488]"}`}>
                <Users size={13} /> All Staff
              </button>
              <button type="button" onClick={() => setTargetAll(false)}
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all ${!targetAll ? "bg-[#0D9488] text-white border-transparent font-semibold" : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D9488]"}`}>
                <Filter size={13} /> Specific Staff
              </button>
            </div>
            {!targetAll && (
              <div className="border border-[#E2E8F0] rounded-xl p-3 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {staff.map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer">
                    <input type="checkbox" checked={targetUsers.includes(s.id)} onChange={() => toggleUser(s.id)}
                      className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]/30" />
                    <span className="text-xs text-[#0F172A] truncate">{s.full_name}</span>
                  </label>
                ))}
                {staff.length === 0 && <p className="text-xs text-[#94A3B8] col-span-2 text-center py-2">No staff members found</p>}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving || !title.trim() || !body.trim()}
              className="flex-1 py-2.5 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 font-semibold flex items-center justify-center gap-2">
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : item?.id ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────
export default function AnnouncementsManagerPanel() {
  const [items, setItems] = useState<StaffAnnouncement[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<StaffAnnouncement | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<StaffAnnouncement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [annRes, profilesRes] = await Promise.all([
      getAnnouncements(),
      getAllProfiles(),
    ]);
    setItems((annRes.data as StaffAnnouncement[]) || []);
    setStaffList(((profilesRes.data as any[]) || []).filter(p => ["staff", "admin", "sub_admin"].includes(p.role)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(id);
    await deleteAnnouncement(id);
    setDeleting(null);
    load();
  };

  const handleToggleActive = async (item: StaffAnnouncement) => {
    await updateAnnouncement(item.id, { is_active: !item.is_active });
    load();
  };

  const filtered = items.filter(item => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.body.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Announcements & Tasks</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Send updates, task assignments, and meeting alerts to staff</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] text-white text-sm rounded-xl hover:bg-[#0f766e] font-semibold shadow-sm">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TYPE_OPTIONS.map(t => {
          const cfg = TYPE_CONFIG[t];
          const Icon = cfg.icon;
          const count = items.filter(i => i.type === t).length;
          return (
            <div key={t} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] font-mono">{count}</div>
                <div className="text-xs text-[#64748B]">{cfg.label}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30">
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
          </select>
          <button onClick={load} className="p-2.5 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B]">
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={32} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No announcements yet. Create one to notify your staff.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const cfg = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.announcement;
              const Icon = cfg.icon;
              const priCfg = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.normal;
              return (
                <div key={item.id} className={`border border-[#E2E8F0] rounded-xl p-4 transition-all hover:border-[#0D9488]/30 ${!item.is_active ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#0F172A] text-sm">{item.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priCfg.color}`}>{priCfg.label}</span>
                        {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{item.body}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#94A3B8]">
                        <span>Created: {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {item.scheduled_date && <span>📅 Scheduled: {item.scheduled_date}</span>}
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {!item.target_user_ids?.length ? "All Staff" : `${item.target_user_ids.length} staff member(s)`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setViewItem(item)} title="Preview"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-blue-500 hover:bg-blue-50"><Eye size={14} /></button>
                      <button onClick={() => handleToggleActive(item)} title={item.is_active ? "Deactivate" : "Activate"}
                        className={`p-1.5 rounded-lg transition ${item.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-50"}`}>
                        <CheckCircle size={14} />
                      </button>
                      <button onClick={() => { setEditItem(item); setShowForm(true); }} title="Edit"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0D9488] hover:bg-[#F0FDFA]"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} title="Delete"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50">
                        {deleting === item.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AnnouncementForm
          item={editItem || undefined}
          staffList={staffList}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={load}
        />
      )}

      {/* View Modal */}
      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => { const Icon = TYPE_CONFIG[viewItem.type as keyof typeof TYPE_CONFIG]?.icon || Bell; return <Icon size={17} />; })()}
                {viewItem.title}
              </DialogTitle>
              <DialogDescription>
                {new Date(viewItem.created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_CONFIG[viewItem.type as keyof typeof TYPE_CONFIG]?.color || ""}`}>
                  {TYPE_CONFIG[viewItem.type as keyof typeof TYPE_CONFIG]?.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_CONFIG[viewItem.priority as keyof typeof PRIORITY_CONFIG]?.color || ""}`}>
                  {viewItem.priority}
                </span>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-sm text-[#475569] whitespace-pre-wrap border border-[#E2E8F0]">
                {viewItem.body}
              </div>
              {viewItem.scheduled_date && (
                <p className="text-sm text-[#64748B] flex items-center gap-2">
                  <Clock size={14} /> Scheduled for: <strong>{viewItem.scheduled_date}</strong>
                </p>
              )}
              <p className="text-sm text-[#64748B] flex items-center gap-2">
                <Users size={14} />
                Target: {!viewItem.target_user_ids?.length ? "All Staff" : `${viewItem.target_user_ids.length} specific staff`}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
