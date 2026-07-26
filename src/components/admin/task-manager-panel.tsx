"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckSquare, Plus, X, Loader2, AlertCircle,
  Clock, Filter, Search, RefreshCw, MessageSquare, Check
} from "lucide-react";
import {
  getStaffTasks, createStaffTask, updateTaskStatus, deleteStaffTask,
  getStaffList, getTaskChecklist, addTaskChecklistItem, toggleTaskChecklistItem,
  getTaskComments, addTaskComment, logTaskTime, updateTaskProgress,
  type StaffTask, type StaffMember
} from "@/app/communication-actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent": return "bg-rose-50 text-rose-600 border-rose-200";
    case "high":   return "bg-orange-50 text-orange-600 border-orange-200";
    case "medium": return "bg-blue-50 text-blue-600 border-blue-200";
    default:       return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

type Priority = "urgent" | "high" | "medium" | "low";
type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

function isOverdue(task: StaffTask) {
  if (!task.due_date || task.status === "done" || task.status === "cancelled") return false;
  return new Date(task.due_date) < new Date();
}

function getDaysLeft(dueDate?: string) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function TaskManagerPanel({ user, userRole }: { user: SupabaseUser; userRole: string }) {
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const [tasks, setTasks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed view states
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [progressVal, setProgressVal] = useState(0);

  // Time logging stopwatch
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerNote, setTimerNote] = useState("");
  const timerRef = useRef<any>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: taskData }, { data: staffData }] = await Promise.all([
        getStaffTasks(),
        isAdmin ? getStaffList() : Promise.resolve({ data: [] as StaffMember[], error: null }),
      ]);
      setTasks(taskData || []);
      if (isAdmin) setStaffList(staffData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Stopwatch effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    await updateTaskStatus(taskId, status);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteStaffTask(taskId);
  };

  const handleTaskClick = async (task: any) => {
    setSelectedTask(task);
    setProgressVal(task.progress || 0);
    setShowDetailModal(true);

    // Fetch checklist and comments
    try {
      const [checkRes, commRes] = await Promise.all([
        getTaskChecklist(task.id),
        getTaskComments(task.id)
      ]);
      setChecklist(checkRes.data || []);
      setComments(commRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim() || !selectedTask) return;
    try {
      const { data } = await addTaskChecklistItem(selectedTask.id, newSubtask.trim());
      if (data) {
        setChecklist(prev => [...prev, data]);
        setNewSubtask("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleTaskChecklistItem(itemId, isCompleted);
      setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, is_completed: isCompleted } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    try {
      const { data } = await addTaskComment(selectedTask.id, newComment.trim());
      if (data) {
        setComments(prev => [...prev, data]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgressSave = async () => {
    if (!selectedTask) return;
    try {
      await updateTaskProgress(selectedTask.id, progressVal);
      // Update locally
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, progress: progressVal } : t));
      alert("Progress updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogTime = async () => {
    if (!selectedTask || elapsedSeconds < 60) {
      alert("Minimum elapsed time to log is 1 minute.");
      return;
    }
    try {
      const durationMin = Math.round(elapsedSeconds / 60);
      const { error } = await logTaskTime(selectedTask.id, durationMin, timerNote || "Task development log");
      if (error) throw error;
      alert(`Logged ${durationMin} minutes to task time logs!`);
      setElapsedSeconds(0);
      setIsTimerRunning(false);
      setTimerNote("");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(isOverdue).length,
  };

  return (
    <div className="space-y-5 text-xs text-[#0F172A] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#0F172A] text-base flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <CheckSquare size={18} className="text-[#0D9488]" />
            {isAdmin ? "Workspace Tasks & Sprints" : "My Work Dashboard"}
          </h2>
          <p className="text-[10px] text-slate-500">
            {isAdmin ? "Oversee team delivery, assign checklists, and audit logged developer hours." : "Update your progress, check off subtasks, and log task hours."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadTasks} className="p-2 text-slate-400 hover:text-[#0D9488] rounded-lg">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg shadow-sm"
            >
              <Plus size={14} /> Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Tasks", value: stats.total, color: "text-[#0F172A]" },
          { label: "Backlog / To Do", value: stats.todo, color: "text-slate-500" },
          { label: "Active In-Progress", value: stats.in_progress, color: "text-orange-500" },
          { label: "Completed", value: stats.done, color: "text-emerald-600" },
          { label: "Overdue Goals", value: stats.overdue, color: "text-rose-500" }
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
            <div className="text-[10px] text-slate-500 font-bold">{card.label}</div>
            <div className={`text-2xl font-bold font-mono mt-1.5 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters Area */}
      <div className="flex flex-wrap gap-2 items-center bg-white border rounded-xl p-3 shadow-sm">
        <Filter size={14} className="text-slate-400" />
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="text-slate-400" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-xs outline-none w-full"
          />
        </div>

        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
          className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Task Grid cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading task sprint backlog...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed py-16 text-center">
          <CheckSquare size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No tasks registered matching search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(task => {
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between ${overdue ? 'border-rose-200' : 'border-slate-200'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {overdue && <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100">Overdue</span>}
                  </div>
                  
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-1">{task.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3.5">{task.description || "No context set."}</p>

                  <div className="space-y-1.5 text-[10px] text-slate-500 font-semibold border-t pt-3 mb-3">
                    <div className="flex justify-between">
                      <span>Assigned to:</span>
                      <span className="text-slate-700">{task.assignee?.full_name || "Unassigned"}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="font-mono text-slate-700">{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 text-[10px]">
                  <span className={`capitalize font-bold px-2 py-0.5 rounded-full ${task.status === 'done' ? 'bg-emerald-50 text-emerald-700' : task.status === 'in_progress' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100'}`}>
                    {task.status}
                  </span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${task.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task detailed slide-over/dialog overlay */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 border-b shrink-0 bg-slate-50">
              <h3 className="font-bold text-sm">
                Sprint Task details: {selectedTask.title}
              </h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedTask(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Progress and status */}
              <div className="bg-slate-50 p-4 rounded-xl border grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-slate-400 font-semibold mb-1">State / Status</span>
                  <select
                    value={selectedTask.status}
                    onChange={e => handleStatusChange(selectedTask.id, e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border rounded"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold mb-1">Progress Tracker</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={0} max={100}
                      value={progressVal}
                      onChange={e => setProgressVal(Number(e.target.value))}
                      className="w-full accent-[#0D9488]"
                    />
                    <span className="font-bold text-slate-700">{progressVal}%</span>
                    <button onClick={handleProgressSave} className="p-1.5 bg-[#0D9488] text-white rounded">
                      <Check size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Time logs counter stopwatch */}
              <div className="bg-white p-4 border rounded-xl space-y-3 shadow-sm">
                <h4 className="font-bold text-slate-700 flex items-center gap-1.5"><Clock size={13} /> Log Task Work Session Hours</h4>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold bg-slate-100 px-3.5 py-1.5 rounded-lg border text-slate-800">
                      {formatTimer(elapsedSeconds)}
                    </span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1.5 font-bold rounded-lg ${isTimerRunning ? 'bg-rose-600 text-white' : 'bg-[#0D9488] text-white'}`}
                    >
                      {isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
                    </button>
                  </div>
                  
                  {elapsedSeconds >= 60 && (
                    <div className="flex gap-2 items-center flex-1 max-w-sm">
                      <input
                        type="text" placeholder="Short description of task worked..."
                        value={timerNote} onChange={e => setTimerNote(e.target.value)}
                        className="flex-1 px-3 py-1.5 border rounded-lg outline-none"
                      />
                      <button onClick={handleLogTime} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow">
                        Log Minutes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks checklist */}
              <div className="bg-white p-4 border rounded-xl space-y-3.5">
                <h4 className="font-bold text-slate-700 flex items-center gap-1"><CheckSquare size={13} /> Subtasks Checklist</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {checklist.length === 0 ? (
                    <p className="text-slate-400 italic">No subtask list added.</p>
                  ) : (
                    checklist.map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-50/50 rounded">
                        <input
                          type="checkbox"
                          checked={item.is_completed}
                          onChange={e => handleToggleSubtask(item.id, e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        <span className={item.is_completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                          {item.title}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddSubtask} className="flex gap-2 items-center pt-2 border-t">
                  <input
                    type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Add checklist action item..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none bg-transparent"
                  />
                  <button type="submit" className="px-3 py-2 bg-[#0D9488] text-white font-bold rounded-lg">
                    Add Subtask
                  </button>
                </form>
              </div>

              {/* Comments Discussion */}
              <div className="bg-white p-4 border rounded-xl space-y-3">
                <h4 className="font-bold text-slate-700 flex items-center gap-1.5"><MessageSquare size={13} /> Discussions & logs</h4>
                <div className="border rounded-lg max-h-36 overflow-y-auto p-2 bg-slate-50 space-y-2">
                  {comments.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4">No comments posted yet.</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-2 bg-white rounded border">
                        <div className="flex justify-between font-semibold text-[10px] text-slate-400 mb-1">
                          <span>{c.user?.full_name}</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 font-sans leading-snug">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddCommentSubmit} className="flex gap-2 items-center pt-2 border-t">
                  <input
                    type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Type team discussion message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-lg">
                    Post Comment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
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

// Re-using modal component
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-xs">
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-slate-50">
          <h3 className="font-bold text-[#0F172A] text-sm">Assign New Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Task Title *</label>
            <input
              type="text" required placeholder="e.g. Code auth route handler"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Context Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Outline steps, requirements..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none min-h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Assign To *</label>
              <select
                required
                value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              >
                <option value="">-- Choose Employee --</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border rounded-lg text-rose-600 flex items-center gap-1">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-[#0D9488] text-white font-semibold rounded-lg hover:bg-[#0F766E]">
              {submitting ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
