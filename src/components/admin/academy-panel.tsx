"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  BookOpen, Users, Calendar, Award, CheckCircle, Clock, Search, Plus,
  Edit, Trash2, Check, X, Filter, ChevronRight, Eye, Shield, AlertCircle,
  GraduationCap, ToggleLeft, ToggleRight, Star, DollarSign, RefreshCw,
  Briefcase, Monitor, MapPin, Play, Zap, FileText, Save
} from "lucide-react";
import {
  getAdminEnrollments,
  getAdminDemoBookings,
  getAdminCourses,
  getAdminBatches,
  getAdminCategories,
  updateEnrollmentStatus,
  updateEnrollmentPayment,
  updateDemoStatus,
  updateBatchStatus,
  upsertCourse,
  upsertBatch,
  toggleCourseActive,
  deleteCourse,
  deleteBatch,
  issueCertificate
} from "@/app/academy-actions";

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-purple-50 text-purple-700 border-purple-200",
    withdrawn: "bg-red-50 text-red-600 border-red-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    upcoming: "bg-teal-50 text-teal-700 border-teal-200",
    ongoing: "bg-blue-50 text-blue-700 border-blue-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    refunded: "bg-red-50 text-red-600 border-red-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    attended: "bg-emerald-50 text-emerald-700 border-emerald-200",
    no_show: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Course Form Modal ────────────────────────────────────────
