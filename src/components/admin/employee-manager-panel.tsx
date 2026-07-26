"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Filter, Plus, Mail, Phone, Briefcase, Calendar,
  DollarSign, FileText, ChevronRight, X, UserCheck, Trash2, Edit,
  Shield, MapPin, Award, BookOpen, Globe, Activity, Heart, Clock
} from "lucide-react";
import {
  getAllEmployees, upsertEmployeeProfile, getEmployeeDocuments,
  addEmployeeDocument, deleteEmployeeDocument, getSalaryHistory,
  addSalaryRecord, getPromotionHistory, addPromotionRecord,
  getDepartments, getDesignations
} from "@/app/employee-actions";
import { ImageUpload } from "../ui/image-upload";

type ExtendedProfile = {
  id: string;
  user_id: string;
  department_id?: string;
  designation_id?: string;
  employment_type: string;
  joining_date?: string;
  work_location: string;
  reporting_manager_id?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  base_salary?: number;
  salary_currency: string;
  national_id?: string;
  current_address?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  education?: any[];
  experience?: any[];
  certifications?: any[];
};

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  employee_profile?: ExtendedProfile | ExtendedProfile[];
};

export default function EmployeeManagerPanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection & Modal States
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empProfile, setEmpProfile] = useState<ExtendedProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Sub-tabs in employee detail
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "history" | "documents">("overview");

  // Document/Salary/Promotion sub-state
  const [documents, setDocuments] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Modifying triggers
  const [saving, setSaving] = useState(false);

  // Extended form fields state
  const [editForm, setEditForm] = useState<Partial<ExtendedProfile>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        getAllEmployees(),
        getDepartments(),
        getDesignations()
      ]);
      setEmployees((empRes.data as Employee[]) || []);
      setDepartments(deptRes.data || []);
      setDesignations(desigRes.data || []);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load employee secondary details when selecting one
  const handleSelectEmployee = async (emp: Employee) => {
    setSelectedEmp(emp);
    const rawProfile = emp.employee_profile;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
    setEmpProfile(profile || null);
    
    // Set edit form default state
    setEditForm(profile || {
      employment_type: "full-time",
      work_location: "office",
      salary_currency: "PKR"
    });

    setActiveSubTab("overview");
    setShowDetailModal(true);

    // Fetch related records
    try {
      const [docsRes, salRes, promRes] = await Promise.all([
        getEmployeeDocuments(emp.id),
        getSalaryHistory(emp.id),
        getPromotionHistory(emp.id)
      ]);
      setDocuments(docsRes.data || []);
      setSalaries(salRes.data || []);
      setPromotions(promRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSaving(true);
    try {
      await upsertEmployeeProfile(selectedEmp.id, editForm);
      setShowEditForm(false);
      await loadData();
      // Reload profile view
      const updated = employees.find(x => x.id === selectedEmp.id);
      if (updated) handleSelectEmployee(updated);
    } catch (err) {
      alert("Save failed: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Helper selectors
  const getDeptName = (id?: string) => departments.find(d => d.id === id)?.name || "Unassigned";
  const getDesigTitle = (id?: string) => designations.find(d => d.id === id)?.title || "Staff Member";

  // Filter list
  const filtered = employees.filter(emp => {
    const rawProfile = emp.employee_profile;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

    const matchSearch = !search ||
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || emp.role === roleFilter;
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchDept = deptFilter === "all" || profile?.department_id === deptFilter;

    return matchSearch && matchRole && matchStatus && matchDept;
  });

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Enterprise Employee Directory
          </h2>
          <p className="text-xs text-slate-500">
            Audit core and extended credentials, emergency logs, salary updates, and promotional histories for Prolx personnel.
          </p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search employee by name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:border-[#0D9488]"
          />
        </div>
        <div>
          <select
            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All System Roles</option>
            <option value="admin">Admin</option>
            <option value="hr_manager">HR Manager</option>
            <option value="project_manager">Project Manager</option>
            <option value="team_lead">Team Lead</option>
            <option value="staff">Staff</option>
            <option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent focus:outline-none focus:border-[#0D9488]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">Loading directory...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Users size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No employees found matching filter settings.</p>
          </div>
        ) : (
          filtered.map(emp => {
            const rawP = emp.employee_profile;
            const profile = Array.isArray(rawP) ? rawP[0] : rawP;
            return (
              <div
                key={emp.id}
                onClick={() => handleSelectEmployee(emp)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0D9488]/10 text-[#0D9488] font-bold text-lg flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                      {emp.avatar_url ? (
                        <img src={emp.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        emp.full_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
                        {emp.full_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 capitalize">{emp.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] border-t pt-3 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Briefcase size={12} className="text-slate-400" />
                      <span>{getDesigTitle(profile?.designation_id)} · {getDeptName(profile?.department_id)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px]">
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-bold capitalize ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {emp.status}
                  </span>
                  <span className="text-[#0D9488] font-semibold flex items-center gap-0.5 hover:underline">
                    View Profile <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile Detail Modal */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#0D9488] text-white font-bold text-xl flex items-center justify-center">
                  {selectedEmp.avatar_url ? (
                    <img src={selectedEmp.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    selectedEmp.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    {selectedEmp.full_name}
                  </h3>
                  <p className="text-xs text-slate-400 capitalize">{selectedEmp.role} · {getDesigTitle(empProfile?.designation_id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg"
                >
                  <Edit size={12} /> Edit Profile Info
                </button>
                <button onClick={() => { setShowDetailModal(false); setSelectedEmp(null); }} className="p-1 hover:bg-slate-200 rounded">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b px-5 py-2 bg-white text-xs font-semibold text-slate-500 gap-4 shrink-0">
              <button
                onClick={() => setActiveSubTab("overview")}
                className={`py-1.5 border-b-2 ${activeSubTab === "overview" ? "border-[#0D9488] text-[#0D9488]" : "border-transparent"}`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveSubTab("history")}
                className={`py-1.5 border-b-2 ${activeSubTab === "history" ? "border-[#0D9488] text-[#0D9488]" : "border-transparent"}`}
              >
                Promotional & Salary History
              </button>
              <button
                onClick={() => setActiveSubTab("documents")}
                className={`py-1.5 border-b-2 ${activeSubTab === "documents" ? "border-[#0D9488] text-[#0D9488]" : "border-transparent"}`}
              >
                Corporate Documents ({documents.length})
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {activeSubTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Left Column: Basic Bio Data */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="bg-white p-5 rounded-xl border space-y-4">
                      <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                        <UserCheck size={14} className="text-[#0D9488]" /> Employee Basic Info
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-slate-400">Joining Date</span>
                          <span className="font-medium text-slate-700">{empProfile?.joining_date ? new Date(empProfile.joining_date).toLocaleDateString() : "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Employment Type</span>
                          <span className="font-medium text-slate-700 capitalize">{empProfile?.employment_type || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Location Settings</span>
                          <span className="font-medium text-slate-700 capitalize">{empProfile?.work_location || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Department</span>
                          <span className="font-medium text-slate-700">{getDeptName(empProfile?.department_id)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border space-y-4">
                      <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                        <Heart size={14} className="text-[#0D9488]" /> Emergency Contact
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-slate-400">Contact Person</span>
                          <span className="font-medium text-slate-700">{empProfile?.emergency_contact_name || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Relationship</span>
                          <span className="font-medium text-slate-700">{empProfile?.emergency_contact_relation || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Phone Number</span>
                          <span className="font-medium text-slate-700">{empProfile?.emergency_contact_phone || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Email Address</span>
                          <span className="font-medium text-slate-700">{empProfile?.emergency_contact_email || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dynamic metadata fields */}
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border space-y-3">
                      <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                        <DollarSign size={14} className="text-[#0D9488]" /> Current Payroll Info
                      </h5>
                      <div>
                        <span className="block text-slate-400">Base Salary</span>
                        <span className="font-mono font-bold text-base text-slate-800">
                          {empProfile?.base_salary ? `${empProfile.base_salary.toLocaleString()} ${empProfile.salary_currency || "PKR"}` : "Unconfigured"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border space-y-3">
                      <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                        <Globe size={14} className="text-[#0D9488]" /> Social & Links
                      </h5>
                      <div className="space-y-2 font-medium">
                        {empProfile?.linkedin_url && (
                          <a href={empProfile.linkedin_url} target="_blank" className="flex items-center gap-2 text-[#0D9488] hover:underline">
                            LinkedIn Portfolio
                          </a>
                        )}
                        {empProfile?.github_url && (
                          <a href={empProfile.github_url} target="_blank" className="flex items-center gap-2 text-[#0D9488] hover:underline">
                            GitHub Code repository
                          </a>
                        )}
                        {empProfile?.resume_url && (
                          <a href={empProfile.resume_url} target="_blank" className="flex items-center gap-2 text-rose-600 hover:underline">
                            Corporate Resume / CV
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === "history" && (
                <div className="space-y-6 text-xs">
                  {/* Salary adjustments */}
                  <div className="bg-white p-5 rounded-xl border space-y-4">
                    <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                      <DollarSign size={14} className="text-emerald-600" /> Salary History Logs
                    </h5>
                    {salaries.length === 0 ? (
                      <p className="text-slate-400 italic">No incremental history logged.</p>
                    ) : (
                      <div className="divide-y space-y-2">
                        {salaries.map(sal => (
                          <div key={sal.id} className="pt-2 first:pt-0 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-700">{sal.base_salary?.toLocaleString()} {sal.currency}</div>
                              <div className="text-[10px] text-slate-400">Effective: {new Date(sal.effective_date).toLocaleDateString()} · Reason: {sal.increment_reason || "General"}</div>
                            </div>
                            <div className="text-emerald-600 font-bold font-mono">+{sal.increment_percentage || 0}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Promotion log */}
                  <div className="bg-white p-5 rounded-xl border space-y-4">
                    <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                      <Award size={14} className="text-indigo-600" /> Promotion & Transfers Log
                    </h5>
                    {promotions.length === 0 ? (
                      <p className="text-slate-400 italic">No promotional events recorded.</p>
                    ) : (
                      <div className="divide-y space-y-2">
                        {promotions.map(prom => (
                          <div key={prom.id} className="pt-2 first:pt-0">
                            <div className="font-semibold text-slate-700">Promoted to: {prom.to_designation || "Staff"}</div>
                            <div className="text-[10px] text-slate-400">Effective: {new Date(prom.effective_date).toLocaleDateString()} · Transfer context: {prom.reason || "Performance improvement"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === "documents" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white p-5 rounded-xl border space-y-4">
                    <h5 className="font-bold border-b pb-2 flex items-center gap-1.5 text-slate-800">
                      <FileText size={14} className="text-[#0D9488]" /> Uploaded Employee Documents
                    </h5>
                    {documents.length === 0 ? (
                      <p className="text-slate-400 italic">No files on catalog.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map(doc => (
                          <div key={doc.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <div className="font-semibold text-slate-700 truncate">{doc.title}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{doc.category} · Uploader: {doc.uploader?.full_name || "Admin"}</div>
                            </div>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-200 text-[#0D9488] rounded shrink-0">
                              <ChevronRight size={16} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal Overlay */}
      {showEditForm && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="font-bold text-sm">Configure Extended Profile</h3>
              <button onClick={() => setShowEditForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={editForm.department_id || ""}
                    onChange={e => setEditForm(f => ({ ...f, department_id: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="">-- Unassigned --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Designation</label>
                  <select
                    value={editForm.designation_id || ""}
                    onChange={e => setEditForm(f => ({ ...f, designation_id: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="">-- Choose Designation --</option>
                    {designations.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Employment Type</label>
                  <select
                    value={editForm.employment_type}
                    onChange={e => setEditForm(f => ({ ...f, employment_type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Work Location</label>
                  <select
                    value={editForm.work_location}
                    onChange={e => setEditForm(f => ({ ...f, work_location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0D9488] bg-transparent"
                  >
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone || ""}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>

              {/* Emergency logs */}
              <div className="border-t pt-3 space-y-3">
                <h5 className="font-bold text-slate-800">Emergency Contacts Details</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editForm.emergency_contact_name || ""}
                      onChange={e => setEditForm(f => ({ ...f, emergency_contact_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Relationship</label>
                    <input
                      type="text"
                      value={editForm.emergency_contact_relation || ""}
                      onChange={e => setEditForm(f => ({ ...f, emergency_contact_relation: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.emergency_contact_phone || ""}
                      onChange={e => setEditForm(f => ({ ...f, emergency_contact_phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.emergency_contact_email || ""}
                      onChange={e => setEditForm(f => ({ ...f, emergency_contact_email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowEditForm(false)} className="px-4 py-2 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
