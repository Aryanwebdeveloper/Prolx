"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronRight, MapPin, Clock, Briefcase, X, Loader2, Upload, FileText } from "lucide-react";
import { submitJobApplication, uploadResume, getApplicationFormSettings } from "@/app/careers-actions";

// Form field configuration type (defined here to avoid "use server" export issues)
type FormFieldConfig = {
  name: { enabled: boolean; required: boolean; label: string };
  email: { enabled: boolean; required: boolean; label: string };
  phone: { enabled: boolean; required: boolean; label: string };
  portfolio_url: { enabled: boolean; required: boolean; label: string };
  resume: { enabled: boolean; required: boolean; label: string };
  experience: { enabled: boolean; required: boolean; label: string };
  location: { enabled: boolean; required: boolean; label: string };
  expected_salary: { enabled: boolean; required: boolean; label: string };
  notice_period: { enabled: boolean; required: boolean; label: string };
  message: { enabled: boolean; required: boolean; label: string };
};

const defaultFormData = {
  name: "",
  email: "",
  phone: "",
  portfolio: "",
  message: "",
  experience: "",
  location: "",
  expected_salary: "",
  notice_period: "",
};

export default function CareersClient({ jobs }: { jobs: any[] }) {
  const [openJob, setOpenJob] = useState<number | null>(null);
  const [applying, setApplying] = useState<number | null>(null);
  const [appForm, setAppForm] = useState(defaultFormData);
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormFieldConfig | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    loadFormSettings();
  }, []);

  const loadFormSettings = async () => {
    const { data } = await getApplicationFormSettings();
    setFormFields(data);
    setLoadingSettings(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (applying === null || applying >= jobs.length) return;

    const job = jobs[applying];
    let resumeUrl = "";

    // Upload resume if provided and enabled
    if (resumeFile && formFields?.resume?.enabled) {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("file", resumeFile);
      const { data: uploadData, error: uploadError } = await uploadResume(formData);
      setUploadingResume(false);

      if (uploadError) {
        setIsSubmitting(false);
        setSubmitError(uploadError);
        return;
      }
      resumeUrl = uploadData?.url || "";
    }

    const { data, error } = await submitJobApplication({
      job_id: job.id,
      name: appForm.name,
      email: appForm.email,
      phone: appForm.phone || undefined,
      portfolio_url: appForm.portfolio || undefined,
      message: appForm.message || undefined,
      resume_url: resumeUrl || undefined,
      experience: appForm.experience || undefined,
      location: appForm.location || undefined,
      expected_salary: appForm.expected_salary || undefined,
      notice_period: appForm.notice_period || undefined,
    });

    setIsSubmitting(false);

    if (error) {
      const errorMsg = typeof error === 'string' ? error : error?.message || "Failed to submit application. Please try again.";
      setSubmitError(errorMsg);
      console.error("Application submission error:", error);
    } else {
      setAppSubmitted(true);
      setAppForm(defaultFormData);
      setResumeFile(null);
    }
  };

  const renderFormField = (fieldKey: keyof FormFieldConfig, field: { enabled: boolean; required: boolean; label: string }) => {
    if (!field.enabled) return null;

    const isRequired = field.required;
    const label = field.label + (isRequired ? " *" : "");

    switch (fieldKey) {
      case "name":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="text"
              value={appForm.name}
              onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="Your full name"
            />
          </div>
        );
      case "email":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="email"
              value={appForm.email}
              onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="your@email.com"
            />
          </div>
        );
      case "phone":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="tel"
              value={appForm.phone}
              onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="+1 234 567 8900"
            />
          </div>
        );
      case "portfolio_url":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="url"
              value={appForm.portfolio}
              onChange={(e) => setAppForm({ ...appForm, portfolio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="https://"
            />
          </div>
        );
      case "resume":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
                required={isRequired && !resumeFile}
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm cursor-pointer hover:border-[#0D9488] transition-colors"
              >
                {resumeFile ? (
                  <>
                    <FileText size={18} className="text-[#0D9488]" />
                    <span className="text-[#0F172A] truncate">{resumeFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-[#64748B]" />
                    <span className="text-[#64748B]">Upload PDF or DOC (max 5MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>
        );
      case "experience":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <select
              required={isRequired}
              value={appForm.experience}
              onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] text-[#64748B]"
            >
              <option value="">Select experience...</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
        );
      case "location":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="text"
              value={appForm.location}
              onChange={(e) => setAppForm({ ...appForm, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="City, Country"
            />
          </div>
        );
      case "expected_salary":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <input
              required={isRequired}
              type="text"
              value={appForm.expected_salary}
              onChange={(e) => setAppForm({ ...appForm, expected_salary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>
        );
      case "notice_period":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <select
              required={isRequired}
              value={appForm.notice_period}
              onChange={(e) => setAppForm({ ...appForm, notice_period: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] text-[#64748B]"
            >
              <option value="">Select notice period...</option>
              <option value="Immediate">Immediate</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="2 months">2 months</option>
              <option value="3+ months">3+ months</option>
            </select>
          </div>
        );
      case "message":
        return (
          <div key={fieldKey}>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
            <textarea
              required={isRequired}
              rows={3}
              value={appForm.message}
              onChange={(e) => setAppForm({ ...appForm, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
              placeholder="Tell us about yourself…"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Careers</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Build the Future with{" "}
                <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
                  Prolx
                </em>
              </h1>
              <p className="text-[#64748B] text-lg mb-8">
                Join a team of passionate builders, designers, and marketers working on impactful projects
                for clients across the globe. We believe in growth, ownership, and a culture of excellence.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Remote-Friendly", "Competitive Pay", "Growth Mentorship", "Flexible Hours"].map((b) => (
                  <span key={b} className="px-4 py-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold rounded-full">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative h-72 hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80"
                alt="Team Culture"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Positions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Open Positions
            </h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">
              Join our team and help build the future of digital experiences. We&apos;re looking for passionate individuals who want to make an impact.
            </p>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div className="text-center py-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="w-16 h-16 bg-[#CCFBF1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-[#0D9488]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Open Positions</h3>
              <p className="text-[#64748B] text-sm">We&apos;re not actively hiring right now, but feel free to check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, i) => (
                <div
                  key={job.id}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0D9488] hover:shadow-xl hover:shadow-[#0D9488]/10 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold rounded-full uppercase tracking-wider">
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Clock size={12} /> {job.type}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#0F172A] text-xl mb-2 group-hover:text-[#0D9488] transition-colors" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
                      <MapPin size={14} className="text-[#0D9488]" />
                      {job.location}
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-4">
                      <h4 className="font-semibold text-[#0F172A] text-sm mb-2">Requirements</h4>
                      <ul className="space-y-1.5">
                        {(Array.isArray(job.requirements) ? job.requirements.slice(0, 3) : []).map((r: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#64748B]">
                            <span className="text-[#0D9488] mt-0.5 shrink-0">✓</span>
                            <span className="line-clamp-1">{r}</span>
                          </li>
                        ))}
                        {Array.isArray(job.requirements) && job.requirements.length > 3 && (
                          <li className="text-xs text-[#0D9488] font-medium">
                            +{job.requirements.length - 3} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setOpenJob(i)}
                        className="flex-1 px-4 py-2.5 border border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] text-[#0F172A] hover:text-[#0D9488] font-medium rounded-xl text-sm transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setApplying(i)}
                        className="flex-1 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#0D9488]/20 hover:shadow-xl hover:shadow-[#0D9488]/30"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Job Detail Modal */}
      {openJob !== null && openJob < jobs.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <div>
                <span className="px-3 py-1 bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold rounded-full uppercase tracking-wider">
                  {jobs[openJob].department}
                </span>
                <h3 className="font-bold text-[#0F172A] text-xl mt-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {jobs[openJob].title}
                </h3>
              </div>
              <button onClick={() => setOpenJob(null)} className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#0F172A] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-[#64748B]">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#0D9488]" /> {jobs[openJob].location}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-[#0D9488]" /> {jobs[openJob].type}
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase size={16} className="text-[#0D9488]" /> {jobs[openJob].department}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-[#0F172A] text-sm mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {(Array.isArray(jobs[openJob].requirements) ? jobs[openJob].requirements : []).map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-[#64748B]">
                      <span className="w-5 h-5 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {jobs[openJob].description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-[#0F172A] text-sm mb-3">About the Role</h4>
                  <p className="text-sm text-[#64748B] leading-relaxed">{jobs[openJob].description}</p>
                </div>
              )}

              <button
                onClick={() => { setOpenJob(null); setApplying(openJob); }}
                className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20"
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {applying !== null && applying < jobs.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Apply: {jobs[applying].title}
              </h3>
              <button onClick={() => { setApplying(null); setAppSubmitted(false); }} className="text-[#64748B] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {appSubmitted ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🎉</div>
                  <h4 className="font-bold text-[#0F172A] text-lg mb-2">Application Submitted!</h4>
                  <p className="text-sm text-[#64748B]">
                    Thanks for applying! We&apos;ll review your application and reach out within 5–7 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm break-words">
                      <strong className="block mb-1">Error:</strong>
                      {submitError}
                    </div>
                  )}
                  {loadingSettings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-[#0D9488]" />
                    </div>
                  ) : formFields ? (
                    <>
                      {Object.entries(formFields).map(([key, field]) => 
                        renderFormField(key as keyof FormFieldConfig, field)
                      )}
                    </>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingResume || loadingSettings}
                    className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#94A3B8] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting || uploadingResume ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {uploadingResume ? "Uploading resume..." : "Submitting..."}
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <ProlxFooter />
    </div>
  );
}
