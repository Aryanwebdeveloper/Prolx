"use client";

import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, Mail, ExternalLink, RefreshCw, Loader2, Search } from "lucide-react";
import { getJobApplications, updateApplicationStatus, getCareerJobs } from "@/app/careers-actions";

export default function CareersApplicationsPanel() {
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [filterJob, setFilterJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [{ data: apps }, { data: jobList }] = await Promise.all([
      getJobApplications(filterJob || undefined, filterStatus || undefined),
      getCareerJobs(),
    ]);
    setApplications(apps || []);
    setJobs(jobList || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await updateApplicationStatus(id, status);
    if (!error) {
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    }
    setUpdatingId(null);
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Reviewed: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Job Applications
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Review and manage applications from candidates.
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[#64748B]" />
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]"
            >
              <option value="">All Positions</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={loadData}
            className="px-4 py-2 text-sm text-[#0D9488] hover:bg-[#F0FDFA] rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: applications.length, color: "bg-[#0D9488]" },
          { label: "Pending", count: applications.filter(a => a.status === "Pending").length, color: "bg-amber-500" },
          { label: "Shortlisted", count: applications.filter(a => a.status === "Shortlisted").length, color: "bg-green-500" },
          { label: "Rejected", count: applications.filter(a => a.status === "Rejected").length, color: "bg-red-500" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className={`w-2 h-2 rounded-full ${color} mb-2`} />
            <p className="text-2xl font-bold text-[#0F172A]">{count}</p>
            <p className="text-sm text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-[#0D9488] mb-4" />
            <p className="text-[#64748B]">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#64748B]">No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Applicant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Applied</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#0F172A]">{app.name}</p>
                      <p className="text-xs text-[#64748B]">{app.email}</p>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {app.career_jobs?.title || "Unknown Position"}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || "bg-gray-100 text-gray-700"}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#0D9488] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {app.status !== "Shortlisted" && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, "Shortlisted")}
                            disabled={updatingId === app.id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Shortlist"
                          >
                            {updatingId === app.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          </button>
                        )}
                        {app.status !== "Rejected" && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, "Rejected")}
                            disabled={updatingId === app.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Reject"
                          >
                            {updatingId === app.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Application Details
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-[#64748B] hover:text-[#0F172A]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Applicant</p>
                <p className="font-medium text-[#0F172A]">{selectedApp.name}</p>
                <p className="text-sm text-[#64748B]">{selectedApp.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Position Applied For</p>
                <p className="font-medium text-[#0F172A]">{selectedApp.career_jobs?.title || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Applied On</p>
                <p className="text-sm text-[#0F172A]">{new Date(selectedApp.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Current Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedApp.status] || "bg-gray-100 text-gray-700"}`}>
                  {selectedApp.status}
                </span>
              </div>
              {selectedApp.phone && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-sm text-[#0F172A]">{selectedApp.phone}</p>
                </div>
              )}
              {selectedApp.experience && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-sm text-[#0F172A]">{selectedApp.experience}</p>
                </div>
              )}
              {selectedApp.location && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm text-[#0F172A]">{selectedApp.location}</p>
                </div>
              )}
              {selectedApp.expected_salary && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Expected Salary</p>
                  <p className="text-sm text-[#0F172A]">{selectedApp.expected_salary}</p>
                </div>
              )}
              {selectedApp.notice_period && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Notice Period</p>
                  <p className="text-sm text-[#0F172A]">{selectedApp.notice_period}</p>
                </div>
              )}
              {selectedApp.portfolio_url && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Portfolio / LinkedIn</p>
                  <a
                    href={selectedApp.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    {selectedApp.portfolio_url}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {selectedApp.resume_url && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Resume</p>
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    View Resume
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {selectedApp.message && (
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Message</p>
                  <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{selectedApp.message}</p>
                </div>
              )}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["Pending", "Reviewed", "Shortlisted", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusUpdate(selectedApp.id, status);
                        setSelectedApp({ ...selectedApp, status });
                      }}
                      disabled={updatingId === selectedApp.id || selectedApp.status === status}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedApp.status === status
                          ? "bg-[#0D9488] text-white"
                          : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={`mailto:${selectedApp.email}?subject=Re: Your Application for ${selectedApp.career_jobs?.title}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-all"
                >
                  <Mail size={16} />
                  Email Applicant
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
