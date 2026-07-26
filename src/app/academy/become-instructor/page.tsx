"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, BookOpen, Briefcase, ChevronRight, CheckCircle, Send } from "lucide-react";

export default function BecomeInstructorPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="bg-[#060D18] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">Become an Instructor</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Teach & Inspire the <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Next Generation</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join Prolx Academy as an expert trainer. Share your real-world experience, mentor passionate students, and earn competitive compensation.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {submitted ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Application Submitted!</h2>
            <p className="text-sm text-[#64748B] mb-6">Our Academy HR team will review your application and contact you within 48 hours.</p>
            <Link href="/academy" className="px-6 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm">Return to Academy</Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Instructor Application Form
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="text" placeholder="Your full name" className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="email" placeholder="you@example.com" className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="tel" placeholder="03XXXXXXXXX" className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475569] block mb-1.5">Years of Industry Experience *</label>
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="text" placeholder="e.g. 5 Years" className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Course / Topic You Want to Teach *</label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="text" placeholder="e.g. Full Stack Web Development, UI/UX, AI, Python..." className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">LinkedIn Profile / Portfolio Link *</label>
                <input required type="url" placeholder="https://linkedin.in/in/username or portfolio link" className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475569] block mb-1.5">Brief Bio & Teaching Experience</label>
                <textarea rows={4} placeholder="Tell us about your technical expertise, past teaching or mentoring experience..." className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] resize-none" />
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Send size={18} /> Submit Application
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
