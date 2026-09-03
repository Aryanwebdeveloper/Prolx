"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  BookOpen, Users, Calendar, Award, CheckCircle, Clock, Search, Plus,
  Edit, Trash2, Check, X, Filter, ChevronRight, Eye, Shield, AlertCircle,
  GraduationCap, Star, DollarSign, RefreshCw, Briefcase, Monitor, MapPin,
  Play, Zap, FileText, Save, Download, Printer, Copy, Share2, Upload,
  Settings, CheckSquare, Ban, ExternalLink, Layers, Sliders, AlertTriangle
} from "lucide-react";
import {
  getAdminEnrollments, getAdminDemoBookings, getAdminCourses, getAdminBatches,
  getAdminCategories, updateEnrollmentStatus, updateEnrollmentPayment, updateDemoStatus,
  updateBatchStatus, upsertCourse, upsertBatch, toggleCourseActive, deleteCourse,
  deleteBatch, getAdminStudents, upsertStudent, deleteStudent, checkStudentEligibility,
  generateStudentCertificate, uploadStudentCertificate, revokeAcademyCertificate,
  getAdminAcademyCertificates, getCertificateTemplates, upsertCertificateTemplate,
  getAcademyCertificateSettings, updateAcademyCertificateSettings
} from "@/app/academy-actions";
import { CERTIFICATE_CONFIGS, formatCertDate, getCertStatus, generateCertificateId } from "@/lib/certificates";
import { generateCertificatePDF } from "@/lib/certificate-generator";
import { saveAs } from "file-saver";
import type { AcademyStudent, AcademyCertificate, StudentEligibilityResult } from "@/types/academy";

