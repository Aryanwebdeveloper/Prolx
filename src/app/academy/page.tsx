"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, BookOpen, Users, Award, Briefcase, Star, Play, CheckCircle,
  Clock, Monitor, MapPin, GraduationCap, TrendingUp, Zap, Code2, Palette,
  Smartphone, Brain, Shield, Globe, ChevronDown, ChevronUp, ExternalLink,
  Calendar, Trophy, Heart, Rocket, Target, RefreshCw
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getAcademyCategories, getAcademyCourses, getUpcomingBatches } from "@/app/academy-actions";
import { getMarketingStats } from "@/lib/marketing-stats";

// ── Animated Counter ────────────────────────────────────────────────────
function AnimatedCounter({ end, label, suffix = "", icon: Icon, color }: {
  end: number; label: string; suffix?: string; icon: any; color: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    if (end <= 0) { setCount(0); return; }
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="text-4xl font-extrabold text-white mb-1 font-mono">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </motion.div>
  );
}

// ── FAQ Data ────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What payment methods do you accept?", a: "We accept cash payments at our campus and direct bank transfers. Flexible installment plans are also available." },
  { q: "Do you provide certificates after course completion?", a: "Yes! Every student receives an official verifiable digital certificate with a unique QR code upon completing the course." },
  { q: "Are classes available online and physically?", a: "We offer three learning modes: Online Live Classes via Zoom/Google Meet, Physical Campus in Havelian, Abbottabad, and Hybrid." },
  { q: "Can I join mid-batch if I miss the start date?", a: "In most cases yes, subject to available seats and instructor approval. Contact our Academy team to guide you." },
  { q: "Is there an internship opportunity after the course?", a: "Top-performing students who complete their courses are offered internship opportunities at Prolx Digital Agency and partner companies." },
  { q: "Do I need any prior experience to enroll?", a: "Most beginner courses require no prior experience. Prerequisites are clearly listed on each course detail page." },
];

