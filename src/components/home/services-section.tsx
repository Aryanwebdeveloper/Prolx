"use client";

import Link from "next/link";
import { Globe, Code2, Smartphone, Monitor, Briefcase, ShoppingBag, Palette, Search, ArrowRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import ScrollReveal from "@/components/scroll-reveal";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "Fast, SEO-optimized websites built to convert visitors into loyal customers.",
    gradient: "from-[#0D9488] to-[#0891B2]",
    glow: "rgba(13,148,136,0.25)",
    badge: "Most Popular",
  },
  {
    icon: Code2,
    title: "Custom Web Apps",
    desc: "Scalable web applications built with modern frameworks and clean architecture.",
    gradient: "from-[#7C3AED] to-[#6366F1]",
    glow: "rgba(124,58,237,0.2)",
    badge: null,
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Cross-platform apps for iOS and Android using React Native.",
    gradient: "from-[#0891B2] to-[#06B6D4]",
    glow: "rgba(8,145,178,0.2)",
    badge: null,
  },
  {
    icon: Monitor,
    title: "Desktop Applications",
    desc: "Powerful, native software for Windows, macOS, and Linux platforms.",
    gradient: "from-[#059669] to-[#10B981]",
    glow: "rgba(5,150,105,0.2)",
    badge: null,
  },
  {
    icon: Briefcase,
    title: "Business Solutions (POS)",
    desc: "Custom-built POS systems and ERP tools to streamline your operations.",
    gradient: "from-[#D97706] to-[#F59E0B]",
    glow: "rgba(217,119,6,0.2)",
    badge: null,
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Development",
    desc: "High-converting online stores on Shopify or custom-built platforms.",
    gradient: "from-[#DB2777] to-[#EC4899]",
    glow: "rgba(219,39,119,0.2)",
    badge: null,
  },
];

function ServiceCard({ icon: Icon, title, desc, gradient, glow, badge, index }: any) {
  return (
    <StaggerItem>
      <div
        className="group relative glass-card rounded-2xl p-7 hover:border-transparent hover:-translate-y-2 transition-all duration-400 cursor-pointer overflow-hidden h-full"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px ${glow}, 0 4px 20px rgba(0,0,0,0.08)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        }}
      >
        {/* Gradient top border that reveals on hover */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#0D9488] to-[#0891B2] px-2.5 py-1 rounded-full">
              {badge}
            </span>
          </div>
        )}

        {/* Icon */}
        <div
          className={`w-13 h-13 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          style={{ width: 52, height: 52 }}
        >
          <Icon size={22} className="text-white" />
        </div>

        {/* Content */}
        <h3
          className="text-lg font-bold text-white mb-2.5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm text-[#94A3B8] leading-relaxed mb-5">{desc}</p>

        {/* Learn more arrow */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] group-hover:gap-2.5 transition-all duration-200"
        >
          Learn more <ArrowRight size={14} />
        </Link>
      </div>
    </StaggerItem>
  );
}

export default function ServicesSection() {
  return (
    <section className="py-24 bg-[#0A0F1E] relative overflow-hidden">
      {/* Subtle mesh background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      {/* Glowing orb top-right */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#0D9488]/12 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#7C3AED]/10 blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
            What We Do
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Services Built for{" "}
            <em
              className="not-italic text-gradient-teal"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              Impact
            </em>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto leading-relaxed">
            From design to deployment — we cover the full digital spectrum so you
            can focus on growing your business.
          </p>
        </ScrollReveal>

        {/* Cards grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.09}>
          {services.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} />
          ))}
        </StaggerContainer>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0.2} className="text-center mt-14">
          <Link
            href="/services"
            id="services-view-all"
            className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-base"
          >
            View All Services
            <ArrowRight size={18} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
