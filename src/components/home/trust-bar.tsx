"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Code2, HeartHandshake, Clock } from "lucide-react";

const clients = [
  "Spectrum Marketer", "BIC AUST", "Local Startups", "Small Businesses",
  "E-commerce Brands", "Freelance Partners",
];

const highlights = [
  { icon: Zap, label: "Fast Delivery", desc: "Projects delivered in weeks, not months" },
  { icon: Code2, label: "Modern Tech Stack", desc: "Next.js, React, Supabase & more" },
  { icon: HeartHandshake, label: "Client-Focused", desc: "Personalized service for every project" },
  { icon: Clock, label: "Quick Responses", desc: "We reply within hours, not days" },
];

export default function TrustBar() {
  return (
    <section className="py-14 bg-white border-y border-[#E2E8F0]">
      <div className="container mx-auto px-4">

        {/* Trusted by */}
        <p className="text-center text-xs text-[#94A3B8] font-semibold mb-6 uppercase tracking-widest">
          Trusted by early-stage businesses &amp; local brands
        </p>
        <div className="overflow-hidden relative mb-12">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex gap-10 animate-marquee w-max">
            {[...clients, ...clients].map((logo, i) => (
              <div
                key={i}
                className="text-[#CBD5E1] hover:text-[#0D9488] transition-colors font-bold text-base whitespace-nowrap cursor-default select-none"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Value highlights — honest, value-based */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#F0FDFA] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] flex items-center justify-center mb-3">
                <Icon size={18} className="text-[#0D9488]" />
              </div>
              <div
                className="text-sm font-bold text-[#0F172A] mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {label}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
