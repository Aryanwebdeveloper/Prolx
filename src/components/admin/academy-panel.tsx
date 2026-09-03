"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import {
  BookOpen, Users, Calendar, Award, CheckCircle, Clock, Search, Plus,
  Edit, Trash2, Check, X, Filter, ChevronRight, Eye, Shield, AlertCircle,
  GraduationCap, Star, DollarSign, RefreshCw, Briefcase, Monitor, MapPin,
  Play, Zap, FileText, Save, Download, Printer, Copy, Share2, Upload,
  Settings, CheckSquare, Ban, ExternalLink, Layers, Sliders, AlertTriangle,
  QrCode, FileCheck, UserCheck, ArrowRight, RotateCcw
} from "lucide-react";
import {
  getAdminEnrollments, getAdminDemoBookings, getAdminCourses, getAdminBatches,
  getAdminCategories, updateEnrollmentStatus, updateEnrollmentPayment, updateDemoStatus,
  updateBatchStatus, upsertCourse, upsertBatch, toggleCourseActive, deleteCourse,
  deleteBatch, getAdminStudents, upsertStudent, deleteStudent, checkStudentEligibility,
  generateStudentCertificate, uploadStudentCertificate, revokeAcademyCertificate,
  deleteAcademyCertificate, getAdminAcademyCertificates, getCertificateTemplates,
  upsertCertificateTemplate, getAcademyCertificateSettings, updateAcademyCertificateSettings,
  getEnrolledStudentsByCourse, getStudentCertificates
} from "@/app/academy-actions";
import {
  CERTIFICATE_CONFIGS, formatCertDate, formatCertDateFull, getCertStatus,
  generateCertificateId, CertificateType
} from "@/lib/certificates";
import { generateCertificatePDF } from "@/lib/certificate-generator";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Student Profile Modal state
  const [selectedStudent, setSelectedStudent] = useState<AcademyStudent | null>(null);
  const [studentTab, setStudentTab] = useState<"info" | "courses" | "attendance" | "results" | "certificates">("info");
  const [studentCertsHistory, setStudentCertsHistory] = useState<AcademyCertificate[]>([]);
  const [loadingStudentCerts, setLoadingStudentCerts] = useState(false);

  // ── Generator State (Course -> Student -> Auto Details -> Preview -> Generate)
  const [genMode, setGenMode] = useState<"enrolled" | "manual">("enrolled");
  const [manualStudentName, setManualStudentName] = useState<string>("");
  const [manualStudentEmail, setManualStudentEmail] = useState<string>("");
  const [manualCourseTitle, setManualCourseTitle] = useState<string>("Graphic Designing & UI/UX Designing");
  const [genCourseId, setGenCourseId] = useState<string>("");
  const [genCourseSearch, setGenCourseSearch] = useState<string>("");
  const [genStudentSearch, setGenStudentSearch] = useState<string>("");
  const [genStudentId, setGenStudentId] = useState<string>("");
  const [genSelectedStudent, setGenSelectedStudent] = useState<AcademyStudent | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<StudentEligibilityResult | null>(null);
  const [genCertType, setGenCertType] = useState<string>("course_completion");
  const [genIssueDate, setGenIssueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [genCertId, setGenCertId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const certId = genCertId || "PRLX-CERT-000001";
    const url = typeof window !== "undefined" ? `${window.location.origin}/verify-certificate/${certId}` : `https://prolx.cloud/verify-certificate/${certId}`;
    QRCode.toDataURL(url, { margin: 1, width: 250, color: { dark: "#0F172A", light: "#FFFFFF" } })
      .then(setPreviewQrUrl)
      .catch(console.error);
  }, [genCertId]);

  // Upload Certificate state
  const [uploadStudentId, setUploadStudentId] = useState("");
  const [uploadCourseId, setUploadCourseId] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCertType, setUploadCertType] = useState("course_completion");
  const [uploadCertId, setUploadCertId] = useState("");
  const [uploadIssueDate, setUploadIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview PDF Modal state
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  // Load All Master Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
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
    } catch (err: any) {
      setFetchError("Unable to load academy data. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Generate clean Certificate ID e.g. PRLX-CERT-0000035
  const generateNewCertId = useCallback(() => {
    let maxNum = 0;
    certificates.forEach(c => {
      const idStr = c.certificate_id || c.id || "";
      const matches = idStr.match(/(\d+)/g);
      if (matches) {
        matches.forEach(m => {
          const num = parseInt(m, 10);
          if (!isNaN(num) && num > maxNum && num < 9999999) {
            maxNum = num;
          }
        });
      }
    });
    const nextNum = maxNum + 1;
    setGenCertId(`PRLX-CERT-${String(nextNum).padStart(7, '0')}`);
  }, [certificates]);

  useEffect(() => {
    if (!genCertId) {
      generateNewCertId();
    }
  }, [genCertId, generateNewCertId]);

  // Filtered Students for Step 1 & Step 2 in Generator
  const availableStudentsForCourse = useMemo(() => {
    let list = students;
    if (genCourseId) {
      list = list.filter(s => s.course_id === genCourseId);
    }
    if (genStudentSearch.trim()) {
      const q = genStudentSearch.toLowerCase().trim();
      list = list.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.student_code?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, genCourseId, genStudentSearch]);

  // Select Student Handler in Generator
  const handleSelectStudentForGen = async (student: AcademyStudent) => {
    setGenStudentId(student.id);
    setGenSelectedStudent(student);
    setGenLoading(true);
    setGenError(null);
    try {
      const elig = await checkStudentEligibility(student.id, student.course_id);
      setEligibility(elig);
      // Auto-set course title if present
      if (student.course_id && !genCourseId) {
        setGenCourseId(student.course_id);
      }
    } catch (e: any) {
      setGenError("Unable to load student information. Please retry.");
    } finally {
      setGenLoading(false);
    }
  };

  // Generate Certificate Handler
  const handleGenerateCertificate = async (andAction?: "download" | "print") => {
    const targetName = genMode === "manual" ? manualStudentName : genSelectedStudent?.full_name;
    if (!targetName?.trim()) {
      return alert(genMode === "manual" ? "Please enter a student name." : "Please select a student first.");
    }
    setGenerating(true);

    const targetEmail = genMode === "manual" ? manualStudentEmail : genSelectedStudent?.email;
    const targetCourse = genMode === "manual" ? manualCourseTitle : (genSelectedStudent?.course?.title || "Graphic Designing & UI/UX Designing");

    const res = await generateStudentCertificate({
      student_id: genMode === "enrolled" ? genSelectedStudent?.id : undefined,
      recipient_name: targetName,
      recipient_email: targetEmail,
      course_title: targetCourse,
      course_id: genCourseId || (genMode === "enrolled" ? genSelectedStudent?.course_id : undefined),
      batch_id: genMode === "enrolled" ? genSelectedStudent?.batch_id : undefined,
      certificate_type: genCertType,
      issue_date: genIssueDate,
      custom_cert_id: genCertId,
    });
    setGenerating(false);

    if (res.success && res.certificate_id) {
      alert(`Certificate issued successfully! Certificate ID: ${res.certificate_id}`);
      const certObj: AcademyCertificate = res.data || {
        id: res.certificate_id,
        certificate_id: res.certificate_id,
        recipient_name: targetName,
        recipient_email: targetEmail,
        course_title: targetCourse,
        issue_date: genIssueDate,
        status: "issued",
        certificate_type: genCertType,
        qr_code_url: `${window.location.origin}/verify-certificate/${res.certificate_id}`,
      } as any;

      if (andAction === "download") {
        await handleDownloadPDF(certObj);
      } else if (andAction === "print") {
        window.print();
      }

      await loadData();
      generateNewCertId();
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
    fd.append("certificate_type", uploadCertType);
    fd.append("certificate_id", uploadCertId);
    fd.append("issue_date", uploadIssueDate);
    fd.append("file", uploadFile);

    const res = await uploadStudentCertificate(fd);
    setUploading(false);
    if (res.success) {
      alert(`Uploaded certificate saved successfully! ID: ${res.certificate_id}`);
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
    const reason = prompt("Enter reason for revoking certificate:", "Administrative action");
    if (reason === null) return;
    await revokeAcademyCertificate(certId, reason);
    await loadData();
  };

  // Delete Certificate Handler
  const handleDeleteCertificate = async (certId: string) => {
    if (!confirm(`Are you sure you want to delete certificate ${certId}? This action cannot be undone.`)) return;
    const res = await deleteAcademyCertificate(certId);
    if (res.success) {
      alert("Certificate deleted.");
      await loadData();
    } else {
      alert("Delete failed: " + res.error);
    }
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

  // Load Student Certificates for Modal Profile
  const handleOpenStudentProfile = async (stu: AcademyStudent) => {
    setSelectedStudent(stu);
    setStudentTab("info");
    setLoadingStudentCerts(true);
    const certs = await getStudentCertificates(stu.id);
    setStudentCertsHistory(certs as any[]);
    setLoadingStudentCerts(false);
  };

  // Copy Verification Link
  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify-certificate/${certId}`;
    navigator.clipboard.writeText(url);
    alert("Verification URL copied to clipboard!");
  };

  // Navigation Items
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "generator", label: "Certificate Generator", icon: Plus },
    { id: "certificates", label: "Certificates Master", icon: Award, count: certificates.length },
    { id: "upload", label: "Upload Certificate", icon: Upload },
    { id: "students", label: "Students Directory", icon: Users, count: students.length },
    { id: "courses", label: "Courses & Eligibility", icon: BookOpen, count: courses.length },
    { id: "batches", label: "Batches", icon: Calendar, count: batches.length },
    { id: "enrollments", label: "Enrollments", icon: FileText, count: enrollments.length },
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
            Simplified certificate generation flow, student records, public verification, uploaded documents, and academy stats.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("generator")}
            className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> Certificate Generator
          </button>
          <button onClick={loadData} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800" title="Refresh Data">
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Students", value: students.length, color: "text-slate-800 border-l-4 border-slate-400", icon: Users },
              { label: "Active Students", value: students.filter(s => s.status === "active").length, color: "text-emerald-600 border-l-4 border-emerald-500", icon: UserCheck },
              { label: "Completed Courses", value: students.filter(s => s.status === "completed").length, color: "text-purple-600 border-l-4 border-purple-500", icon: CheckCircle },
              { label: "Active Courses", value: courses.filter(c => c.is_active !== false).length, color: "text-blue-600 border-l-4 border-blue-500", icon: BookOpen },
              { label: "Total Enrollments", value: enrollments.length, color: "text-teal-600 border-l-4 border-teal-500", icon: FileText },
              { label: "Certs Generated", value: certificates.filter(c => !c.is_uploaded).length, color: "text-teal-700 border-l-4 border-teal-600", icon: Award },
              { label: "Certs Uploaded", value: certificates.filter(c => c.is_uploaded).length, color: "text-indigo-600 border-l-4 border-indigo-500", icon: Upload },
              { label: "Certs Verified", value: certificates.filter(c => c.status === "verified" || c.status === "issued").length, color: "text-emerald-700 border-l-4 border-emerald-600", icon: FileCheck },
              { label: "Upcoming Batches", value: batches.filter(b => b.status === "upcoming").length, color: "text-amber-600 border-l-4 border-amber-500", icon: Calendar },
              { label: "Available Seats", value: batches.reduce((acc, b) => acc + (Math.max(0, (b.total_seats || 30) - (b.enrolled_seats || 0))), 0), color: "text-cyan-600 border-l-4 border-cyan-500", icon: Users },
            ].map((card, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{card.label}</div>
                  <div className={`text-2xl font-extrabold mt-1 ${card.color.split(" ")[0]}`}>{card.value}</div>
                </div>
                <card.icon className="text-slate-300 dark:text-slate-700" size={24} />
              </div>
            ))}
          </div>

          {/* Quick Actions & Recent Activity Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-slate-100 mb-4 flex items-center justify-between" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <span>Recent Certificate Activity</span>
                <button onClick={() => setTab("certificates")} className="text-xs text-[#0D9488] hover:underline font-semibold">View All Register →</button>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.slice(0, 6).map(cert => (
                  <div key={cert.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0F172A] dark:text-slate-200 flex items-center gap-2">
                        {cert.recipient_name}
                        {cert.is_uploaded ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-100 text-purple-700 font-bold">Uploaded</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-100 text-teal-700 font-bold">Generated</span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{cert.course_title} • <span className="font-mono text-[#0D9488]">{cert.certificate_id}</span></div>
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
                Certificate Actions & Tools
              </h3>
              <button
                onClick={() => setTab("generator")}
                className="w-full p-4 bg-[#F0FDFA] dark:bg-slate-800 border border-teal-200 dark:border-teal-900 rounded-2xl text-left hover:border-[#0D9488] transition-all group"
              >
                <div className="font-bold text-xs text-[#0D9488] flex items-center justify-between">
                  Simple Certificate Generator <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Select Course → Select Student → Preview & Generate Certificate in 1 minute.</p>
              </button>

              <button
                onClick={() => setTab("upload")}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-slate-400 transition-all group"
              >
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  Upload External Certificate <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload an existing PDF/Image file and attach to student record.</p>
              </button>

              <button
                onClick={() => setTab("students")}
                className="w-full p-4 bg-purple-50/50 dark:bg-slate-800/50 border border-purple-200 dark:border-purple-900 rounded-2xl text-left hover:border-purple-500 transition-all group"
              >
                <div className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
                  Students Directory & Profiles <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">View student courses, attendance, grades, and certificate issuance history.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 2. NEW SIMPLE CERTIFICATE GENERATOR FLOW TAB ═══ */}
      {tab === "generator" && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <Award className="text-[#0D9488]" /> Certificate Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate a professional Prolx Academy certificate for a completed course in a few simple steps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">ID Prefix: PRLX-CERT</span>
              <button onClick={generateNewCertId} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                <RotateCcw size={13} /> Reset ID
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Flow Steps */}
            <div className="lg:col-span-6 space-y-6">

              {/* Step 1: Select Course */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-xs">1</span>
                    Step 1 — Select Course
                  </label>
                  {genCourseId && (
                    <button onClick={() => { setGenCourseId(""); setGenStudentId(""); setGenSelectedStudent(null); }} className="text-[11px] text-slate-400 hover:text-slate-600">
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={genCourseSearch}
                    onChange={e => setGenCourseSearch(e.target.value)}
                    placeholder="Search available course title..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent"
                  />
                </div>

                <select
                  value={genCourseId}
                  onChange={e => {
                    setGenCourseId(e.target.value);
                    setGenStudentId("");
                    setGenSelectedStudent(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0D9488] bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- All Available Courses --</option>
                  {courses
                    .filter(c => !genCourseSearch || c.title?.toLowerCase().includes(genCourseSearch.toLowerCase()))
                    .map(crs => (
                      <option key={crs.id} value={crs.id}>{crs.title} ({crs.duration_weeks ? `${crs.duration_weeks} wks` : "Course"})</option>
                    ))}
                </select>
              </div>

              {/* Step 2: Select Student / Manual Input Toggle */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-xs">2</span>
                    Step 2 — Select or Enter Student Name
                  </label>
                  {genMode === "enrolled" && (
                    <span className="text-[11px] text-slate-400 font-mono">{availableStudentsForCourse.length} students found</span>
                  )}
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setGenMode("enrolled")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      genMode === "enrolled"
                        ? "bg-white dark:bg-slate-700 text-[#0D9488] shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Select Enrolled Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenMode("manual")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      genMode === "manual"
                        ? "bg-white dark:bg-slate-700 text-[#0D9488] shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    + Enter Name Manually
                  </button>
                </div>

                {genMode === "enrolled" ? (
                  <>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={genStudentSearch}
                        onChange={e => setGenStudentSearch(e.target.value)}
                        placeholder="Search by student name or student ID..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent"
                      />
                    </div>

                    {availableStudentsForCourse.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        <Users className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No students are currently enrolled in this course.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try clearing course filter, searching a different name, or switch to manual input above.</p>
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {availableStudentsForCourse.map(stu => {
                          const isSelected = genStudentId === stu.id;
                          return (
                            <div
                              key={stu.id}
                              onClick={() => handleSelectStudentForGen(stu)}
                              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-[#F0FDFA] dark:bg-slate-800 border-[#0D9488] shadow-sm"
                                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                              }`}
                            >
                              <div>
                                <div className="font-bold text-xs text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
                                  {stu.full_name}
                                  <span className="font-mono text-[10px] text-[#0D9488] font-semibold">{stu.student_code}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Course: <strong>{stu.course?.title || "Assigned Course"}</strong> • Batch: <strong>{stu.batch?.name || "Standard Batch"}</strong>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={stu.status} />
                                {isSelected && <CheckCircle size={16} className="text-[#0D9488]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        value={manualStudentName}
                        onChange={e => setManualStudentName(e.target.value)}
                        placeholder="e.g. Aryan Waheed"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#0D9488] bg-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Student Email <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={manualStudentEmail}
                          onChange={e => setManualStudentEmail(e.target.value)}
                          placeholder="student@example.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Course Program Title
                        </label>
                        <input
                          type="text"
                          value={manualCourseTitle}
                          onChange={e => setManualCourseTitle(e.target.value)}
                          placeholder="Graphic Designing & UI/UX"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Certificate Config & Details */}
              {genMode === "enrolled" && genLoading ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
                </div>
              ) : genError ? (
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-200 p-6 text-center space-y-3 text-xs text-rose-800">
                  <AlertCircle size={24} className="mx-auto text-rose-600" />
                  <p className="font-bold">Unable to load student information.</p>
                  <button
                    onClick={() => genSelectedStudent && handleSelectStudentForGen(genSelectedStudent)}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (genMode === "manual" || genSelectedStudent) ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                  <label className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-xs">3</span>
                    Step 3 — Certificate Details & Configuration
                  </label>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Student Name</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {genMode === "manual" ? (manualStudentName || "Manual Entry") : genSelectedStudent?.full_name}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Student ID</span>
                      <strong className="font-mono text-[#0D9488]">
                        {genMode === "manual" ? "MANUAL-INPUT" : genSelectedStudent?.student_code}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Course Title</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {genMode === "manual" ? (manualCourseTitle || "Graphic Designing & UI/UX") : (genSelectedStudent?.course?.title || "Graphic Designing & UI/UX")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Entry Mode</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#0D9488]">
                        {genMode === "manual" ? "Manual Entry" : "Enrolled Record"}
                      </span>
                    </div>
                  </div>

                  {/* Config Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Type</label>
                        <select
                          value={genCertType}
                          onChange={e => setGenCertType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                        >
                          <option value="course_completion">Course Completion Certificate</option>
                          <option value="internship_completion">Internship Completion Certificate</option>
                          <option value="training_completion">Training Certificate</option>
                          <option value="achievement">Achievement Certificate</option>
                          <option value="participation">Participation Certificate</option>
                          <option value="appreciation">Appreciation Certificate</option>
                          <option value="excellence">Certificate of Excellence</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate ID</label>
                        <input
                          type="text"
                          value={genCertId}
                          onChange={e => setGenCertId(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={genIssueDate}
                        onChange={e => setGenIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleGenerateCertificate()}
                      disabled={generating}
                      className="py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {generating ? <RefreshCw className="animate-spin" size={14} /> : <Award size={15} />}
                      Generate
                    </button>
                    <button
                      onClick={() => handleGenerateCertificate("download")}
                      disabled={generating}
                      className="py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download size={15} />
                      Generate & Download
                    </button>
                    <button
                      onClick={() => handleGenerateCertificate("print")}
                      disabled={generating}
                      className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Printer size={15} />
                      Generate & Print
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
                  <UserCheck size={32} className="mx-auto mb-2 text-slate-300" />
                  Select a student or type a student name in Step 2 above to view live certificate preview.
                </div>
              )}
            </div>

            {/* Right Column: Step 4 Real Certificate Visual Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider flex items-center gap-2">
                    <Eye size={16} /> Step 4 — Live Certificate Preview
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Matches Final PDF</span>
                </div>

                {/* Visual Certificate Card Preview (Template Alignment) */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white">
                  <img src="/CourseresUIUXCertificate.png" alt="Prolx Certificate Template" className="w-full object-contain" />

                  {/* Dynamic Overlays on Template Image */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Student Name Centered in Name Box */}
                    <div
                      className="absolute left-0 right-0 top-[43.5%] -translate-y-1/2 text-center font-extrabold text-[#0F172A] tracking-wide uppercase px-8"
                      style={{
                        fontSize: (() => {
                          const name = (genMode === "manual" ? manualStudentName : genSelectedStudent?.full_name) || "";
                          if (name.length > 35) return '10px';
                          if (name.length > 25) return '12px';
                          if (name.length > 18) return '14px';
                          return '16px';
                        })()
                      }}
                    >
                      {(genMode === "manual" ? manualStudentName : genSelectedStudent?.full_name) || "[STUDENT NAME]"}
                    </div>

                    {/* Dynamic QR Code Overlay (Centered in ribbon, completely covering static background QR) */}
                    <div className="absolute left-1/2 top-[77.1%] -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-sm shadow-sm flex items-center justify-center w-[15.5%] aspect-square border border-slate-100/50">
                      {previewQrUrl ? (
                        <img src={previewQrUrl} alt="QR Code Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400 font-mono">QR</div>
                      )}
                    </div>

                    {/* Right-Side Metadata (Stacked Vertically: Cert ID & Issue Date) */}
                    <div className="absolute left-[65.5%] top-[65%] text-left text-[7px] sm:text-[9.5px] font-sans leading-tight">
                      <div className="font-bold text-slate-500 text-[6.5px] sm:text-[8px]">Certificate ID:</div>
                      <div className="font-bold text-[#009B8E] font-mono mb-1.5">{genCertId || "PRLX-CERT-000001"}</div>
                      <div className="font-bold text-slate-500 text-[6.5px] sm:text-[8px]">Issued on:</div>
                      <div className="font-bold text-[#0F172A]">{formatCertDateFull(genIssueDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <QrCode size={14} className="text-[#0D9488]" /> QR Code Verification URL:
                  </div>
                  <div className="font-mono text-[#0D9488] truncate">{`${typeof window !== "undefined" ? window.location.origin : "https://prolx.cloud"}/verify-certificate/${genCertId || "PRLX-CERT-000001"}`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 3. CERTIFICATES MASTER REGISTER TAB (Generated + Uploaded) ═══ */}
      {tab === "certificates" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Master Certificates Register
              </h2>
              <p className="text-xs text-slate-500">View and manage all generated and uploaded Prolx certificates.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cert ID or student..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Badge</th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Recipient Student</th>
                  <th className="py-3 px-4">Course Program</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.filter(c => !search || c.certificate_id?.toLowerCase().includes(search.toLowerCase()) || c.recipient_name?.toLowerCase().includes(search.toLowerCase())).map(cert => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      {cert.is_uploaded ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200">Uploaded</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-700 border border-teal-200">Generated</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{cert.certificate_id}</td>
                    <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-slate-200">{cert.recipient_name}</td>
                    <td className="py-3 px-4">{cert.course_title}</td>
                    <td className="py-3 px-4 text-slate-500">{formatCertDate(cert.issue_date)}</td>
                    <td className="py-3 px-4"><StatusBadge status={cert.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handlePreviewPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Preview PDF">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDownloadPDF(cert)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Download Certificate">
                          <Download size={14} />
                        </button>
                        <button onClick={() => handleCopyLink(cert.certificate_id)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Copy Verification Link">
                          <Copy size={14} />
                        </button>
                        <a href={`/verify-certificate/${cert.certificate_id}`} target="_blank" rel="noreferrer" className="p-1 hover:bg-slate-100 rounded text-[#0D9488]" title="Verify Link">
                          <ExternalLink size={14} />
                        </a>
                        {cert.status !== "revoked" && (
                          <button onClick={() => handleRevokeCertificate(cert.certificate_id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded" title="Revoke Certificate">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteCertificate(cert.certificate_id)} className="p-1 hover:bg-red-50 text-red-600 rounded" title="Delete Certificate">
                          <Trash2 size={14} />
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

      {/* ═══ 4. UPLOAD CERTIFICATE TAB ═══ */}
      {tab === "upload" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Upload External / Legacy Certificate
            </h2>
            <p className="text-xs text-slate-500">Upload existing certificate documents (PDF or images) and connect to public verification.</p>
          </div>

          <form onSubmit={handleUploadCertificateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Select Student *</label>
              <select
                value={uploadStudentId}
                onChange={e => {
                  setUploadStudentId(e.target.value);
                  const s = students.find(x => x.id === e.target.value);
                  if (s && s.course?.title) setUploadTitle(s.course.title);
                }}
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
                placeholder="e.g. Graphic Designing & UI/UX Designing"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Certificate Type</label>
                <select
                  value={uploadCertType}
                  onChange={e => setUploadCertType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
                >
                  <option value="course_completion">Course Completion</option>
                  <option value="internship_completion">Internship Completion</option>
                  <option value="training_completion">Training Certificate</option>
                  <option value="achievement">Achievement Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Certificate ID</label>
                <input
                  type="text"
                  value={uploadCertId}
                  onChange={e => setUploadCertId(e.target.value.toUpperCase())}
                  placeholder="Auto-generated if blank"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:border-[#0D9488] bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Issue Date</label>
              <input
                type="date"
                value={uploadIssueDate}
                onChange={e => setUploadIssueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#0D9488] bg-transparent"
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
              {uploading ? "Uploading Document..." : "Save & Connect Uploaded Certificate"}
            </button>
          </form>
        </div>
      )}

      {/* ═══ 5. STUDENTS DIRECTORY TAB ═══ */}
      {tab === "students" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Students Academic Directory
              </h2>
              <p className="text-xs text-slate-500">Manage student profiles, attendance %, result marks, and issued certificates.</p>
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
                  <th className="py-3 px-4">Full Name & Email</th>
                  <th className="py-3 px-4">Course & Batch</th>
                  <th className="py-3 px-4">Attendance %</th>
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
                      <div className="text-[10px] text-slate-400">{stu.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{stu.course?.title || "No course"}</div>
                      <div className="text-[10px] text-slate-400">{stu.batch?.name || "No batch"}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{stu.attendance_pct || 0}%</td>
                    <td className="py-3 px-4"><StatusBadge status={stu.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenStudentProfile(stu)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold"
                        >
                          Profile & Certs
                        </button>
                        <button
                          onClick={() => { handleSelectStudentForGen(stu); setTab("generator"); }}
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

      {/* ═══ 6. COURSES & ELIGIBILITY TAB ═══ */}
      {tab === "courses" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Academy Courses & Requirements
              </h2>
              <p className="text-xs text-slate-500">Configured course list and eligibility parameters.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {courses.map(crs => (
              <div key={crs.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">{crs.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Slug: {crs.slug} • Duration: {crs.duration_weeks ? `${crs.duration_weeks} weeks` : "1 month"}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${crs.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {crs.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-[#0D9488] mb-1">Certificate Criteria</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Min Required Attendance:</span>
                    <span className="font-mono font-bold">{crs.min_attendance_pct || 75}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Min Required Score:</span>
                    <span className="font-mono font-bold">{crs.min_result_score || 60}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 7. BATCHES TAB ═══ */}
      {tab === "batches" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Batches Directory
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {batches.map(b => (
              <div key={b.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 space-y-2">
                <div className="font-bold text-sm">{b.name}</div>
                <div className="text-xs text-slate-500 font-mono">Code: {b.batch_code}</div>
                <div className="text-xs">Course: {b.course?.title || "N/A"}</div>
                <StatusBadge status={b.status || "ongoing"} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 8. ENROLLMENTS TAB ═══ */}
      {tab === "enrollments" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Recent Enrollments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Enrollment ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.map(enr => (
                  <tr key={enr.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{enr.enrollment_id}</td>
                    <td className="py-3 px-4 font-bold">{enr.full_name}</td>
                    <td className="py-3 px-4 capitalize">{enr.payment_status || "pending"}</td>
                    <td className="py-3 px-4"><StatusBadge status={enr.status || "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ 9. TEMPLATES TAB ═══ */}
      {tab === "templates" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-slate-100" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Certificate Template Engine
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(tmp => (
              <div key={tmp.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{tmp.name}</h3>
                    <p className="text-xs text-slate-500">{tmp.description}</p>
                  </div>
                  {tmp.is_default && <span className="px-2 py-0.5 bg-teal-100 text-[#0D9488] text-[10px] font-bold rounded">Default</span>}
                </div>
                <img src={tmp.bg_image_url || "/CourseresUIUXCertificate.png"} alt="Template" className="w-full h-36 object-contain rounded-xl border bg-white" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 10. SETTINGS TAB ═══ */}
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
              <label className="block font-semibold mb-1">Issuing Authority</label>
              <input
                type="text"
                value={settings.issuing_authority || "Prolx Digital Agency"}
                onChange={e => setSettings({ ...settings, issuing_authority: e.target.value })}
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
              {(["info", "certificates"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setStudentTab(t as any)}
                  className={`px-3 py-1.5 rounded-lg capitalize ${studentTab === t ? "bg-[#0D9488] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {t === "certificates" ? `Certificates (${studentCertsHistory.length})` : "General Info"}
                </button>
              ))}
            </div>

            {studentTab === "info" && (
              <div className="space-y-2 text-xs">
                <div>Phone: <strong>{selectedStudent.phone || selectedStudent.whatsapp || "N/A"}</strong></div>
                <div>Course: <strong>{selectedStudent.course?.title || "N/A"}</strong></div>
                <div>Batch: <strong>{selectedStudent.batch?.name || "N/A"}</strong></div>
                <div>City: <strong>{selectedStudent.city || "N/A"}</strong></div>
                <div>Attendance: <strong>{selectedStudent.attendance_pct || 0}%</strong></div>
                <div>Score: <strong>{selectedStudent.result_score || 0}%</strong></div>
              </div>
            )}

            {studentTab === "certificates" && (
              <div className="space-y-3 text-xs">
                {loadingStudentCerts ? (
                  <div className="text-center py-6 text-slate-400">Loading student certificates...</div>
                ) : studentCertsHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">No certificates generated or uploaded for this student yet.</div>
                ) : (
                  studentCertsHistory.map(cert => (
                    <div key={cert.id} className="p-4 bg-slate-50 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {cert.course_title}
                          {cert.is_uploaded && <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">Uploaded</span>}
                        </div>
                        <div className="font-mono text-xs text-[#0D9488] mt-0.5">{cert.certificate_id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Issued on: {formatCertDate(cert.issue_date)}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={cert.status} />
                        <button
                          onClick={() => handlePreviewPDF(cert)}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-[11px] hover:bg-slate-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(cert)}
                          className="px-2.5 py-1 bg-[#0D9488] text-white rounded-lg font-bold text-[11px] hover:bg-[#0F766E]"
                        >
                          Download
                        </button>
                        <a
                          href={`/verify-certificate/${cert.certificate_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-[#0D9488] hover:bg-teal-50 rounded"
                          title="Verify Link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  ))
                )}
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
              <h3 className="font-bold text-sm">Certificate Document Preview: {previewName}</h3>
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
