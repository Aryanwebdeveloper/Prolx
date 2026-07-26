"use client";

import { Zap, MessageSquare, Code2, HeartHandshake, DollarSign, Shield } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";
import ScrollReveal from "@/components/scroll-reveal";

const reasons = [
  {
    icon: Zap,
    title: "Fast Turnaround",
    desc: "We move quickly. Most projects go from kickoff to launch in 2–4 weeks.",
    gradient: "from-[#F97316] to-[#FBBF24]",
    accent: "#F97316",
  },
  {
    icon: MessageSquare,
    title: "Quick Communication",
    desc: "You'll always hear back within hours — no waiting days for a response.",
    gradient: "from-[#0D9488] to-[#2DD4BF]",
    accent: "#0D9488",
  },
  {
    icon: Code2,
    title: "Modern Tech Stack",
    desc: "Next.js, Supabase, React Native — we use tools that scale with your business.",
    gradient: "from-[#7C3AED] to-[#6366F1]",
    accent: "#7C3AED",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Service",
    desc: "We treat every project like it's our own, with dedicated attention and care.",
    gradient: "from-[#DB2777] to-[#EC4899]",
    accent: "#DB2777",
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    desc: "Startup-friendly pricing with transparent quotes. No hidden fees, ever.",
    gradient: "from-[#059669] to-[#10B981]",
    accent: "#059669",
  },
  {
    icon: Shield,
    title: "Quality You Can Trust",
    desc: "Clean code, tested across devices, and delivered on time.",
    gradient: "from-[#0891B2] to-[#06B6D4]",
    accent: "#0891B2",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 bg-[#0A0F1E] relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#0D9488]/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#7C3AED]/8 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
            Why Prolx
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-5"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <span className="text-white">Real Strengths,</span>{" "}
            <em
              className="text-gradient-teal"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              Not Big Claims
            </em>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto leading-relaxed">
            We&apos;re a focused team that prioritizes quality, communication,
            and getting things done right — the first time.
          </p>
        </ScrollReveal>

        {/* Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.09}>
          {reasons.map(({ icon: Icon, title, desc, gradient, accent }) => (
            <StaggerItem key={title}>
              <div
                className="group glass-card rounded-2xl p-7 hover:-translate-y-1.5 transition-all duration-300 h-full cursor-default"
                style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px ${accent}22, 0 0 0 1px ${accent}33`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <Icon size={20} className="text-white" />
                </div>

                <h3
                  className="font-bold text-white mb-2.5 text-base"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>

                {/* Subtle bottom accent line */}
                <div className={`absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
