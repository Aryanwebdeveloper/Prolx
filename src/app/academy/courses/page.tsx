"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Star, Clock, Monitor, MapPin, Filter, Search,
  ChevronRight, ArrowRight, Play, RefreshCw, AlertCircle
} from "lucide-react";
import { getAcademyCourses, getAcademyCategories } from "@/app/academy-actions";

function CourseCard({ course }: { course: any }) {
  const original = Number(course.original_price) || 0;
  const discounted = Number(course.discounted_price) || original;
  const save = original - discounted;
  const savePercent = original > 0 ? Math.round((save / original) * 100) : 0;
  const categoryName = course.category?.name || "General";
  const durationText = course.duration_weeks ? `${course.duration_weeks} weeks` : "Self-Paced";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all group flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Header */}
        <div className="relative h-44 bg-gradient-to-br from-[#060D18] to-[#0F172A] flex items-center justify-center p-6 text-center overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
          <span className="text-4xl z-10">{course.thumbnail_url || "💻"}</span>
          {course.is_featured && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {course.has_internship && (
            <span className="absolute top-4 right-4 bg-[#F0FDF4] text-[#16A34A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0]">
              Internship ✓
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-[#CCFBF1]">{categoryName}</span>
            <span className="text-xs text-[#64748B] capitalize">{course.level || "Beginner"}</span>
          </div>

          <h3 className="font-bold text-[#0F172A] text-base mb-2 leading-snug group-hover:text-[#0D9488] transition-colors" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {course.title}
          </h3>

          <p className="text-xs text-[#64748B] mb-4">by {course.instructor_name || "Prolx Trainer"}</p>

          <div className="flex items-center gap-4 text-xs text-[#64748B] mb-5 flex-wrap">
            <span className="flex items-center gap-1"><Star size={11} className="text-[#FBBF24] fill-[#FBBF24]" /> {course.rating || "5.0"} ({course.review_count || 0})</span>
            <span className="flex items-center gap-1"><Users size={11} /> {course.student_count || 0}+ students</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {durationText}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3 mb-5">
            {discounted > 0 ? (
              <>
                <span className="text-2xl font-black text-[#0D9488]">PKR {discounted.toLocaleString()}</span>
                {original > discounted && (
                  <>
                    <span className="text-sm text-slate-400 line-through">PKR {original.toLocaleString()}</span>
                    <span className="text-xs font-bold text-white bg-[#EF4444] px-2 py-0.5 rounded-full">-{savePercent}%</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-xl font-bold text-emerald-600">FREE</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Link
          href={`/academy/courses/${course.slug}`}
          className="w-full block text-center py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md shadow-teal-500/10"
        >
          View Course <ChevronRight size={14} className="inline ml-1" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [level, setLevel] = useState("All Levels");

  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [crs, cats] = await Promise.all([
        getAcademyCourses(),
        getAcademyCategories(),
      ]);
      setCourses(crs);
      setCategories(cats);
      setLoading(false);
    }
    loadData();
  }, []);

  const levelsList = ["All Levels", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.short_description && c.short_description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCat === "All" || (c.category && c.category.slug === selectedCat) || c.category_id === selectedCat;
    const matchLevel = level === "All Levels" || (c.level && c.level.toLowerCase() === level.toLowerCase());
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-[#060D18] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-[#2DD4BF]">Home</Link>
            <ChevronRight size={12} />
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">All Courses</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            All <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Explore expert-led courses across technology, design, marketing, and business.
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search active courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:border-[#0D9488] transition-colors backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="flex items-center gap-2 text-sm text-[#64748B] font-semibold">
            <Filter size={16} /> Category:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat("All")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCat === "All" ? "bg-[#0D9488] text-white shadow-sm" : "bg-white text-[#475569] border border-slate-200 hover:border-[#0D9488] hover:text-[#0D9488]"}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCat === cat.slug ? "bg-[#0D9488] text-white shadow-sm" : "bg-white text-[#475569] border border-slate-200 hover:border-[#0D9488] hover:text-[#0D9488]"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            {levelsList.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${level === l ? "bg-[#7C3AED] text-white shadow-sm" : "bg-white text-[#475569] border border-slate-200 hover:border-[#7C3AED] hover:text-[#7C3AED]"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={32} className="animate-spin text-[#0D9488] mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-sm">Loading real courses from database...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#64748B] mb-6 font-semibold">
              Showing {filtered.length} of {courses.length} published courses
            </p>

            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
                <BookOpen size={48} className="mx-auto mb-4 text-[#0D9488] opacity-40" />
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Courses Found</h3>
                <p className="text-[#64748B] text-sm mb-6">
                  {courses.length === 0
                    ? "No courses have been added to the database yet. Admin and trainers can add courses directly from the Admin Dashboard."
                    : "No courses match your filter criteria."}
                </p>
                {courses.length > 0 && (
                  <button onClick={() => { setSearch(""); setSelectedCat("All"); setLevel("All Levels"); }} className="px-6 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm hover:opacity-90">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-[#060D18] to-[#0F1F3D] rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-10" />
          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Not sure which course is right for you?
            </h3>
            <p className="text-slate-400 mb-7">Book a free demo class and our advisors will guide you to the perfect program.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/academy/demo" className="glow-btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl">
                <Play size={16} /> Book Free Demo
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 border border-white/20">
                Talk to Advisor <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