const PROCESS = [
  { step: "01", icon: BookOpen, title: "Choose Your Course", desc: "Browse expert-led courses across tech, design, marketing & business." },
  { step: "02", icon: Calendar, title: "Pick a Batch", desc: "Select an upcoming batch that fits your schedule." },
  { step: "03", icon: Users, title: "Enroll & Learn", desc: "Attend live classes, work on real projects, and get trainer feedback." },
  { step: "04", icon: Trophy, title: "Get Certified", desc: "Complete the course, receive your verified certificate, and access job placement." },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border border-slate-200 rounded-2xl overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-[#0F172A] text-sm md:text-base pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#0D9488] shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="px-6 pb-5 text-[#64748B] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AcademyPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Marketing stats — used ONLY on frontend for social proof
  const mkt = getMarketingStats();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, crs, bts] = await Promise.all([
        getAcademyCategories(),
        getAcademyCourses(),
        getUpcomingBatches(),
      ]);
      setCategories(cats);
      setCourses(crs);
      setBatches(bts);
      setLoading(false);
    }
    loadData();
  }, []);

  // Compute live trainer profiles from DB courses
  const trainerMap: Record<string, { name: string; coursesCount: number; studentCount: number }> = {};
  courses.forEach(c => {
    if (c.instructor_name) {
      if (!trainerMap[c.instructor_name]) {
        trainerMap[c.instructor_name] = { name: c.instructor_name, coursesCount: 0, studentCount: 0 };
      }
      trainerMap[c.instructor_name].coursesCount += 1;
      trainerMap[c.instructor_name].studentCount += Number(c.student_count) || 0;
    }
  });

  const trainersList = Object.values(trainerMap);
  const totalStudents = courses.reduce((acc, c) => acc + (Number(c.student_count) || 0), 0);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#060D18]">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-[#0D9488]/12 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />

        <div className="container mx-auto px-4 pt-28 pb-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#0D9488]/15 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-5 py-2.5 rounded-full mb-8">
              <GraduationCap size={16} />
              Prolx Academy — Official Training Institute
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Learn Today's Most{" "}
              <span className="bg-gradient-to-r from-[#2DD4BF] via-[#0D9488] to-[#7C3AED] bg-clip-text text-transparent">
                In-Demand
              </span>{" "}
              Digital Skills
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Gain practical industry experience through expert-led training programs, live projects, internships, and career mentorship.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center mb-16">
              <Link href="/academy/courses" className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-base shadow-lg shadow-teal-500/20">
                Browse Courses <ArrowRight size={18} />
              </Link>
              <Link href="/academy/demo" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-base backdrop-blur-sm">
                <Play size={16} className="text-[#2DD4BF]" /> Book Free Demo
              </Link>
              <Link href="/academy/enroll" className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA] font-semibold rounded-xl hover:bg-[#7C3AED]/30 transition-all text-base">
                Enroll Now
              </Link>
            </motion.div>

            {/* Marketing Stats Grid — social proof numbers */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              {[
                { icon: Users, label: "Students Enrolled", value: `${mkt.studentsEnrolled.toLocaleString()}+`, color: "text-[#2DD4BF]" },
                { icon: BookOpen, label: "Courses Available", value: `${mkt.coursesAvailable}+`, color: "text-[#A78BFA]" },
                { icon: GraduationCap, label: "Expert Trainers", value: `${mkt.expertTrainers}+`, color: "text-[#60A5FA]" },
                { icon: Briefcase, label: "Internship Opps", value: `${mkt.internshipOpps}+`, color: "text-[#34D399]" },
                { icon: Award, label: "Hiring Partners", value: `${mkt.hiringPartners}+`, color: "text-[#FBBF24]" },
                { icon: Star, label: "Satisfaction Rate", value: `${mkt.satisfactionRate}%`, color: "text-[#F472B6]" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex flex-col items-center py-6 px-3 border-r border-white/10 last:border-r-0">
                  <Icon size={20} className={`${color} mb-2`} />
                  <div className={`text-2xl font-extrabold ${color} font-mono leading-none mb-1`}>{value}</div>
                  <div className="text-slate-500 text-xs text-center leading-tight">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* CATEGORIES GRID */}
      <section className="py-24 bg-white" id="categories">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5">
              <BookOpen size={14} /> Professional Course Tracks
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Explore Course Categories
            </h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              Find your path and start learning today with expert guidance.
            </p>
          </motion.div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold text-sm">
              <RefreshCw size={24} className="animate-spin text-[#0D9488] mx-auto mb-2" />
              Loading real categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-10 text-center text-slate-500 max-w-md mx-auto">
              No course categories published in database yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((cat, i) => {
                const catCourses = courses.filter(c => c.category_id === cat.id || (c.category && c.category.slug === cat.slug));
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-2xl mb-4">
                      {cat.icon || "💻"}
                    </div>
                    <h3 className="font-bold text-[#0F172A] text-sm mb-3 leading-tight">{cat.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {catCourses.length} courses</span>
                    </div>
                    <Link href={`/academy/courses`} className="absolute inset-0 z-10" aria-label={`Browse ${cat.name}`} />
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/academy/courses" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] transition-colors">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-[#EEF2FF] border border-[#C7D2FE] text-[#6366F1] text-sm font-semibold px-4 py-2 rounded-full mb-5">
              <Rocket size={14} /> Your Learning Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              How Prolx Academy Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316] z-0" />
            {PROCESS.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative z-10 bg-white rounded-2xl p-7 text-center shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
                  <step.icon size={22} className="text-white" />
                </div>
                <div className="text-[#0D9488] font-black text-xs font-mono mb-2">{step.step}</div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{step.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5">
              <GraduationCap size={14} /> Meet the Experts
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Learn From Industry Experts
            </h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              Our trainers are active software engineers and industry professionals.
            </p>
          </motion.div>

          {trainersList.length === 0 ? (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-10 text-center text-slate-500 max-w-md mx-auto">
              Trainers are assigned when courses are created in the Admin Panel.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trainersList.map((trainer, i) => (
                <motion.div key={trainer.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} whileHover={{ y: -6 }}
                  className="bg-white border border-slate-100 rounded-2xl p-7 text-center hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center mx-auto mb-4 shadow-lg text-white text-2xl font-black">
                    {trainer.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-lg mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{trainer.name}</h3>
                  <p className="text-[#64748B] text-sm mb-4">Senior Trainer</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {trainer.coursesCount} courses</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {trainer.studentCount}+</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/academy/become-instructor" className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#F0FDFA] transition-colors">
              Become an Instructor <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-[#64748B] text-lg">Have a question? We've got answers.</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#060D18] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <GraduationCap size={48} className="text-[#2DD4BF] mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Ready to Start Your{" "}
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">
                Learning Journey?
              </span>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Link href="/academy/enroll" className="glow-btn inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-lg shadow-xl shadow-teal-500/20">
                Enroll Now <ArrowRight size={20} />
              </Link>
              <Link href="/academy/demo" className="inline-flex items-center gap-2.5 px-10 py-5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-lg backdrop-blur-sm">
                <Play size={18} className="text-[#2DD4BF]" /> Book Free Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
