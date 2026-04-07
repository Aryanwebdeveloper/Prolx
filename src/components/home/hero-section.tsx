"use client";

import Link from "next/link";
import { ArrowRight, Zap, Code2, HeartHandshake } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230D9488%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />

      {/* Teal gradient blob */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#CCFBF1] via-[#F0FDFA] to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#F0FDFA] to-transparent rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              Growing Digital Agency
            </div>

            <h1
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#0F172A] leading-[1.1] mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              We Build{" "}
              <span className="text-[#0D9488]">Modern Websites</span>
              <br className="hidden sm:block" />
              &amp; Apps That Help{" "}
              <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                You Grow.
              </em>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] mb-8 max-w-lg leading-relaxed">
              We work closely with startups and local businesses to build scalable
              digital products — from landing pages to full web apps.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                id="hero-start-project"
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white font-semibold rounded-xl transition-all text-base shadow-lg shadow-teal-100"
              >
                Start Your Project
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/portfolio"
                id="hero-view-work"
                className="inline-flex items-center gap-2 px-7 py-4 bg-white border-2 border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#F0FDFA] active:scale-95 transition-all text-base"
              >
                View Our Work
              </Link>
            </div>

            {/* Value highlights instead of fake stats */}
            <div className="mt-10 flex flex-wrap gap-5">
              {[
                { icon: Zap, label: "Fast Delivery" },
                { icon: Code2, label: "Modern Tech Stack" },
                { icon: HeartHandshake, label: "Client-Focused" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-[#64748B]">
                  <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] flex items-center justify-center">
                    <Icon size={14} className="text-[#0D9488]" />
                  </div>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-md">
              {/* Main device mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="bg-[#F0FDFA] px-4 py-3 flex items-center gap-2 border-b border-[#E2E8F0]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-[#64748B] font-mono flex items-center gap-2">
                    <span className="text-[#0D9488]">prolx.cloud</span>

                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#CCFBF1] rounded-full w-3/4" />
                  <div className="h-3 bg-[#F0FDFA] rounded-full w-full" />
                  <div className="h-3 bg-[#F0FDFA] rounded-full w-5/6" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="h-20 bg-[#F0FDFA] rounded-xl border border-[#E2E8F0]" />
                    <div className="h-20 bg-[#CCFBF1] rounded-xl" />
                  </div>
                  <div className="h-8 bg-[#0D9488] rounded-lg w-1/2 mt-2" />
                </div>
              </div>

              {/* Floating metric cards */}
              <div className="absolute -left-12 top-16 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] flex items-center justify-center">
                  <span className="text-[#0D9488] text-xs font-bold">🚀</span>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">Launched</div>
                  <div className="font-bold text-[#0F172A] text-sm font-mono">15+ Projects</div>
                </div>
              </div>

              <div className="absolute -right-10 bottom-20 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <span className="text-[#F97316] text-xs font-bold">★</span>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">Client Rating</div>
                  <div className="font-bold text-[#0F172A] text-sm font-mono">5.0 / 5.0</div>
                </div>
              </div>

              <div className="absolute -right-8 top-8 bg-[#0D9488] rounded-xl shadow-lg p-3">
                <div className="text-white text-xs font-mono font-bold">98</div>
                <div className="text-teal-200 text-[10px]">PageSpeed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
