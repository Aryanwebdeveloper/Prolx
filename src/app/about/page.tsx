import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Award, Users, Globe, Rocket, Shield, Clock, CheckCircle2, Star } from "lucide-react";
import { Metadata } from "next";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "About Us | Prolx Digital Agency",
  description: "Learn about Prolx, a results-driven digital agency in Abbottabad, Pakistan. We specialize in web development, mobile apps, and digital growth.",
};

const milestones = [
  {
    year: "Jan 2026",
    title: "Founded",
    desc: "Prolx was founded in Abbottabad, Pakistan, starting our journey with a small, elite team of innovators.",
    icon: "🚀",
    color: "#0D9488",
  },
  {
    year: "Feb 2026",
    title: "Seed Funding & Web Apps",
    desc: "Won seed money in BIC AUST and delivered our first 2 client web applications with high quality.",
    icon: "🏆",
    color: "#7C3AED",
  },
  {
    year: "Mar 2026",
    title: "Rapid Growth & Excellence",
    desc: "Completed 15+ projects in 3 months, showcasing speed and technical excellence using Next.js & modern tools.",
    icon: "📈",
    color: "#F97316",
  },
];

const values = [
  {
    icon: Rocket,
    title: "Innovation First",
    desc: "We stay ahead of technology trends so our clients always receive future-proof solutions.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Client Partnership",
    desc: "We don't just deliver projects — we build long-term partnerships anchored in mutual success.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Award,
    title: "Quality Without Compromise",
    desc: "Every line of code, every pixel, every word is crafted to the highest professional standard.",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProlxNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#0A0F1E] overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#0D9488]/10 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#7C3AED]/10 blur-[100px] animate-glow-pulse pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up">
            <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-5 font-mono">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#0D9488]" />
              <span className="text-[#2DD4BF]">About Us</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1
                  className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  We&apos;re Prolx —{" "}
                  <br />
                  <em className="text-shimmer" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    Your Digital Growth Partner
                  </em>
                </h1>
                <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
                  Founded in early 2026 in Abbottabad, Pakistan, Prolx has rapidly grown
                  from a bold vision into a results-driven digital agency. In just three
                  months, we&apos;ve secured seed funding and delivered exceptional value
                  to local and international clients through innovative technology.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-5 py-3 glass-card rounded-xl text-center min-w-[100px]">
                    <div className="text-2xl font-extrabold text-[#2DD4BF] font-mono">15+</div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Projects</div>
                  </div>
                  <div className="px-5 py-3 glass-card rounded-xl text-center min-w-[100px]">
                    <div className="text-2xl font-extrabold text-[#2DD4BF] font-mono">5.0★</div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Rating</div>
                  </div>
                  <div className="px-5 py-3 glass-card rounded-xl text-center min-w-[100px]">
                    <div className="text-2xl font-extrabold text-[#2DD4BF] font-mono">98%</div>
                    <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Speed</div>
                  </div>
                </div>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Prolx Team"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/80 to-transparent" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFBF1] to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
              Core Principles
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Mission, Vision &amp; Values
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-16" stagger={0.1}>
            <StaggerItem>
              <div className="bg-[#F0FDFA] rounded-2xl p-8 border border-[#CCFBF1] h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] flex items-center justify-center mb-5">
                    <Globe size={18} className="text-[#0D9488]" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#0F172A] mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Our Mission
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    To democratize access to premium digital solutions, helping businesses of every size compete effectively in the digital economy.
                  </p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-[#F0FDFA] rounded-2xl p-8 border border-[#CCFBF1] h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] flex items-center justify-center mb-5">
                    <Rocket size={18} className="text-[#0D9488]" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#0F172A] mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Our Vision
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    To become the most trusted digital agency for growth-focused companies across South Asia, the Middle East, and beyond.
                  </p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-[#0D9488] rounded-2xl p-8 text-white h-full shadow-lg shadow-teal-900/10 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                    <Shield size={18} className="text-[#2DD4BF]" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3 text-white"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Our Values
                  </h3>
                  <ul className="space-y-3">
                    {["Transparency", "Excellence", "Innovation", "Integrity", "Impact"].map((v) => (
                      <li key={v} className="flex items-center gap-2.5 text-teal-100 text-xs font-semibold uppercase tracking-wider font-mono">
                        <CheckCircle2 size={13} className="text-[#2DD4BF]" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Value cards */}
          <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.08}>
            {values.map(({ icon: Icon, title, desc, color }) => (
              <StaggerItem key={title}>
                <div className="flex gap-5 p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] h-full hover:border-[#2DD4BF]/40 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1.5 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-[#0A0F1E] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
              Our Journey
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Interactive Timeline
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
              How we scaled from a small local team into an international digital agency.
            </p>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            {/* Center Timeline rule */}
            <div className="hidden md:block absolute left-1/2 -translate-x-0.5 top-2 bottom-2 w-[2px] bg-[#0D9488]/30" />

            <div className="space-y-12">
              {milestones.map(({ year, title, desc, icon, color }, i) => (
                <div
                  key={`${year}-${i}`}
                  className={`flex gap-6 md:gap-0 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Left block (desktop) */}
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-12" : "pl-12"}`}>
                    <ScrollReveal direction={i % 2 === 0 ? "right" : "left"}>
                      <div className="text-[#2DD4BF] font-mono font-bold text-sm mb-1">{year}</div>
                      <h4
                        className="font-bold text-white text-lg mb-2"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                      >
                        {title}
                      </h4>
                      <p className="text-[#94A3B8] text-xs leading-relaxed">{desc}</p>
                    </ScrollReveal>
                  </div>

                  {/* Icon circle */}
                  <ScrollReveal direction="scale" className="relative z-10 shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, border: "3px solid #0A0F1E" }}
                    >
                      {icon}
                    </div>
                  </ScrollReveal>

                  {/* Right block (desktop) / Content (mobile) */}
                  <div className="flex-1 md:hidden pl-4">
                    <ScrollReveal direction="left">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[#2DD4BF] font-mono font-bold text-xs">{year}</div>
                      </div>
                      <h4 className="font-bold text-white text-base mb-1.5">{title}</h4>
                      <p className="text-[#94A3B8] text-xs leading-relaxed">{desc}</p>
                    </ScrollReveal>
                  </div>

                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "pl-12" : "pr-12"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
              The Creators
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Meet the Leaders
            </h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              The talented directors and key specialists driving innovation at Prolx.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-14" stagger={0.08}>
            {[
              { name: "Aryan Waheed", role: "CEO & Co-Founder", dept: "Leadership", exp: "4 years", initials: "AW", color: "#0D9488" },
              { name: "Muhammad Yassen", role: "COO & Co-Founder", dept: "Leadership", exp: "4 years", initials: "MY", color: "#0F766E" },
              { name: "Abdullah Nisar", role: "Software Developer / Engineer", dept: "Engineering", exp: "4 years", initials: "AN", color: "#1D4ED8" },
              { name: "Hammad ur Rehman", role: "Software Developer / Engineer", dept: "Engineering", exp: "3 years", initials: "HR", color: "#7C3AED" },
            ].map((m) => (
              <StaggerItem key={m.name} className="text-center group">
                <div
                  className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-[#E2E8F0] group-hover:border-[#0D9488] group-hover:scale-105 transition-all duration-300 flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)` }}
                >
                  {m.initials}
                </div>
                <h4 className="font-bold text-[#0F172A] text-sm mb-0.5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{m.name}</h4>
                <p className="text-xs text-[#0D9488] font-semibold mb-0.5">{m.role}</p>
                <p className="text-[10px] text-[#94A3B8] font-mono">{m.exp}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal direction="up" className="text-center">
            <Link
              href="/team"
              className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm"
            >
              View Full Team
              <ChevronRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