// ─── Status Badge Component ─────────────────────────────────────
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
    issued: "bg-emerald-50 text-emerald-700 border-emerald-200",
    verified: "bg-teal-50 text-teal-700 border-teal-200",
    revoked: "bg-rose-50 text-rose-700 border-rose-200",
    eligible: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function AcademyAdminPanel() {
  const [tab, setTab] = useState<
    "dashboard" | "students" | "courses" | "batches" | "enrollments" | "certificates" | "generator" | "upload" | "templates" | "settings"
  >("dashboard");

  // Data states
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<AcademyCertificate[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  // Student Profile Modal state
  const [selectedStudent, setSelectedStudent] = useState<AcademyStudent | null>(null);
  const [studentTab, setStudentTab] = useState<"info" | "courses" | "attendance" | "results" | "certificates" | "activity">("info");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editStudent, setEditStudent] = useState<AcademyStudent | null>(null);

  // Certificate Generator Wizard state
  const [genStudentId, setGenStudentId] = useState("");
  const [eligibility, setEligibility] = useState<StudentEligibilityResult | null>(null);
  const [genCertType, setGenCertType] = useState("course_completion");
  const [genIssueDate, setGenIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);

  // Upload Certificate state
  const [uploadStudentId, setUploadStudentId] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCertId, setUploadCertId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview PDF Modal state
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  // Load All Master Data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [stus, crs, bts, enr, certs, tmps, sets, cats] = await Promise.all([
      getAdminStudents(),
      getAdminCourses(),
      getAdminBatches(),
      getAdminEnrollments(),
      getAdminAcademyCertificates(),
      getCertificateTemplates(),
      getAcademyCertificateSettings(),
      getAdminCategories(),
    ]);
    setStudents(stus as any[]);
    setCourses(crs);
    setBatches(bts);
    setEnrollments(enr);
    setCertificates(certs as any[]);
    setTemplates(tmps);
    setSettings(sets);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Check Eligibility Handler
  const handleCheckEligibility = async (studentId: string) => {
    setGenStudentId(studentId);
    if (!studentId) { setEligibility(null); return; }
    const res = await checkStudentEligibility(studentId);
    setEligibility(res);
  };

  // Generate Certificate Handler
  const handleGenerateCertificate = async () => {
    if (!genStudentId) return alert("Select a student first.");
    setGenerating(true);
    const res = await generateStudentCertificate({
      student_id: genStudentId,
      certificate_type: genCertType,
      issue_date: genIssueDate,
    });
    setGenerating(false);
    if (res.success) {
      alert(`Certificate issued successfully! ID: ${res.certificate_id}`);
      setGenStudentId("");
      setEligibility(null);
      await loadData();
      setTab("certificates");
    } else {
      alert("Error issuing certificate: " + res.error);
    }
  };

  // Upload Certificate Handler
  const handleUploadCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadStudentId || !uploadFile) return alert("Please select a student and certificate file.");
    setUploading(true);
    const fd = new FormData();
    fd.append("student_id", uploadStudentId);
    fd.append("course_title", uploadTitle);
    fd.append("certificate_id", uploadCertId);
    fd.append("file", uploadFile);

    const res = await uploadStudentCertificate(fd);
    setUploading(false);
    if (res.success) {
      alert(`Uploaded certificate issued! ID: ${res.certificate_id}`);
      setUploadStudentId("");
      setUploadTitle("");
      setUploadCertId("");
      setUploadFile(null);
      await loadData();
      setTab("certificates");
    } else {
      alert("Upload failed: " + res.error);
    }
  };

  // Revoke Certificate
  const handleRevokeCertificate = async (certId: string) => {
    const reason = prompt("Enter reason for revoking certificate:", "Failed eligibility or administrative action");
    if (reason === null) return;
    await revokeAcademyCertificate(certId, reason);
    await loadData();
  };

  // PDF Preview Handler
  const handlePreviewPDF = async (cert: AcademyCertificate) => {
    try {
      const blob = await generateCertificatePDF({
        type: cert.certificate_type as any || "course_completion",
        recipientName: cert.recipient_name,
        courseTitle: cert.course_title,
        courseDuration: cert.course_duration || undefined,
        startDate: cert.start_date || undefined,
        completionDate: cert.completion_date || undefined,
        certId: cert.certificate_id,
        issueDate: cert.issue_date,
        verificationUrl: cert.qr_code_url || `${window.location.origin}/verify-certificate/${cert.certificate_id}`,
      });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setPreviewName(cert.recipient_name);
    } catch (err: any) {
      alert("Error generating PDF preview: " + err.message);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = async (cert: AcademyCertificate) => {
    try {
      if (cert.is_uploaded && cert.file_url) {
        window.open(cert.file_url, "_blank");
      } else {
        const blob = await generateCertificatePDF({
          type: cert.certificate_type as any || "course_completion",
          recipientName: cert.recipient_name,
          courseTitle: cert.course_title,
          courseDuration: cert.course_duration || undefined,
          startDate: cert.start_date || undefined,
          completionDate: cert.completion_date || undefined,
          certId: cert.certificate_id,
          issueDate: cert.issue_date,
          verificationUrl: cert.qr_code_url || `${window.location.origin}/verify-certificate/${cert.certificate_id}`,
        });
        saveAs(blob, `PROLX-CERTIFICATE-${cert.certificate_id}.pdf`);
      }
    } catch (err: any) {
      alert("Error downloading PDF: " + err.message);
    }
  };

  // Navigation Items
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "students", label: "Students", icon: Users, count: students.length },
    { id: "courses", label: "Courses & Eligibility", icon: BookOpen, count: courses.length },
    { id: "batches", label: "Batches", icon: Calendar, count: batches.length },
    { id: "enrollments", label: "Enrollments", icon: FileText, count: enrollments.length },
    { id: "certificates", label: "Certificates Master", icon: Award, count: certificates.length },
    { id: "generator", label: "Certificate Generator", icon: Plus },
    { id: "upload", label: "Upload Certificate", icon: Upload },
    { id: "templates", label: "Templates", icon: Layers, count: templates.length },
    { id: "settings", label: "Academy Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 font-sans text-[#0F172A]">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <GraduationCap className="text-[#0D9488]" /> Prolx Academy Management System
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete lifecycle management: Student directory, course eligibility, certificate generation, uploaded documents, template engine, and public verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("generator")}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> Generate Certificate
          </button>
          <button onClick={loadData} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            <RefreshCw size={15} className={loading ? "animate-spin text-[#0D9488]" : "text-slate-500"} />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex gap-1 overflow-x-auto">
        {navTabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === id
                ? "bg-[#0D9488] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${tab === id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ 1. DASHBOARD / ANALYTICS TAB ═══ */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Students", value: students.length, color: "text-[#0F172A] border-l-4 border-slate-400" },
              { label: "Active Courses", value: courses.filter(c => c.is_active).length, color: "text-blue-600 border-l-4 border-blue-500" },
              { label: "Issued Certs", value: certificates.filter(c => c.status === "issued" || c.status === "verified").length, color: "text-emerald-600 border-l-4 border-emerald-500" },
              { label: "Revoked Certs", value: certificates.filter(c => c.status === "revoked").length, color: "text-rose-600 border-l-4 border-rose-500" },
              { label: "Active Batches", value: batches.filter(b => b.status === "ongoing").length, color: "text-purple-600 border-l-4 border-purple-500" },
              { label: "Total Enrollments", value: enrollments.length, color: "text-teal-600 border-l-4 border-teal-500" },
            ].map((card, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.label}</div>
                <div className={`text-2xl font-bold mt-1 ${card.color.split(" ")[0]}`}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions & Recent Activity Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-slate-100 mb-4 flex items-center justify-between" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <span>Recent Certificate Issuance Activity</span>
                <button onClick={() => setTab("certificates")} className="text-xs text-[#0D9488] hover:underline font-semibold">View All →</button>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.slice(0, 5).map(cert => (
                  <div key={cert.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0F172A] dark:text-slate-200">{cert.recipient_name}</div>
                      <div className="text-slate-500">{cert.course_title} • <span className="font-mono text-[#0D9488]">{cert.certificate_id}</span></div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={cert.status} />
                      <div className="text-[10px] text-slate-400 mt-1">{formatCertDate(cert.issue_date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Quick Certificate Actions
              </h3>
              <button
                onClick={() => setTab("generator")}
                className="w-full p-4 bg-[#F0FDFA] dark:bg-slate-800 border border-teal-200 dark:border-teal-900 rounded-2xl text-left hover:border-[#0D9488] transition-all group"
              >
                <div className="font-bold text-xs text-[#0D9488] flex items-center justify-between">
                  Auto Generate Certificate <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Select completed student, evaluate course criteria, and issue Prolx Certificate.</p>
              </button>

              <button
                onClick={() => setTab("upload")}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-slate-400 transition-all group"
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  Upload External Certificate <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload existing PDF/Image file for a student and connect to public verification.</p>
              </button>

              <button
                onClick={() => setTab("students")}
                className="w-full p-4 bg-purple-50/50 dark:bg-slate-800/50 border border-purple-200 dark:border-purple-900 rounded-2xl text-left hover:border-purple-500 transition-all group"
              >
                <div className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
                  Manage Students Directory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">View student profile tabs: enrollment, courses, attendance, grades, and certificates.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 2. STUDENTS DIRECTORY TAB ═══ */}
      {tab === "students" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Students Academic Directory
              </h2>
              <p className="text-xs text-slate-500">Manage student profiles, academic lifecycle, attendance %, grades, and certificate issuance.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name & Contact</th>
                  <th className="py-3 px-4">Enrolled Course & Batch</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Score / Grade</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.filter(s => !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())).map(stu => (
                  <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{stu.student_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A] dark:text-slate-200">{stu.full_name}</div>
                      <div className="text-[10px] text-slate-400">{stu.email} • {stu.phone || stu.whatsapp || "No Phone"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{stu.course?.title || "No course assigned"}</div>
                      <div className="text-[10px] text-slate-400">{stu.batch?.name || "No batch"}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{stu.attendance_pct || 0}%</td>
                    <td className="py-3 px-4 font-mono font-bold">{stu.result_score || 0}%</td>
                    <td className="py-3 px-4"><StatusBadge status={stu.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedStudent(stu); setStudentTab("info"); }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => { setGenStudentId(stu.id); handleCheckEligibility(stu.id); setTab("generator"); }}
                          className="px-2.5 py-1 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-[11px] font-bold"
                        >
                          Certify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ 3. COURSES & ELIGIBILITY TAB ═══ */}
      {tab === "courses" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Academy Courses & Certificate Eligibility Requirements
              </h2>
              <p className="text-xs text-slate-500">Configure minimum attendance %, pass marks, and manual approval requirements for certificate eligibility.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {courses.map(crs => (
              <div key={crs.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">{crs.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Slug: {crs.slug} • Level: {crs.level}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${crs.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {crs.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-[#0D9488] mb-1">Certificate Eligibility Rules</div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Min Required Attendance:</span>
                    <span className="font-mono font-bold">{crs.min_attendance_pct || 75}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Min Required Score / Marks:</span>
                    <span className="font-mono font-bold">{crs.min_result_score || 60}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Manual Admin Approval:</span>
                    <span className="font-mono font-bold">{crs.require_manual_approval ? "Yes Required" : "Auto Eligible"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 4. CERTIFICATES MASTER TAB ═══ */}
      {tab === "certificates" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Master Certificates Register
              </h2>
              <p className="text-xs text-slate-500">All issued and uploaded certificates with QR code verification status.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search certificate ID or student..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Recipient Student</th>
                  <th className="py-3 px-4">Course Program</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.filter(c => !search || c.certificate_id?.toLowerCase().includes(search.toLowerCase()) || c.recipient_name?.toLowerCase().includes(search.toLowerCase())).map(cert => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{cert.certificate_id}</td>
                    <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-slate-200">{cert.recipient_name}</td>
                    <td className="py-3 px-4">{cert.course_title}</td>
                    <td className="py-3 px-4 text-slate-500">{formatCertDate(cert.issue_date)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] uppercase">
                        {cert.is_uploaded ? "Uploaded" : cert.certificate_type || "Generated"}
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={cert.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handlePreviewPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Preview PDF">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDownloadPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Download PDF">
                          <Download size={14} />
                        </button>
                        <a href={`/verify-certificate/${cert.certificate_id}`} target="_blank" rel="noreferrer" className="p-1 hover:bg-slate-100 rounded text-[#0D9488]" title="Open Public Verification Link">
                          <ExternalLink size={14} />
                        </a>
                        {cert.status !== "revoked" && (
                          <button onClick={() => handleRevokeCertificate(cert.certificate_id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded" title="Revoke Certificate">
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ 5. CERTIFICATE GENERATOR TAB ═══ */}
      {tab === "generator" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Automated Certificate Generator Wizard
            </h2>
            <p className="text-xs text-slate-500">Select a student to evaluate eligibility and automatically populate certificate fields using the Prolx Certificate template.</p>
          </div>

          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Step 1: Select Student
            </label>
            <select
              value={genStudentId}
              onChange={e => handleCheckEligibility(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-[#0D9488] bg-white dark:bg-slate-900"
            >
              <option value="">-- Choose Student from Directory --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.student_code}) — {s.course?.title || "No course"}</option>
              ))}
            </select>
          </div>

          {/* Eligibility Results Box */}
          {eligibility && (
            <div className={`p-5 rounded-2xl border ${eligibility.isEligible ? "bg-emerald-50/70 border-emerald-200 text-emerald-800" : "bg-amber-50/70 border-amber-200 text-amber-800"} space-y-3`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {eligibility.isEligible ? <CheckCircle className="text-emerald-600" /> : <AlertTriangle className="text-amber-600" />}
                <span>Eligibility Status: {eligibility.isEligible ? "ELIGIBLE FOR CERTIFICATE" : "REQUIREMENTS PENDING"}</span>
              </div>
              <div className="text-xs space-y-1">
                <div>Course: <strong>{eligibility.courseTitle}</strong></div>
                <div>Attendance: <strong>{eligibility.requirements.attendancePct}%</strong> (Min required: {eligibility.requirements.minAttendancePct}%)</div>
                <div>Result Score: <strong>{eligibility.requirements.resultScore}%</strong> (Min required: {eligibility.requirements.minResultScore}%)</div>
              </div>
              {eligibility.reasons.length > 0 && (
                <div className="text-xs text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  Warnings: {eligibility.reasons.join(" ")}
                </div>
              )}
            </div>
          )}

          {/* Generation Options */}
          {genStudentId && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Certificate Type</label>
                  <select
                    value={genCertType}
                    onChange={e => setGenCertType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="course_completion">Course Completion Certificate</option>
                    <option value="training_completion">Training Certificate</option>
                    <option value="internship_completion">Internship Completion Certificate</option>
                    <option value="participation">Participation Certificate</option>
                    <option value="achievement">Achievement Certificate</option>
                    <option value="appreciation">Appreciation Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={genIssueDate}
                    onChange={e => setGenIssueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                {generating ? <RefreshCw className="animate-spin" size={16} /> : <Award size={18} />}
                {generating ? "Generating & Issuing..." : "Confirm & Issue Certificate"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ 6. UPLOAD CERTIFICATE TAB ═══ */}
      {tab === "upload" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Upload External / Legacy Certificate
            </h2>
            <p className="text-xs text-slate-500">Upload existing certificate documents (PDF or images) created outside the auto-generator and connect them to public QR verification.</p>
          </div>

          <form onSubmit={handleUploadCertificateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Select Student *</label>
              <select
                value={uploadStudentId}
                onChange={e => setUploadStudentId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.student_code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Course / Certificate Title *</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="e.g. Graphic Design & UI/UX Certificate"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Certificate ID <span className="text-slate-400">(optional - auto-generated if blank)</span></label>
              <input
                type="text"
                value={uploadCertId}
                onChange={e => setUploadCertId(e.target.value)}
                placeholder="e.g. PRLX-CERT-26-000042"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Upload File (PDF, PNG, JPG) *</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#0D9488] hover:file:bg-teal-100"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={18} />}
              {uploading ? "Uploading Document..." : "Save & Issue Uploaded Certificate"}
            </button>
          </form>
        </div>
      )}

      {/* ═══ 7. TEMPLATES TAB ═══ */}
      {tab === "templates" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Certificate Template Manager
              </h2>
              <p className="text-xs text-slate-500">Configure default Prolx branding, signatures, seals, and visual layout coordinates.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(tmp => (
              <div key={tmp.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">{tmp.name}</h3>
                    <p className="text-xs text-slate-500">{tmp.description}</p>
                  </div>
                  {tmp.is_default && (
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-[#0D9488] text-[10px] font-extrabold">Default</span>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
                  <img src={tmp.bg_image_url} alt="Template Background" className="w-full h-36 object-contain" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 8. SETTINGS TAB ═══ */}
      {tab === "settings" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Academy Certificate Global Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">ID Prefix</label>
              <input
                type="text"
                value={settings.id_prefix || "PRLX-CERT"}
                onChange={e => setSettings({ ...settings, id_prefix: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year Format</label>
              <input
                type="text"
                value={settings.year_format || "26"}
                onChange={e => setSettings({ ...settings, year_format: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Next Sequence Counter Number</label>
              <input
                type="number"
                value={settings.sequence_counter || 1001}
                onChange={e => setSettings({ ...settings, sequence_counter: parseInt(e.target.value) || 1001 })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <button
              onClick={async () => {
                await updateAcademyCertificateSettings(settings);
                alert("Settings saved successfully!");
              }}
              className="px-6 py-2.5 bg-[#0D9488] text-white font-bold rounded-xl text-xs hover:bg-[#0F766E]"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Modal View */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-slate-100">{selectedStudent.full_name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedStudent.student_code} • {selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-semibold">
              {(["info", "courses", "attendance", "certificates"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setStudentTab(t)}
                  className={`px-3 py-1.5 rounded-lg capitalize ${studentTab === t ? "bg-[#0D9488] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {studentTab === "info" && (
              <div className="space-y-2 text-xs">
                <div>Phone: <strong>{selectedStudent.phone || selectedStudent.whatsapp || "N/A"}</strong></div>
                <div>City: <strong>{selectedStudent.city || "N/A"}</strong></div>
                <div>Education: <strong>{selectedStudent.education || "N/A"}</strong></div>
                <div>Profession: <strong>{selectedStudent.current_profession || "N/A"}</strong></div>
              </div>
            )}

            {studentTab === "certificates" && (
              <div className="space-y-2 text-xs">
                {certificates.filter(c => c.student_id === selectedStudent.id).map(cert => (
                  <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold">{cert.course_title}</div>
                      <div className="font-mono text-[10px] text-[#0D9488]">{cert.certificate_id}</div>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">Certificate PDF Document Preview: {previewName}</h3>
              <button onClick={() => { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe src={previewBlobUrl} className="w-full h-full border-none" title="Certificate PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
