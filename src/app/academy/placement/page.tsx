import Link from "next/link";
import { Briefcase, Building, CheckCircle, ChevronRight, ArrowRight, UserCheck, FileText, Award, TrendingUp } from "lucide-react";

const JOBS = [
  {
    title: "Junior React / Next.js Developer",
    company: "ProLx Digital Agency",
    location: "Havelian / Remote",
    type: "Full-Time",
    salary: "PKR 60,000 – 90,000/mo",
    posted: "2 days ago"
  },
  {
    title: "Frontend Developer (Vue / React)",
    company: "DevStudio Pakistan",
    location: "Islamabad (Hybrid)",
    type: "Full-Time",
    salary: "PKR 70,000 – 100,000/mo",
    posted: "4 days ago"
  },
  {
    title: "UI/UX Visual Designer",
    company: "Creative Hub Global",
    location: "Remote",
    type: "Full-Time",
    salary: "PKR 50,000 – 80,000/mo",
    posted: "1 week ago"
  },
  {
    title: "SEO & Content Marketing Specialist",
    company: "GrowthX Agency",
    location: "Abbottabad",
    type: "Full-Time",
    salary: "PKR 45,000 – 70,000/mo",
    posted: "1 week ago"
  }
];

export const metadata = {
  title: "Placement Assistance Portal | Prolx Academy",
  description: "Connect with top hiring partners, get resume reviews, mock interviews, and career counseling at Prolx Academy.",
};

export default function PlacementPage() {
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
            <span className="text-[#2DD4BF]">Placement Assistance</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Career & <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Placement Portal</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We bridge the gap between training and employment. Get access to exclusive job opportunities, interview preparation, and resume audits.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Placement Features */}
        <div className="grid md:grid-cols-4 gap-5 mb-14">
          {[
            { icon: UserCheck, title: "Mock Interviews", desc: "Technical & HR mock interviews with detailed feedback." },
            { icon: FileText, title: "Resume & Portfolio Audit", desc: "Expert review to make your CV stand out to recruiters." },
            { icon: Building, title: "25+ Hiring Partners", desc: "Direct referrals to software houses across Pakistan." },
            { icon: TrendingUp, title: "Career Counseling", desc: "1-on-1 guidance on freelancing, remote jobs, and salary negotiations." },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center mb-4">
                <item.icon size={20} className="text-[#0D9488]" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-sm mb-2">{item.title}</h3>
              <p className="text-[#64748B] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Job Openings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Latest Hiring Partner Openings
            </h2>
            <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full border border-[#CCFBF1]">
              Updated Daily
            </span>
          </div>

          <div className="space-y-4">
            {JOBS.map((job, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-5 hover:border-[#0D9488]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0F172A] text-base mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><Building size={12} className="text-[#0D9488]" /> {job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">{job.type}</span>
                    <span>•</span>
                    <span className="text-[#16A34A] font-bold">{job.salary}</span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-[#0D9488] transition-colors shrink-0"
                >
                  Apply Now <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
