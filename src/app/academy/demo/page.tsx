"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Phone, Mail, BookOpen, Calendar, Clock, Monitor, MapPin, MessageSquare, CheckCircle, ChevronRight, Play } from "lucide-react";
import { bookDemoClass } from "@/app/academy-actions";

const COURSES = [
  "Full Stack Web Development", "UI/UX Design", "Digital Marketing", "Mobile App Dev",
  "AI & Machine Learning", "Graphic Design", "React & Next.js", "Python Programming",
  "SEO Optimization", "Cyber Security", "WordPress & Shopify", "Freelancing",
];
const TIMES = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"];

export default function DemoBookingPage() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", course_interest: "",
    preferred_date: "", preferred_time: "", mode: "online", questions: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await bookDemoClass(fd);
      if (res.success) setDone(true);
      else setError(res.error || "Booking failed. Please try again.");
    });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="bg-white border border-slate-100 rounded-3xl p-10 max-w-md w-full text-center shadow-xl"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Demo Class Booked! 🎉</h1>
          <p className="text-[#64748B] mb-6">Our academy team will call you within a few hours to confirm your free demo session details.</p>
          <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-4 mb-6 text-sm text-[#0D9488] font-medium">
            📞 We'll contact you at <strong>{form.phone}</strong> to confirm your demo slot.
          </div>
          <div className="flex gap-3">
            <Link href="/academy/courses" className="flex-1 py-3 border border-slate-200 text-[#475569] font-semibold rounded-xl hover:bg-slate-50 text-sm text-center">Browse Courses</Link>
            <Link href="/academy/enroll" className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm text-center">Enroll Now</Link>
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
            <span className="text-[#2DD4BF]">Book Free Demo</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/15 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-5 py-2.5 rounded-full mb-6">
            <Play size={16} /> Free — No Commitment Required
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Book a <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Free Demo Class</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Attend a free introductory session with one of our expert instructors. Ask questions, see our teaching style, and decide if we're the right fit for you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">

          {/* Info Cards */}
          <div className="space-y-5">
            {[
              { icon: Play, title: "What to Expect", desc: "A 45-minute live session covering course overview, curriculum highlights, and Q&A with the instructor.", color: "from-[#0D9488] to-[#0891B2]", bg: "bg-[#F0FDFA]" },
              { icon: Monitor, title: "Online or Physical", desc: "Attend online via Zoom or Google Meet, or visit our campus in Havelian, Abbottabad.", color: "from-[#7C3AED] to-[#A78BFA]", bg: "bg-[#F5F3FF]" },
              { icon: CheckCircle, title: "Completely Free", desc: "No registration fee, no payment required. Just fill the form and we'll schedule your demo.", color: "from-[#10B981] to-[#34D399]", bg: "bg-[#F0FDF4]" },
            ].map(card => (
              <div key={card.title} className={`${card.bg} rounded-2xl p-6`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{card.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-[#64748B] space-y-2">
              <p className="font-bold text-[#0F172A]">📍 Campus Address</p>
              <p>Havelian Main Bazar, Abbottabad, KPK, Pakistan</p>
              <p>📞 03300356046</p>
              <p>📧 academy@prolx.digital</p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Demo Class Booking Form</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: "Full Name *", key: "full_name", type: "text", placeholder: "Your full name", icon: User },
                  { label: "Phone Number *", key: "phone", type: "tel", placeholder: "03XXXXXXXXX", icon: Phone },
                  { label: "Email Address *", key: "email", type: "email", placeholder: "you@email.com", icon: Mail },
                ].map(({ label, key, type, placeholder, icon: Icon }) => (
                  <div key={key} className={key === "email" ? "md:col-span-2" : ""}>
                    <label className="text-xs font-semibold text-[#475569] block mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required={!label.includes("optional")} type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Course of Interest</label>
                  <div className="relative">
                    <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={form.course_interest} onChange={e => set("course_interest", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                      <option value="">Any course</option>
                      {COURSES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Preferred Date</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={form.preferred_date} onChange={e => set("preferred_date", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Preferred Time</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={form.preferred_time} onChange={e => set("preferred_time", e.target.value)} className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all appearance-none">
                      <option value="">Flexible</option>
                      {TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-2">Session Mode *</label>
                  <div className="flex gap-3">
                    {[{ val: "online", label: "🌐 Online", icon: Monitor }, { val: "physical", label: "📍 Campus", icon: MapPin }].map(m => (
                      <button type="button" key={m.val} onClick={() => set("mode", m.val)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${form.mode === m.val ? "bg-[#0D9488] text-white border-[#0D9488] shadow-sm" : "bg-[#F8FAFC] text-[#475569] border-slate-200 hover:border-[#0D9488]"}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Your Questions (optional)</label>
                  <div className="relative">
                    <MessageSquare size={15} className="absolute left-3 top-3 text-slate-400" />
                    <textarea rows={3} placeholder="What would you like to know in the demo class?" value={form.questions} onChange={e => set("questions", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

              <button type="submit" disabled={pending || !form.full_name || !form.phone || !form.email}
                className="mt-6 w-full py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 text-base"
              >
                {pending ? "Booking..." : <><Play size={18} /> Book My Free Demo Class</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
