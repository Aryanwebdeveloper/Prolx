"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, Clock, Award, CheckCircle, ChevronRight, ArrowRight, Building, Sparkles, RefreshCw } from "lucide-react";
import { getInternships } from "@/app/academy-actions";

export default function InternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInternships() {
      setLoading(true);
      const data = await getInternships();
      setInternships(data);
      setLoading(false);
    }
    loadInternships();
  }, []);

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
            <span className="text-[#2DD4BF]">Internship Programs</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#4ADE80] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={15} /> Real Work Experience & Job Offers
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Prolx <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Internship Program</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Work on live software projects, receive 1-on-1 mentorship from senior engineers, and earn a official completion letter & job opportunity.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={32} className="animate-spin text-[#0D9488] mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-sm">Loading internship programs...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <Briefcase size={48} className="mx-auto mb-4 text-[#16A34A] opacity-40" />
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Active Internships Posted</h3>
            <p className="text-[#64748B] text-sm mb-6">
              Internship slots open after each batch completion. Contact our team to inquire about custom internship placements.
            </p>
            <Link href="/contact" className="px-6 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm inline-block">
              Inquire About Internships
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {internships.map((item) => {
              const reqs = Array.isArray(item.requirements) ? item.requirements : [];
              const projs = Array.isArray(item.projects) ? item.projects : [];

              return (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] text-xs font-bold px-3 py-1 rounded-full">
                          {item.department || "Engineering"}
                        </span>
                        {item.stipend && (
                          <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold px-3 py-1 rounded-full">
                            {item.stipend}
                          </span>
                        )}
                        {item.hiring_opportunity && (
                          <span className="bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] text-xs font-bold px-3 py-1 rounded-full">
                            Hiring Opportunity ✓
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {item.title}
                      </h2>

                      <div className="flex flex-wrap gap-5 text-xs text-[#64748B] font-medium mt-3">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#0D9488]" /> Duration: {item.duration_months || 3} Months</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-[#0D9488]" /> Open Slots: {item.positions_available || 5}</span>
                        {item.mentor_name && <span className="flex items-center gap-1.5"><Award size={14} className="text-[#0D9488]" /> Mentor: {item.mentor_name}</span>}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
                      >
                        Apply for Internship <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-6">
                    {reqs.length > 0 && (
                      <div>
                        <h3 className="font-bold text-[#0F172A] text-sm mb-3">Requirements:</h3>
                        <ul className="space-y-2">
                          {reqs.map((req: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#475569]">
                              <CheckCircle size={14} className="text-[#0D9488] shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {projs.length > 0 && (
                      <div>
                        <h3 className="font-bold text-[#0F172A] text-sm mb-3">Live Projects You'll Work On:</h3>
                        <ul className="space-y-2">
                          {projs.map((proj: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#475569]">
                              <CheckCircle size={14} className="text-[#7C3AED] shrink-0 mt-0.5" />
                              <span>{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
