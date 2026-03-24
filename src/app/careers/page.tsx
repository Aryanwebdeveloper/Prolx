"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, MapPin, Clock, Briefcase, X } from "lucide-react";

const positions = [
  {
    title: "Senior Full-Stack Developer",
    dept: "Engineering",
    location: "Remote / Karachi",
    type: "Full-time",
    requirements: [
      "5+ years with React/Next.js and Node.js",
      "Experience with PostgreSQL and cloud platforms",
      "Strong TypeScript skills",
      "Portfolio of production applications",
    ],
  },
  {
    title: "UI/UX Designer",
    dept: "Design",
    location: "Remote",
    type: "Full-time",
    requirements: [
      "3+ years of product design experience",
      "Expert Figma skills with design systems",
      "Portfolio showing user research and process",
      "Experience designing for web and mobile",
    ],
  },
  {
    title: "Digital Marketing Specialist",
    dept: "Marketing",
    location: "Karachi / Hybrid",
    type: "Full-time",
    requirements: [
      "3+ years in digital marketing",
      "Google Ads and Meta Ads certified",
      "Strong analytical skills (GA4, Looker)",
      "E-commerce marketing experience preferred",
    ],
  },
  {
    title: "React Native Developer",
    dept: "Engineering",
    location: "Remote",
    type: "Contract",
    requirements: [
      "3+ years with React Native",
      "Published apps on App Store & Google Play",
      "Experience with Expo and native modules",
      "Knowledge of mobile UX best practices",
    ],
  },
];

export default function CareersPage() {
  const [openJob, setOpenJob] = useState<number | null>(null);
  const [applying, setApplying] = useState<number | null>(null);
  const [appForm, setAppForm] = useState({ name: "", email: "", portfolio: "", message: "" });
  const [appSubmitted, setAppSubmitted] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitted(true);
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-[#0F172A] mb-8"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Open Positions
          </h2>

          <div className="space-y-4">
            {positions.map(({ title, dept, location, type, requirements }, i) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#2DD4BF] transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenJob(openJob === i ? null : i)}
                  className="w-full flex flex-wrap items-center justify-between gap-4 p-6 text-left hover:bg-[#F0FDFA] transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Briefcase size={13} /> {dept}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <MapPin size={13} /> {location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Clock size={13} /> {type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-[#0D9488] shrink-0 transition-transform ${openJob === i ? "rotate-90" : ""}`}
                  />
                </button>

                {openJob === i && (
                  <div className="px-6 pb-6 border-t border-[#E2E8F0] pt-5">
                    <h4 className="font-semibold text-[#0F172A] text-sm mb-3">Requirements</h4>
                    <ul className="space-y-2 mb-5">
                      {requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-[#64748B]">
                          <span className="text-[#0D9488] mt-0.5">✓</span> {r}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setApplying(i)}
                      className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl text-sm transition-all"
                    >
                      Apply Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {applying !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Apply: {positions[applying].title}
              </h3>
              <button onClick={() => { setApplying(null); setAppSubmitted(false); }} className="text-[#64748B] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
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
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={appForm.name}
                      onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Portfolio / LinkedIn URL</label>
                    <input
                      type="url"
                      value={appForm.portfolio}
                      onChange={(e) => setAppForm({ ...appForm, portfolio: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488]"
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Why do you want to join Prolx?</label>
                    <textarea
                      rows={3}
                      value={appForm.message}
                      onChange={(e) => setAppForm({ ...appForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] resize-none"
                      placeholder="Tell us about yourself…"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all"
                  >
                    Submit Application
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
