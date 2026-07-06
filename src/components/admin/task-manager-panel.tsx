"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare, Plus, X, Loader2, AlertCircle, ChevronDown,
  Calendar, Flag, User, Clock, Trash2, RotateCcw, CheckCircle2,
  PlayCircle, Filter, Search, RefreshCw
} from "lucide-react";
import {
  getStaffTasks, createStaffTask, updateTaskStatus, deleteStaffTask,
  getStaffList, type StaffTask, type StaffMember
} from "@/app/communication-actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY = {
  urgent: { label: "Urgent", color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
  high:   { label: "High",   color: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  medium: { label: "Medium", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  low:    { label: "Low",    color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
} as const;

const STATUS = {
  todo:        { label: "To Do",       icon: Clock,         color: "#64748B", bg: "#F8FAFC",   border: "#E2E8F0" },
  in_progress: { label: "In Progress", icon: PlayCircle,    color: "#F97316", bg: "#FFF7ED",   border: "#FED7AA" },
  done:        { label: "Done",        icon: CheckCircle2,  color: "#10B981", bg: "#F0FDF4",   border: "#BBF7D0" },
  cancelled:   { label: "Cancelled",   icon: X,             color: "#94A3B8", bg: "#F1F5F9",   border: "#CBD5E1" },
} as const;

type Priority = keyof typeof PRIORITY;
type TaskStatus = keyof typeof STATUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(task: StaffTask) {
  if (!task.due_date || task.status === "done" || task.status === "cancelled") return false;
  return new Date(task.due_date) < new Date();
}

function getDaysLeft(dueDate?: string) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
    >
      <Flag size={9} />
      {p.label}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

interface CreateTaskModalProps {
  staffList: StaffMember[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateTaskModal({ staffList, onClose, onCreated }: CreateTaskModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium" as Priority,
    due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assigned_to) {
      setError("Title and assignee are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await createStaffTask({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      assigned_to: form.assigned_to,
      priority: form.priority,
      due_date: form.due_date || undefined,
    });
    if (err) {
      setError(err);
      setSubmitting(false);
    } else {
      onCreated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-[#0D9488]" />
            </div>
            <h3 className="font-bold text-[#0F172A] text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Assign New Task
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 uppercase tracking-wide">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Update homepage hero section"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add context, instructions, or requirements..."
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assign To */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 uppercase tracking-wide">
                Assign To <span className="text-red-400">*</span>
              </label>
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all bg-white"
              >
                <option value="">Select staff member...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 uppercase tracking-wide">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all bg-white"
              >
                {(Object.entries(PRIORITY) as [Priority, typeof PRIORITY[Priority]][]).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 uppercase tracking-wide">Due Date (Optional)</label>
            <input
              type="date"
              value={form.due_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
              <span className="text-xs text-rose-600">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] font-semibold text-sm rounded-xl transition-colors border border-[#E2E8F0]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-[#0D9488]/20"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Assigning...</>
              ) : (
                <><Plus size={14} /> Assign Task</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card (Staff view) ───────────────────────────────────────────────────

function TaskCard({ task, onStatusChange, isAdmin, onDelete }: {
  task: StaffTask;
  onStatusChange: (id: string, s: TaskStatus) => void;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
}) {
  const overdue = isOverdue(task);
  const daysLeft = getDaysLeft(task.due_date);

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: "in_progress",
    in_progress: "done",
    done: "todo",
    cancelled: "todo",
  };

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${overdue ? "border-rose-200" : "border-[#E2E8F0]"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <PriorityBadge priority={task.priority as Priority} />
            {overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100">
                <AlertCircle size={9} /> Overdue
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#0F172A] text-sm leading-snug line-clamp-2">{task.title}</h3>
        </div>
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 p-1 text-[#CBD5E1] hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-[#64748B] mb-3 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] mb-3 flex-wrap">
        {task.due_date && (
          <span className={`flex items-center gap-1 ${overdue ? "text-rose-400 font-semibold" : daysLeft !== null && daysLeft <= 2 ? "text-orange-400 font-semibold" : ""}`}>
            <Calendar size={10} />
            {overdue ? `${Math.abs(daysLeft || 0)}d overdue` : daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft}d left`}
          </span>
        )}
        {isAdmin && task.assignee && (
          <span className="flex items-center gap-1">
            <User size={10} />
            {task.assignee.full_name}
          </span>
        )}
        {task.assigner && (
          <span className="flex items-center gap-1">
            by {task.assigner.full_name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#F8FAFC]">
        <StatusBadge status={task.status as TaskStatus} />
        {task.status !== "cancelled" && (
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status as TaskStatus])}
            className="text-[11px] font-semibold text-[#0D9488] hover:text-[#0F766E] hover:bg-[#0D9488]/5 px-2.5 py-1 rounded-lg transition-colors"
          >
            {task.status === "todo" ? "Start →" : task.status === "in_progress" ? "Mark Done ✓" : "Reopen ↺"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface TaskManagerPanelProps {
  user: SupabaseUser;
  userRole: string;
}

export default function TaskManagerPanel({ user, userRole }: TaskManagerPanelProps) {
  const isAdmin = userRole === "admin";
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const [{ data: taskData }, { data: staffData }] = await Promise.all([
      getStaffTasks(),
      isAdmin ? getStaffList() : Promise.resolve({ data: [] as StaffMember[], error: null }),
    ]);
    setTasks(taskData);
    if (isAdmin) setStaffList(staffData || []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    await updateTaskStatus(taskId, status);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteStaffTask(taskId);
  };

  // Filter + search
  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.assignee?.full_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(isOverdue).length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#0F172A] text-xl flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <CheckSquare size={22} className="text-[#0D9488]" />
            {isAdmin ? "Task Management" : "My Tasks"}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {isAdmin ? "Assign and track tasks across your team" : "Track your assigned work items"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTasks}
            className="p-2 text-[#94A3B8] hover:text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-[#0D9488]/20"
            >
              <Plus size={15} />
              Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "#0F172A", bg: "#F8FAFC" },
          { label: "To Do", value: stats.todo, color: "#64748B", bg: "#F8FAFC" },
          { label: "In Progress", value: stats.in_progress, color: "#F97316", bg: "#FFF7ED" },
          { label: "Done", value: stats.done, color: "#10B981", bg: "#F0FDF4" },
          { label: "Overdue", value: stats.overdue, color: "#EF4444", bg: "#FEF2F2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#E2E8F0] p-3.5 text-center" style={{ background: bg }}>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[#64748B] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-[#E2E8F0] rounded-xl p-3">
        <Filter size={14} className="text-[#94A3B8]" />
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none w-full"
          />
        </div>
        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
          className="px-3 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          {(Object.entries(STATUS) as [TaskStatus, typeof STATUS[TaskStatus]][]).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
          className="px-3 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg outline-none cursor-pointer"
        >
          <option value="all">All Priority</option>
          {(Object.entries(PRIORITY) as [Priority, typeof PRIORITY[Priority]][]).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        {(filterStatus !== "all" || filterPriority !== "all" || searchQuery) && (
          <button
            onClick={() => { setFilterStatus("all"); setFilterPriority("all"); setSearchQuery(""); }}
            className="text-xs font-medium text-rose-400 hover:text-rose-600 px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-[#0D9488] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] py-16 text-center">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckSquare size={24} className="text-[#CBD5E1]" />
          </div>
          <p className="text-[#64748B] text-sm font-medium">
            {tasks.length === 0
              ? isAdmin
                ? "No tasks assigned yet. Click \"Assign Task\" to get started."
                : "No tasks assigned to you yet."
              : "No tasks match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && isAdmin && (
        <CreateTaskModal
          staffList={staffList}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}
