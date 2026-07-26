"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Zap, Code2, HeartHandshake, Clock } from "lucide-react";

const clients = [
  "Spectrum Marketer", "BIC AUST", "Local Startups", "Small Businesses",
  "E-commerce Brands", "Freelance Partners", "Healthcare Clinics", "Real Estate Firms",
];

const highlights = [
  { icon: Zap,           label: "Fast Delivery",    desc: "Projects delivered in weeks, not months", value: "2-4wk" },
  { icon: Code2,         label: "Modern Stack",      desc: "Next.js, React, Supabase & more",        value: "15+" },
  { icon: HeartHandshake,label: "Client-Focused",    desc: "Personalized service for every project",  value: "5.0★" },
  { icon: Clock,         label: "Quick Responses",   desc: "We reply within hours, not days",         value: "< 4hr" },
];

function StatCard({ icon: Icon, label, desc, value, index }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.25,0.46,0.45,0.94] }}
      className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/40 hover:shadow-[0_8px_30px_rgba(13,148,136,0.12)] transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon size={20} className="text-[#0D9488]" />
      </div>
      <div
        className="text-2xl font-extrabold text-[#0D9488] mb-1 font-mono tabular-nums"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-sm font-bold text-[#0F172A] mb-1">{label}</div>
      <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function TrustBar() {
  return (
    <section className="py-16 bg-white border-y border-[#E2E8F0] relative overflow-hidden">
      {/* Subtle background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] to-white pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Trusted by */}
        <p className="text-center text-xs text-[#94A3B8] font-semibold mb-6 uppercase tracking-[0.2em]">
          Trusted by growing businesses &amp; brands
        </p>

        {/* Marquee */}
        <div className="overflow-hidden relative mb-14">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex gap-12 animate-marquee w-max">
            {[...clients, ...clients].map((logo, i) => (
              <div
                key={i}
                className="text-[#CBD5E1] hover:text-[#0D9488] transition-all duration-300 font-bold text-base whitespace-nowrap cursor-default select-none hover:scale-105"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {highlights.map((h, i) => (
            <StatCard key={h.label} {...h} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