function CourseFormModal({ course, categories, onClose, onSaved }: {
  course: any | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!course?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    category_id: course?.category_id || "",
    short_description: course?.short_description || "",
    description: course?.description || "",
    instructor_name: course?.instructor_name || "",
    instructor_bio: course?.instructor_bio || "",
    level: course?.level || "beginner",
    language: course?.language || "Urdu / English",
    duration_weeks: course?.duration_weeks || "",
    total_hours: course?.total_hours || "",
    original_price: course?.original_price || "",
    discounted_price: course?.discounted_price || "",
    installment_available: course?.installment_available || false,
    installment_months: course?.installment_months || "",
    installment_amount: course?.installment_amount || "",
    is_featured: course?.is_featured || false,
    is_active: course?.is_active ?? true,
    has_internship: course?.has_internship || false,
    has_certificate: course?.has_certificate ?? true,
    has_placement: course?.has_placement || false,
    student_count: course?.student_count || 0,
    rating: course?.rating || 0,
    skills_covered: (course?.skills_covered || []).join(", "),
    learning_objectives: (course?.learning_objectives || []).join("\n"),
    career_opportunities: (course?.career_opportunities || []).join("\n"),
    prerequisites: (course?.prerequisites || []).join("\n"),
    salary_range: course?.salary_range || "",
    tags: (course?.tags || []).join(", "),
    seo_title: course?.seo_title || "",
    seo_description: course?.seo_description || "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, "");

  const handleSave = async () => {
    if (!form.title || !form.slug) return setError("Title and slug are required.");
    setSaving(true);
    setError("");
    const payload: any = {
      ...(isEdit ? { id: course.id } : {}),
      title: form.title,
      slug: form.slug,
      category_id: form.category_id || null,
      short_description: form.short_description || null,
      description: form.description || null,
      instructor_name: form.instructor_name || null,
      instructor_bio: form.instructor_bio || null,
      level: form.level,
      language: form.language,
      duration_weeks: form.duration_weeks ? parseInt(form.duration_weeks) : null,
      total_hours: form.total_hours ? parseInt(form.total_hours) : null,
      original_price: form.original_price ? parseFloat(form.original_price) : 0,
      discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : null,
      installment_available: form.installment_available,
      installment_months: form.installment_months ? parseInt(form.installment_months) : null,
      installment_amount: form.installment_amount ? parseFloat(form.installment_amount) : null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      has_internship: form.has_internship,
      has_certificate: form.has_certificate,
      has_placement: form.has_placement,
      student_count: parseInt(form.student_count) || 0,
      rating: parseFloat(form.rating) || 0,
      skills_covered: form.skills_covered ? form.skills_covered.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      learning_objectives: form.learning_objectives ? form.learning_objectives.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      career_opportunities: form.career_opportunities ? form.career_opportunities.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      prerequisites: form.prerequisites ? form.prerequisites.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      salary_range: form.salary_range || null,
      tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };
    const res = await upsertCourse(payload);
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.error || "Failed to save course.");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {isEdit ? "Edit Course" : "Create New Course"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><BookOpen size={14} className="text-[#0D9488]" /> Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Course Title *</label>
                <input value={form.title} onChange={e => { set("title", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="e.g. Full Stack Web Development" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">URL Slug *</label>
                <input value={form.slug} onChange={e => set("slug", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-mono" placeholder="full-stack-web-development" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Category</label>
                <select value={form.category_id} onChange={e => set("category_id", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] appearance-none">
                  <option value="">Uncategorized</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Level</label>
                <select value={form.level} onChange={e => set("level", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] appearance-none">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Short Description</label>
              <input value={form.short_description} onChange={e => set("short_description", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="One-liner for listings..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Full Description</label>
              <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Detailed course description..." />
            </div>
          </div>

          {/* Instructor */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><GraduationCap size={14} className="text-[#7C3AED]" /> Instructor / Trainer</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Instructor Name</label>
                <input value={form.instructor_name} onChange={e => set("instructor_name", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="Muhammad Aryan" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Language</label>
                <input value={form.language} onChange={e => set("language", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="Urdu / English" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Instructor Bio</label>
              <textarea rows={2} value={form.instructor_bio} onChange={e => set("instructor_bio", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Short professional bio..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><DollarSign size={14} className="text-[#F97316]" /> Pricing & Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Original Price (PKR)</label>
                <input type="number" value={form.original_price} onChange={e => set("original_price", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="35000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Discounted Price</label>
                <input type="number" value={form.discounted_price} onChange={e => set("discounted_price", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="25000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Duration (weeks)</label>
                <input type="number" value={form.duration_weeks} onChange={e => set("duration_weeks", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="24" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Total Hours</label>
                <input type="number" value={form.total_hours} onChange={e => set("total_hours", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="120" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.installment_available} onChange={e => set("installment_available", e.target.checked)} className="rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]" />
                <span className="text-[#475569] font-medium">Installments Available</span>
              </label>
              {form.installment_available && (
                <>
                  <input type="number" value={form.installment_months} onChange={e => set("installment_months", e.target.value)}
                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs" placeholder="Months" />
                  <input type="number" value={form.installment_amount} onChange={e => set("installment_amount", e.target.value)}
                    className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-xs" placeholder="Monthly PKR" />
                </>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Expected Salary Range</label>
              <input value={form.salary_range} onChange={e => set("salary_range", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="PKR 60,000 – 150,000/month" />
            </div>
          </div>

          {/* Skills & Content */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><Zap size={14} className="text-[#0891B2]" /> Content & Skills</h3>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Skills Covered <span className="text-slate-400">(comma-separated)</span></label>
              <input value={form.skills_covered} onChange={e => set("skills_covered", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="React.js, Node.js, PostgreSQL, ..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Learning Objectives <span className="text-slate-400">(one per line)</span></label>
              <textarea rows={3} value={form.learning_objectives} onChange={e => set("learning_objectives", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Build full-stack web applications&#10;Master React and Node.js..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Career Opportunities <span className="text-slate-400">(one per line)</span></label>
              <textarea rows={3} value={form.career_opportunities} onChange={e => set("career_opportunities", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Junior Web Developer&#10;Full Stack Developer..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Prerequisites <span className="text-slate-400">(one per line)</span></label>
              <textarea rows={2} value={form.prerequisites} onChange={e => set("prerequisites", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" placeholder="Basic computer skills&#10;No prior coding needed" />
            </div>
          </div>

          {/* Toggles & Badges */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><Shield size={14} className="text-[#EF4444]" /> Badges & Visibility</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "is_active", label: "Active (Public)", color: "text-emerald-600" },
                { key: "is_featured", label: "Featured", color: "text-amber-600" },
                { key: "has_internship", label: "Has Internship", color: "text-blue-600" },
                { key: "has_certificate", label: "Has Certificate", color: "text-purple-600" },
                { key: "has_placement", label: "Has Placement", color: "text-teal-600" },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)} className="rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]" />
                  <span className={`font-medium ${color}`}>{label}</span>
                </label>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Student Count (display)</label>
                <input type="number" value={form.student_count} onChange={e => set("student_count", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set("rating", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2"><FileText size={14} className="text-slate-500" /> SEO & Tags</h3>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Tags <span className="text-slate-400">(comma-separated)</span></label>
              <input value={form.tags} onChange={e => set("tags", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="web development, coding, react" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">SEO Title</label>
                <input value={form.seo_title} onChange={e => set("seo_title", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">SEO Description</label>
                <input value={form.seo_description} onChange={e => set("seo_description", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        </div>

        <div className="p-6 border-t border-[#E2E8F0] flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 font-bold flex items-center gap-2">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : isEdit ? "Update Course" : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Batch Form Modal ─────────────────────────────────────────
function BatchFormModal({ batch, courses, onClose, onSaved }: {
  batch: any | null;
  courses: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!batch?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    course_id: batch?.course_id || "",
    name: batch?.name || "",
    batch_code: batch?.batch_code || "",
    start_date: batch?.start_date || "",
    end_date: batch?.end_date || "",
    class_days: (batch?.class_days || []).join(", "),
    class_time: batch?.class_time || "",
    instructor_name: batch?.instructor_name || "",
    total_seats: batch?.total_seats || 30,
    enrolled_seats: batch?.enrolled_seats || 0,
    mode: batch?.mode || "online",
    campus_location: batch?.campus_location || "",
    meeting_link: batch?.meeting_link || "",
    status: batch?.status || "upcoming",
    notes: batch?.notes || "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.batch_code) return setError("Name and batch code are required.");
    setSaving(true);
    setError("");
    const payload: any = {
      ...(isEdit ? { id: batch.id } : {}),
      course_id: form.course_id || null,
      name: form.name,
      batch_code: form.batch_code,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      class_days: form.class_days ? form.class_days.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      class_time: form.class_time || null,
      instructor_name: form.instructor_name || null,
      total_seats: parseInt(form.total_seats) || 30,
      enrolled_seats: parseInt(form.enrolled_seats) || 0,
      mode: form.mode,
      campus_location: form.campus_location || null,
      meeting_link: form.meeting_link || null,
      status: form.status,
      notes: form.notes || null,
    };
    const res = await upsertBatch(payload);
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.error || "Failed to save batch.");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#0F172A]">{isEdit ? "Edit Batch" : "Create New Batch"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Batch Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="July 2026 Batch" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Batch Code * <span className="text-slate-400">(unique)</span></label>
              <input value={form.batch_code} onChange={e => set("batch_code", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-mono" placeholder="FSWD-JUL-01" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-1.5">Course</label>
            <select value={form.course_id} onChange={e => set("course_id", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] appearance-none">
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">End Date</label>
              <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Class Days <span className="text-slate-400">(comma)</span></label>
              <input value={form.class_days} onChange={e => set("class_days", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="Mon, Wed, Fri" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Class Time</label>
              <input value={form.class_time} onChange={e => set("class_time", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="6:00 PM – 8:00 PM" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Mode</label>
              <select value={form.mode} onChange={e => set("mode", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] appearance-none">
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
                <option value="self_paced">Self-Paced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Total Seats</label>
              <input type="number" value={form.total_seats} onChange={e => set("total_seats", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] appearance-none">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-1.5">Instructor Name</label>
            <input value={form.instructor_name} onChange={e => set("instructor_name", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" placeholder="Muhammad Aryan" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        </div>
        <div className="p-6 border-t border-[#E2E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 text-sm bg-[#0D9488] text-white rounded-xl hover:bg-[#0f766e] disabled:opacity-50 font-bold flex items-center gap-2">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : isEdit ? "Update Batch" : "Create Batch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────
export default function AcademyAdminPanel() {
  const [tab, setTab] = useState<"enrollments" | "demos" | "courses" | "batches" | "instructors">("enrollments");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editBatch, setEditBatch] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [enr, dms, crs, bts, cats] = await Promise.all([
      getAdminEnrollments(),
      getAdminDemoBookings(),
      getAdminCourses(),
      getAdminBatches(),
      getAdminCategories(),
    ]);
    setEnrollments(enr);
    setDemos(dms);
    setCourses(crs);
    setBatches(bts);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnrollmentStatus = (id: string, status: string) => {
    startTransition(async () => { await updateEnrollmentStatus(id, status); loadData(); });
  };
  const handlePaymentStatus = (id: string, status: string) => {
    startTransition(async () => { await updateEnrollmentPayment(id, status); loadData(); });
  };
  const handleDemoStatus = (id: string, status: string) => {
    startTransition(async () => { await updateDemoStatus(id, status); loadData(); });
  };
  const handleToggleCourse = (id: string, active: boolean) => {
    startTransition(async () => { await toggleCourseActive(id, active); loadData(); });
  };
  const handleDeleteCourse = (id: string) => {
    if (!confirm("Delete this course? This will also delete all associated batches, curriculum, and reviews.")) return;
    startTransition(async () => { await deleteCourse(id); loadData(); });
  };
  const handleDeleteBatch = (id: string) => {
    if (!confirm("Delete this batch?")) return;
    startTransition(async () => { await deleteBatch(id); loadData(); });
  };
  const handleBatchStatus = (id: string, status: string) => {
    startTransition(async () => { await updateBatchStatus(id, status); loadData(); });
  };

  // Filtered data
  const filteredCourses = courses.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredBatches = batches.filter(b => !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.batch_code?.toLowerCase().includes(search.toLowerCase()));
  const filteredEnrollments = enrollments.filter(e => !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredDemos = demos.filter(d => !search || d.full_name?.toLowerCase().includes(search.toLowerCase()));

  // Stats
  const activeCourses = courses.filter(c => c.is_active).length;
  const inactiveCourses = courses.filter(c => !c.is_active).length;
  const upcomingBatches = batches.filter(b => b.status === "upcoming").length;
  const ongoingBatches = batches.filter(b => b.status === "ongoing").length;

  // Extract unique instructors from courses
  const instructors = Array.from(new Set(courses.map(c => c.instructor_name).filter(Boolean))).map(name => {
    const instructorCourses = courses.filter(c => c.instructor_name === name);
    const totalStudents = instructorCourses.reduce((acc: number, c: any) => acc + (c.student_count || 0), 0);
    const avgRating = instructorCourses.length > 0 ? instructorCourses.reduce((acc: number, c: any) => acc + (parseFloat(c.rating) || 0), 0) / instructorCourses.length : 0;
    return { name, courses: instructorCourses.length, students: totalStudents, rating: avgRating.toFixed(1), courseList: instructorCourses };
  });

  const tabs = [
    { id: "enrollments", label: "Enrollments", icon: Users, count: enrollments.length },
    { id: "demos", label: "Demo Bookings", icon: Play, count: demos.length },
    { id: "courses", label: "Courses", icon: BookOpen, count: courses.length },
    { id: "batches", label: "Batches", icon: Calendar, count: batches.length },
    { id: "instructors", label: "Instructors", icon: GraduationCap, count: instructors.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Prolx Academy LMS Management
            </h2>
            <p className="text-xs text-[#64748B] mt-1">Full course, batch, enrollment, demo, and instructor management panel.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditCourse(null); setShowCourseForm(true); }} className="px-4 py-2 bg-[#0D9488] text-white font-semibold text-xs rounded-xl hover:opacity-90 flex items-center gap-1.5">
              <Plus size={14} /> Add Course
            </button>
            <button onClick={() => { setEditBatch(null); setShowBatchForm(true); }} className="px-4 py-2 bg-[#7C3AED] text-white font-semibold text-xs rounded-xl hover:opacity-90 flex items-center gap-1.5">
              <Plus size={14} /> Add Batch
            </button>
            <button onClick={loadData} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><RefreshCw size={14} className={loading ? "animate-spin text-[#0D9488]" : "text-slate-500"} /></button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Enrollments", value: enrollments.length, icon: Users, color: "bg-[#0D9488]" },
            { label: "Active Courses", value: activeCourses, icon: BookOpen, color: "bg-emerald-500" },
            { label: "Inactive Courses", value: inactiveCourses, icon: BookOpen, color: "bg-red-500" },
            { label: "Upcoming Batches", value: upcomingBatches, icon: Calendar, color: "bg-blue-500" },
            { label: "Demo Requests", value: demos.length, icon: Play, color: "bg-[#7C3AED]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] font-mono">{value}</div>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wide font-semibold">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-1">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`pb-3 px-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                tab === id ? "border-[#0D9488] text-[#0D9488]" : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}>
              <Icon size={15} /> {label}
              <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0D9488]" />
        </div>
      </div>

      {/* ═══ ENROLLMENTS TAB ═══ */}
      {tab === "enrollments" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-mono border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-4">IDs</th><th className="p-4">Student</th><th className="p-4">Course</th>
                  <th className="p-4">Mode</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredEnrollments.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-[#64748B]">No enrollments found.</td></tr>
                ) : filteredEnrollments.map(enr => (
                  <tr key={enr.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-4">
                      <div className="font-mono font-bold text-[#0D9488]">{enr.student_id}</div>
                      <div className="font-mono text-[10px] text-slate-400">{enr.enrollment_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{enr.full_name}</div>
                      <div className="text-[#64748B]">{enr.email}</div>
                      <div className="text-[10px] text-slate-400">{enr.phone} · {enr.city}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#0F172A]">{enr.course?.title || "—"}</div>
                      <div className="text-[10px] text-[#64748B]">{enr.batch?.name || "No batch"}</div>
                    </td>
                    <td className="p-4 capitalize">{enr.learning_mode}</td>
                    <td className="p-4">
                      <StatusBadge status={enr.payment_status} />
                      <div className="text-[10px] text-slate-400 mt-1">{enr.payment_method}</div>
                      <div className="flex gap-1 mt-1.5">
                        {enr.payment_status !== "paid" && (
                          <button onClick={() => handlePaymentStatus(enr.id, "paid")} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-200">Mark Paid</button>
                        )}
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={enr.status} /></td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {enr.status === "pending" && <button onClick={() => handleEnrollmentStatus(enr.id, "confirmed")} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700">Confirm</button>}
                        {enr.status === "confirmed" && <button onClick={() => handleEnrollmentStatus(enr.id, "active")} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700">Activate</button>}
                        {(enr.status === "active" || enr.status === "confirmed") && <button onClick={() => handleEnrollmentStatus(enr.id, "completed")} className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-bold hover:bg-purple-700">Complete</button>}
                        {enr.status !== "cancelled" && <button onClick={() => handleEnrollmentStatus(enr.id, "cancelled")} className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold hover:bg-red-200">Cancel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ DEMOS TAB ═══ */}
      {tab === "demos" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-mono border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-4">Student</th><th className="p-4">Course Interest</th>
                  <th className="p-4">Date / Time</th><th className="p-4">Mode</th>
                  <th className="p-4">Questions</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredDemos.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-[#64748B]">No demo requests yet.</td></tr>
                ) : filteredDemos.map(d => (
                  <tr key={d.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{d.full_name}</div>
                      <div className="text-[#64748B]">{d.email}</div>
                      <div className="text-[10px] text-slate-400">{d.phone}</div>
                    </td>
                    <td className="p-4 font-semibold text-[#0D9488]">{d.course_interest || "General"}</td>
                    <td className="p-4 font-mono">{d.preferred_date || "Any"} @ {d.preferred_time || "Flexible"}</td>
                    <td className="p-4 capitalize">{d.mode}</td>
                    <td className="p-4 max-w-[150px] truncate text-[#64748B]">{d.questions || "—"}</td>
                    <td className="p-4"><StatusBadge status={d.status} /></td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {d.status === "pending" && <button onClick={() => handleDemoStatus(d.id, "scheduled")} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700">Schedule</button>}
                        {d.status === "scheduled" && <button onClick={() => handleDemoStatus(d.id, "attended")} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700">Attended</button>}
                        {d.status !== "no_show" && d.status !== "attended" && <button onClick={() => handleDemoStatus(d.id, "no_show")} className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold hover:bg-red-200">No Show</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ COURSES TAB ═══ */}
      {tab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-[#64748B] font-semibold">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Active: {activeCourses}</span>
            <span className="flex items-center gap-1"><X size={12} className="text-red-500" /> Inactive: {inactiveCourses}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> Total: {courses.length}</span>
          </div>

          <div className="grid gap-4">
            {filteredCourses.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center text-[#64748B]">No courses found.</div>
            ) : filteredCourses.map(c => (
              <div key={c.id} className={`bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${c.is_active ? "border-[#E2E8F0]" : "border-red-200 bg-red-50/30"}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-bold text-[#0F172A] text-base truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{c.title}</h3>
                      {c.is_featured && <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>}
                      {c.has_internship && <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Internship</span>}
                      {!c.is_active && <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {c.category?.name || "Uncategorized"}</span>
                      <span className="capitalize flex items-center gap-1"><Briefcase size={11} /> {c.level}</span>
                      <span className="flex items-center gap-1"><GraduationCap size={11} /> {c.instructor_name || "—"}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {c.student_count || 0} students</span>
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-500" /> {c.rating || 0}</span>
                      {c.duration_weeks && <span className="flex items-center gap-1"><Clock size={11} /> {c.duration_weeks}w</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {c.discounted_price ? (
                        <>
                          <span className="font-bold text-[#0D9488]">PKR {Number(c.discounted_price).toLocaleString()}</span>
                          <span className="line-through text-slate-400">PKR {Number(c.original_price).toLocaleString()}</span>
                        </>
                      ) : c.original_price ? (
                        <span className="font-bold text-[#0F172A]">PKR {Number(c.original_price).toLocaleString()}</span>
                      ) : <span className="text-slate-400">No price set</span>}
                      {c.installment_available && <span className="text-[10px] text-[#7C3AED] font-semibold">Installments ✓</span>}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">slug: /{c.slug}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggleCourse(c.id, !c.is_active)}
                      className={`p-2 rounded-xl transition-colors ${c.is_active ? "text-emerald-600 hover:bg-emerald-50" : "text-red-500 hover:bg-red-50"}`}
                      title={c.is_active ? "Deactivate" : "Activate"}>
                      {c.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => { setEditCourse(c); setShowCourseForm(true); }}
                      className="p-2 rounded-xl text-[#64748B] hover:text-[#0D9488] hover:bg-teal-50" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteCourse(c.id)}
                      className="p-2 rounded-xl text-[#64748B] hover:text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BATCHES TAB ═══ */}
      {tab === "batches" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-mono border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-4">Batch</th><th className="p-4">Course</th><th className="p-4">Schedule</th>
                  <th className="p-4">Mode</th><th className="p-4">Seats</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredBatches.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-[#64748B]">No batches found.</td></tr>
                ) : filteredBatches.map(b => (
                  <tr key={b.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{b.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{b.batch_code}</div>
                    </td>
                    <td className="p-4 font-semibold text-[#0D9488]">{b.course?.title || "—"}</td>
                    <td className="p-4">
                      <div className="text-[#0F172A]">{b.start_date} → {b.end_date}</div>
                      <div className="text-[10px] text-[#64748B]">{(b.class_days || []).join(", ")} · {b.class_time}</div>
                      <div className="text-[10px] text-slate-400">{b.instructor_name}</div>
                    </td>
                    <td className="p-4 capitalize">{b.mode}</td>
                    <td className="p-4">
                      <div className="font-mono font-bold">{b.enrolled_seats}/{b.total_seats}</div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${(b.enrolled_seats / b.total_seats) * 100}%` }} />
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {b.status === "upcoming" && <button onClick={() => handleBatchStatus(b.id, "ongoing")} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">Start</button>}
                        {b.status === "ongoing" && <button onClick={() => handleBatchStatus(b.id, "completed")} className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-bold">Complete</button>}
                        <button onClick={() => { setEditBatch(b); setShowBatchForm(true); }} className="p-1 text-[#64748B] hover:text-[#0D9488]"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteBatch(b.id)} className="p-1 text-[#64748B] hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ INSTRUCTORS TAB ═══ */}
      {tab === "instructors" && (
        <div className="space-y-4">
          <p className="text-xs text-[#64748B]">Instructors are automatically derived from courses. Assign instructors when creating or editing a course.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {instructors.length === 0 ? (
              <div className="col-span-full bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center text-[#64748B]">No instructors found. Add courses with instructor names.</div>
            ) : instructors.map(inst => (
              <div key={inst.name} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center text-white text-xl font-black shadow-lg">
                    {inst.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{inst.name}</h3>
                    <p className="text-xs text-[#64748B]">Academy Instructor</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#F0FDFA] rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-[#0D9488] font-mono">{inst.courses}</div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">Courses</div>
                  </div>
                  <div className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-[#7C3AED] font-mono">{inst.students}</div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">Students</div>
                  </div>
                  <div className="bg-[#FFF7ED] rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-[#F97316] font-mono flex items-center justify-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" />{inst.rating}</div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">Rating</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-[#475569] uppercase">Assigned Courses:</p>
                  {inst.courseList.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-3 py-1.5 text-xs">
                      <span className="font-medium text-[#0F172A] truncate">{c.title}</span>
                      <span className={`text-[10px] font-bold ${c.is_active ? "text-emerald-600" : "text-red-500"}`}>{c.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      {showCourseForm && (
        <CourseFormModal course={editCourse} categories={categories} onClose={() => { setShowCourseForm(false); setEditCourse(null); }} onSaved={loadData} />
      )}
      {showBatchForm && (
        <BatchFormModal batch={editBatch} courses={courses} onClose={() => { setShowBatchForm(false); setEditBatch(null); }} onSaved={loadData} />
      )}
    </div>
  );
}
