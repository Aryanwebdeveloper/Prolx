"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronRight, MapPin, Clock, Briefcase, X, Loader2, Upload, FileText, ArrowRight, Users, Zap, User, Mail, Phone, Globe, DollarSign, Calendar, MessageSquare, ChevronDown, CheckCircle2 } from "lucide-react";
import { submitJobApplication, uploadResume, getApplicationFormSettings } from "@/app/careers-actions";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import PageHero from "@/components/page-hero";

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
    const baseInputClass = "w-full bg-[#F8FAFC] pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all text-[#0F172A] placeholder:text-[#94A3B8]";
    const iconClass = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]";

    switch (fieldKey) {
      case "name":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><User size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="text"
                value={appForm.name}
                onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                className={baseInputClass}
                placeholder="John Doe"
              />
            </div>
          </div>
        );
      case "email":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><Mail size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="email"
                value={appForm.email}
                onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                className={baseInputClass}
                placeholder="you@example.com"
              />
            </div>
          </div>
        );
      case "phone":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><Phone size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="tel"
                value={appForm.phone}
                onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                className={baseInputClass}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        );
      case "portfolio_url":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><Globe size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="url"
                value={appForm.portfolio}
                onChange={(e) => setAppForm({ ...appForm, portfolio: e.target.value })}
                className={baseInputClass}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        );
      case "resume":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
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
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed ${resumeFile ? 'border-[#0D9488] bg-[#F0FDFA]' : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#0D9488] hover:bg-[#F0FDFA]'} text-sm cursor-pointer transition-all`}
              >
                {resumeFile ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-[#0D9488]" />
                    </div>
                    <span className="text-[#0D9488] font-medium truncate flex-1">{resumeFile.name}</span>
                    <CheckCircle2 size={18} className="text-[#0D9488]" />
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Upload size={16} className="text-[#64748B] group-hover:text-[#0D9488] transition-colors" />
                    </div>
                    <span className="text-[#64748B] font-medium">Click to upload your resume (PDF, DOC)</span>
                  </>
                )}
              </label>
            </div>
          </div>
        );
      case "experience":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><Briefcase size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <select
                required={isRequired}
                value={appForm.experience}
                onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                className={`${baseInputClass} appearance-none`}
              >
                <option value="" disabled>Select experience...</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        );
      case "location":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><MapPin size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="text"
                value={appForm.location}
                onChange={(e) => setAppForm({ ...appForm, location: e.target.value })}
                className={baseInputClass}
                placeholder="City, Country"
              />
            </div>
          </div>
        );
      case "expected_salary":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><DollarSign size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <input
                required={isRequired}
                type="text"
                value={appForm.expected_salary}
                onChange={(e) => setAppForm({ ...appForm, expected_salary: e.target.value })}
                className={baseInputClass}
                placeholder="e.g. $70k - $90k"
              />
            </div>
          </div>
        );
      case "notice_period":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className={iconClass}><Calendar size={16} className="group-focus-within:text-[#0D9488] transition-colors" /></div>
              <select
                required={isRequired}
                value={appForm.notice_period}
                onChange={(e) => setAppForm({ ...appForm, notice_period: e.target.value })}
                className={`${baseInputClass} appearance-none`}
              >
                <option value="" disabled>Select notice period...</option>
                <option value="Immediate">Immediate</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3+ months">3+ months</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        );
      case "message":
        return (
          <div key={fieldKey} className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">{label}</label>
            <div className="relative group">
              <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-[#94A3B8]">
                <MessageSquare size={16} className="group-focus-within:text-[#0D9488] transition-colors" />
              </div>
              <textarea
                required={isRequired}
                rows={4}
                value={appForm.message}
                onChange={(e) => setAppForm({ ...appForm, message: e.target.value })}
                className="w-full bg-[#F8FAFC] pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all text-[#0F172A] placeholder:text-[#94A3B8] resize-none"
                placeholder="Tell us why you're a great fit..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      <PageHero
        breadcrumb="Careers"
        badge="We're Hiring"
        badgeIcon={<Users size={13} />}
        title={
          <>
            Build the Future{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">
              with Prolx
            </span>
          </>
        }
        subtitle="Join passionate builders, designers, and strategists working on impactful global projects. We believe in growth, ownership, and a culture of excellence."
      >
        {/* Culture image + perks */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mt-4">
          <div className="flex flex-wrap gap-3">
            {["Remote-Friendly", "Competitive Pay", "Growth Mentorship", "Flexible Hours"].map((b) => (
              <span key={b} className="flex items-center gap-1.5 px-4 py-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold rounded-full">
                <Zap size={12} /> {b}
              </span>
            ))}
          </div>
          <div className="relative h-52 hidden lg:block">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80"
                alt="Team Culture at Prolx"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </PageHero>

      {/* Positions */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488] font-mono mb-3 block">Join the Team</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Open Positions
            </h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">
              Join our team and help build the future of digital experiences. We&apos;re looking for passionate individuals who want to make an impact.
            </p>
          </ScrollReveal>

          {!jobs || jobs.length === 0 ? (
            <div className="text-center py-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="w-16 h-16 bg-[#CCFBF1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-[#0D9488]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Open Positions</h3>
              <p className="text-[#64748B] text-sm">We&apos;re not actively hiring right now, but feel free to check back later.</p>
            </div>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
              {jobs.map((job, i) => (
                <StaggerItem
                  key={job.id}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0D9488] hover:shadow-xl hover:shadow-teal-100 transition-all duration-300 overflow-hidden flex flex-col"
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
                </StaggerItem>
              ))}
            </StaggerContainer>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-all">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 sm:px-8 sm:py-6 border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-3xl">
              <div>
                <h3 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Apply for {jobs[applying].title}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">Please fill out the form below to submit your application.</p>
              </div>
              <button onClick={() => { setApplying(null); setAppSubmitted(false); }} className="w-10 h-10 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {appSubmitted ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#F0FDFA] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-[#0D9488]" />
                  </div>
                  <h4 className="font-bold text-[#0F172A] text-2xl mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Application Submitted!</h4>
                  <p className="text-[#64748B] max-w-md mx-auto">
                    Thanks for applying! We've received your application and will review it shortly. If your profile is a good match, we'll be in touch.
                  </p>
                  <button 
                    onClick={() => { setApplying(null); setAppSubmitted(false); }}
                    className="mt-8 px-8 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20"
                  >
                    Back to Careers
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex flex-col h-full">
                  {submitError && (
                    <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">⚠️</div>
                      <div>
                        <strong className="block mb-1 font-semibold">Submission Error</strong>
                        {submitError}
                      </div>
                    </div>
                  )}
                  {loadingSettings ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <Loader2 size={32} className="animate-spin text-[#0D9488]" />
                      <p className="text-[#64748B] text-sm font-medium">Loading application form...</p>
                    </div>
                  ) : formFields ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                      {Object.entries(formFields).map(([key, field]) => 
                        renderFormField(key as keyof FormFieldConfig, field)
                      )}
                    </div>
                  ) : null}
                  
                  <div className="mt-auto pt-6 border-t border-[#E2E8F0]">
                    <button
                      type="submit"
                      disabled={isSubmitting || uploadingResume || loadingSettings}
                      className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#94A3B8] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#0D9488]/20 hover:shadow-xl hover:shadow-[#0D9488]/30 disabled:shadow-none"
                    >
                      {isSubmitting || uploadingResume ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>{uploadingResume ? "Uploading your resume..." : "Submitting Application..."}</span>
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                    <p className="text-center text-xs text-[#94A3B8] mt-4">
                      By submitting this application, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </div>
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
