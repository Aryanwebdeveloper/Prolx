"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, BookOpen, Calendar,
  Monitor, Banknote, CheckCircle, ArrowRight, ArrowLeft, ChevronRight,
  GiftIcon, MessageSquare, Award, Sparkles
} from "lucide-react";
import { createEnrollment } from "@/app/academy-actions";

const COURSES = [
  "Full Stack Web Development",
  "UI/UX Design Masterclass",
  "Digital Marketing Pro",
  "Mobile App Dev — Flutter",
  "AI & Machine Learning",
  "Graphic Design with Adobe Suite",
  "React & Next.js Development",
  "Complete SEO Optimization",
  "Python Programming Bootcamp",
  "Cyber Security Fundamentals",
  "WordPress & Shopify Dev",
  "Freelancing & Business Growth",
];

const CITIES = ["Abbottabad", "Havelian", "Mansehra", "Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Other"];
const EDUCATION = ["Matric", "Intermediate (FSc/FA)", "Bachelor's", "Master's", "PhD", "Other"];
const PROFESSIONS = ["Student", "Employed (Private)", "Employed (Government)", "Freelancer", "Business Owner", "Job Seeker", "Other"];
const MODES = ["Online Live Classes", "Physical Campus", "Hybrid (Online + Physical)", "Self-Paced Recorded"];
const PAYMENT = ["Cash at Campus", "Bank Transfer (On Confirmation)"];

const steps = [
  { label: "Personal Info", icon: User },
  { label: "Course Selection", icon: BookOpen },
  { label: "Confirmation", icon: CheckCircle },
];

function EnrollContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<{ enrollment_id: string; student_id: string } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    education: "",
    current_profession: "",
    course: searchParams.get("course") || "",
    batch_code: searchParams.get("batch") || "",
    learning_mode: "Online Live Classes",
    payment_method: "Cash at Campus",
    referral_code: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const step1Valid = form.full_name && form.email && form.phone && form.city && form.education;
  const step2Valid = form.course && form.learning_mode && form.payment_method;

  const handleSubmit = () => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (form.course) {
        const slug = form.course.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        fd.append("course_slug", slug);
      }
      const res = await createEnrollment(fd);
      if (res.success) {
        setSubmitted({ enrollment_id: res.enrollment_id!, student_id: res.student_id! });
      } else {
        setError(res.error || "Enrollment failed. Please try again or contact us.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="bg-white border border-slate-100 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl shadow-slate-100"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Enrollment Submitted! 🎉
          </h1>
          <p className="text-[#64748B] mb-8">Your enrollment request has been received. Our team will confirm within 24 hours.</p>

          <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-6 mb-6 text-left space-y-3">
            <div>
              <p className="text-xs text-[#64748B] font-medium">Student ID</p>
              <p className="text-xl font-black text-[#0D9488] font-mono">{submitted.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Enrollment ID</p>
              <p className="text-xl font-black text-[#7C3AED] font-mono">{submitted.enrollment_id}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Course Selected</p>
              <p className="font-semibold text-[#0F172A]">{form.course}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-sm text-amber-800">
            <strong>💳 Payment:</strong> Please visit our campus or contact us at <strong>03300356046</strong> to confirm your seat with payment. Installment options available.
          </div>

          <div className="flex gap-3">
            <Link href="/academy/courses" className="flex-1 py-3 border border-slate-200 text-[#475569] font-semibold rounded-xl hover:bg-slate-50 text-sm text-center">Browse More Courses</Link>
            <Link href="/academy" className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 text-sm text-center">Back to Academy</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="bg-[#060D18] pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">Enroll Now</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Start Your <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Enrollment</span>
          </h1>
          <p className="text-slate-400 text-lg">Complete the form below and our team will confirm your seat within 24 hours.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-slate-200 z-0" />
          {steps.map((s, i) => (
            <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${i < step ? "bg-[#0D9488] border-[#0D9488]" : i === step ? "bg-white border-[#0D9488] shadow-lg shadow-teal-500/20" : "bg-white border-slate-200"}`}>
                {i < step ? <CheckCircle size={18} className="text-white" /> : <s.icon size={16} className={i === step ? "text-[#0D9488]" : "text-slate-400"} />}
              </div>
              <span className={`text-xs font-semibold ${i === step ? "text-[#0D9488]" : "text-slate-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    { label: "Full Name *", key: "full_name", type: "text", placeholder: "Your full name", icon: User },
                    { label: "Email Address *", key: "email", type: "email", placeholder: "you@email.com", icon: Mail },
                    { label: "Phone Number *", key: "phone", type: "tel", placeholder: "03XXXXXXXXX", icon: Phone },
                    { label: "WhatsApp Number", key: "whatsapp", type: "tel", placeholder: "03XXXXXXXXX (optional)", icon: Phone },
                  ].map(({ label, key, type, placeholder, icon: Icon }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-[#475569] block mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">City *</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.city} onChange={e => set("city", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">Education *</label>
                    <div className="relative">
                      <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.education} onChange={e => set("education", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                        <option value="">Select education</option>
                        {EDUCATION.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">Current Status</label>
                    <div className="relative">
                      <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.current_profession} onChange={e => set("current_profession", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                        <option value="">Select status</option>
                        {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => step1Valid && setStep(1)}
                  disabled={!step1Valid}
                  className="w-full py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Course Selection <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Course Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Course & Preferences</h2>
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Select Course *</label>
                  <div className="relative">
                    <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={form.course} onChange={e => set("course", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                      <option value="">Choose a course</option>
                      {COURSES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Batch Code (optional)</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="e.g. FSWD-JUL-01 (leave blank if unsure)" value={form.batch_code} onChange={e => set("batch_code", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">Learning Mode *</label>
                    <div className="relative">
                      <Monitor size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.learning_mode} onChange={e => set("learning_mode", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                        {MODES.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">Payment Method *</label>
                    <div className="relative">
                      <Banknote size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={form.payment_method} onChange={e => set("payment_method", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                        {PAYMENT.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Referral Code (optional)</label>
                  <div className="relative">
                    <GiftIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Enter referral code for discount" value={form.referral_code} onChange={e => set("referral_code", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Additional Notes</label>
                  <div className="relative">
                    <MessageSquare size={15} className="absolute left-3 top-3 text-slate-400" />
                    <textarea rows={3} placeholder="Any questions, special requirements, or notes for the academy team..." value={form.notes} onChange={e => set("notes", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="px-6 py-4 border border-slate-200 text-[#475569] font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => step2Valid && setStep(2)}
                    disabled={!step2Valid}
                    className="flex-1 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Review & Confirm <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Review & Confirm</h2>
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
                  {[
                    ["Name", form.full_name],
                    ["Email", form.email],
                    ["Phone", form.phone],
                    ["City", form.city],
                    ["Education", form.education],
                    ["Course", form.course],
                    ["Learning Mode", form.learning_mode],
                    ["Payment Method", form.payment_method],
                  ].map(([k, v]) => v && (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[#64748B] font-medium">{k}</span>
                      <span className="font-semibold text-[#0F172A]">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <strong>💳 Payment Reminder:</strong> Please contact us at <strong>03300356046</strong> or visit our campus at Havelian Main Bazar, Abbottabad to confirm your seat with payment. Cash & bank transfer accepted. Installments available.
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-4 border border-slate-200 text-[#475569] font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                    <ArrowLeft size={16} /> Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={pending}
                    className="flex-1 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {pending ? (
                      <>Submitting...</>
                    ) : (
                      <><Sparkles size={18} /> Submit Enrollment</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D9488] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-semibold">Loading enrollment form...</p>
        </div>
      </div>
    }>
      <EnrollContent />
    </Suspense>
  );
}
