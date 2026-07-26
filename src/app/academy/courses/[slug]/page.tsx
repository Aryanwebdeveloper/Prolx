"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight, Star, Users, Clock, Monitor, MapPin, Award, CheckCircle,
  Play, ChevronDown, ChevronUp, ArrowRight, Briefcase, TrendingUp,
  BookOpen, GraduationCap, Zap, Target, Share2, Download, AlertCircle, RefreshCw
} from "lucide-react";
import { useParams } from "next/navigation";
import { getCourseBySlug } from "@/app/academy-actions";
import { getBatchSeatDisplay } from "@/lib/marketing-stats";

function CurriculumItem({ item, index }: { item: any; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const topicsList = Array.isArray(item.topics) ? item.topics : [];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 text-left transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center text-white text-xs font-bold">{index + 1}</div>
          <span className="font-semibold text-[#0F172A] text-sm">Week {item.week_number || index + 1}: {item.title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[#0D9488]" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && topicsList.length > 0 && (
        <div className="px-5 pb-4 pt-1 bg-[#F8FAFC] grid grid-cols-2 gap-2">
          {topicsList.map((t: string) => (
            <div key={t} className="flex items-center gap-2 text-xs text-[#475569]">
              <CheckCircle size={12} className="text-[#0D9488] shrink-0" /> {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BatchCard({ batch, courseSlug }: { batch: any; courseSlug: string }) {
  const total = batch.total_seats || 30;
  const realEnrolled = batch.enrolled_seats || 0;
  const seatInfo = getBatchSeatDisplay(total, realEnrolled, batch.batch_code || batch.id);

  const modeLabel = batch.mode === "online" ? "🌐 Online" : batch.mode === "physical" ? "📍 Campus" : "🔀 Hybrid";
  const statusColor = seatInfo.isFull ? "bg-red-50 text-red-600 border-red-200" : batch.status === "upcoming" ? "bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]" : batch.status === "ongoing" ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]" : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-[#0F172A]">{batch.name}</h4>
          <p className="text-xs text-[#64748B] font-mono">{batch.batch_code}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor} capitalize`}>
          {seatInfo.isFull ? "Seats Full" : batch.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-[#64748B]">
        <div className="flex items-center gap-2"><Clock size={13} className="text-[#0D9488]" /> {batch.start_date || "TBD"} → {batch.end_date || "TBD"}</div>
        <div className="flex items-center gap-2"><Zap size={13} className="text-[#0D9488]" /> {modeLabel}</div>
        <div className="flex items-center gap-2"><BookOpen size={13} className="text-[#0D9488]" /> {(batch.class_days || []).join(", ") || "Regular"}</div>
        <div className="flex items-center gap-2"><Clock size={13} className="text-[#0D9488]" /> {batch.class_time || "Flexible"}</div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#64748B]">Seats</span>
          <span className={`font-semibold ${seatInfo.isFull ? "text-red-600" : "text-[#EF4444]"}`}>
            {seatInfo.isFull ? "0 seats left (FULL)" : `${seatInfo.available} seats left!`}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${seatInfo.isFull ? "bg-red-500" : "bg-gradient-to-r from-[#0D9488] to-[#EF4444]"}`} style={{ width: `${seatInfo.pct}%` }} />
        </div>
      </div>
      {seatInfo.isFull ? (
        <button disabled className="w-full block text-center py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed">
          Batch Full (Closed)
        </button>
      ) : (
        <Link href={`/academy/enroll?batch=${batch.batch_code}&course=${courseSlug}`} className="w-full block text-center py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md shadow-teal-500/10">
          Enroll in This Batch
        </Link>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!slug) return;
      setLoading(true);
      const data = await getCourseBySlug(slug);
      setCourse(data);
      setLoading(false);
    }
    loadCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D18] flex items-center justify-center pt-28 pb-20 text-center">
        <div>
          <RefreshCw size={36} className="animate-spin text-[#2DD4BF] mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-semibold">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 pt-28">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 max-w-md w-full text-center shadow-xl">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Course Not Found</h1>
          <p className="text-[#64748B] text-sm mb-6">The requested course page is not available or has been deactivated.</p>
          <Link href="/academy/courses" className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm inline-block">
            Browse Published Courses
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = Number(course.original_price) || 0;
  const discountedPrice = Number(course.discounted_price) || originalPrice;
  const save = originalPrice - discountedPrice;
  const savePercent = originalPrice > 0 ? Math.round((save / originalPrice) * 100) : 0;

  const objectives = Array.isArray(course.learning_objectives) ? course.learning_objectives : [];
  const skills = Array.isArray(course.skills_covered) ? course.skills_covered : [];
  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
  const batches = Array.isArray(course.batches) ? course.batches : [];
  const reviews = Array.isArray(course.reviews) ? course.reviews : [];
  const career = Array.isArray(course.career_opportunities) ? course.career_opportunities : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="bg-[#060D18] pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-[#2DD4BF]">Home</Link>
            <ChevronRight size={12} />
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <Link href="/academy/courses" className="hover:text-[#2DD4BF]">Courses</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#0D9488]/20 text-[#2DD4BF] text-xs font-bold px-3 py-1 rounded-full border border-[#0D9488]/30">
                  {course.category?.name || "General"}
                </span>
                {course.is_featured && <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white text-xs font-bold px-3 py-1 rounded-full">Featured</span>}
                {course.has_internship && <span className="bg-[#F0FDF4] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full border border-[#BBF7D0]">Internship ✓</span>}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {course.title}
              </h1>

              <p className="text-slate-400 text-lg mb-6">{course.short_description || course.description}</p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Star size={15} className="text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="text-[#FBBF24] font-bold">{course.rating || "5.0"}</span>
                  <span>({course.review_count || reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5"><Users size={14} /> {course.student_count || 0}+ students</div>
                <div className="flex items-center gap-1.5"><Clock size={14} /> {course.duration_weeks ? `${course.duration_weeks} Weeks` : "Self-Paced"}</div>
                <div className="flex items-center gap-1.5"><BookOpen size={14} /> {course.language || "Urdu / English"}</div>
                <div className="flex items-center gap-1.5"><Target size={14} /> {course.level || "Beginner"}</div>
              </div>

              <div className="flex items-center gap-3 mt-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center text-white font-black">
                  {(course.instructor_name || "PA").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{course.instructor_name || "Prolx Instructor"}</div>
                  <div className="text-slate-400 text-xs">Academy Senior Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            {course.description && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>About This Course</h2>
                <p className="text-[#475569] text-sm leading-relaxed whitespace-pre-line">{course.description}</p>
              </div>
            )}

            {/* What You'll Learn */}
            {objectives.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {objectives.map((obj: string) => (
                    <div key={obj} className="flex items-start gap-3 text-sm text-[#475569]">
                      <CheckCircle size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Covered */}
            {skills.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Skills Covered</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span key={skill} className="px-4 py-2 bg-[#F0FDFA] text-[#0D9488] text-sm font-semibold rounded-xl border border-[#CCFBF1]">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Course Curriculum</h2>
                <div className="space-y-3">
                  {curriculum.map((item: any, i: number) => <CurriculumItem key={i} item={item} index={i} />)}
                </div>
              </div>
            )}

            {/* Batches */}
            {batches.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Available Batches</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {batches.map((batch: any) => <BatchCard key={batch.id} batch={batch} courseSlug={slug} />)}
                </div>
              </div>
            )}

            {/* Career Opportunities */}
            {career.length > 0 && (
              <div className="bg-gradient-to-br from-[#F0FDFA] to-[#EEF2FF] border border-[#CCFBF1] rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Career Opportunities</h2>
                <div className="grid md:grid-cols-2 gap-3 mb-5">
                  {career.map((c: string) => (
                    <div key={c} className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-[#0F172A] border border-slate-100">
                      <Briefcase size={14} className="text-[#0D9488]" /> {c}
                    </div>
                  ))}
                </div>
                {course.salary_range && (
                  <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-[#CCFBF1]">
                    <TrendingUp size={18} className="text-[#16A34A]" />
                    <div>
                      <div className="text-xs text-[#64748B] font-medium">Expected Salary Range</div>
                      <div className="font-bold text-[#16A34A]">{course.salary_range}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Enrollment Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xl shadow-slate-100">
              {/* Price */}
              <div className="text-center mb-6">
                {discountedPrice > 0 ? (
                  <>
                    <div className="text-4xl font-black text-[#0D9488] mb-1">PKR {discountedPrice.toLocaleString()}</div>
                    {originalPrice > discountedPrice && (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-slate-400 line-through text-lg">PKR {originalPrice.toLocaleString()}</span>
                        <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">-{savePercent}%</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-4xl font-black text-emerald-600 mb-1">FREE</div>
                )}

                {course.installment_available && (
                  <p className="text-xs text-[#64748B] mt-2">
                    Or PKR {Number(course.installment_amount || 0).toLocaleString()}/month × {course.installment_months || 3} months
                  </p>
                )}
              </div>

              <Link href={`/academy/enroll?course=${slug}`} className="w-full block text-center py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-base mb-3 shadow-lg shadow-teal-500/20">
                Enroll Now
              </Link>
              <Link href="/academy/demo" className="w-full block text-center py-3 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] font-semibold rounded-xl hover:bg-[#CCFBF1] transition-colors text-sm mb-3">
                <Play size={14} className="inline mr-1.5" /> Book Free Demo Class
              </Link>

              {/* Includes */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">This Course Includes:</p>
                {[
                  { icon: Clock, text: course.duration_weeks ? `${course.duration_weeks} weeks duration` : "Flexible learning" },
                  { icon: Monitor, text: "Online & Physical modes" },
                  { icon: Award, text: "Verified certificate" },
                  { icon: GraduationCap, text: "Expert instructor" },
                  { icon: Briefcase, text: course.has_internship ? "Internship opportunity" : "Career guidance" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-[#475569]">
                    <CheckCircle size={14} className="text-[#0D9488] shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
