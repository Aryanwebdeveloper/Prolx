"use client";

import Link from "next/link";
import { ArrowRight, Zap, Code2, HeartHandshake, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/* ── Floating metric card ──────────────────────────────── */
function FloatCard({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute glass-card-light rounded-2xl shadow-2xl shadow-black/20 px-3 py-2.5 flex items-center gap-2.5 ${className}`}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6 + delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        animation: `float ${3.5 + delay}s ease-in-out ${delay}s infinite`,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Browser Mockup (hero visual) ─────────────────────── */
function BrowserMockup() {
  return (
    <div className="relative bg-white/95 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] border border-white/20 overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-[#1E293B] px-4 py-3 flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-[#0F172A] rounded-md px-3 py-1.5 text-xs text-[#64748B] font-mono flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
          <span className="text-[#2DD4BF]">prolx.cloud</span>
        </div>
      </div>
      {/* Page content skeleton */}
      <div className="p-5 bg-gradient-to-br from-[#F0FDFA] to-white space-y-3">
        {/* Nav bar skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-16 bg-[#0D9488]/20 rounded-full" />
          <div className="flex gap-2">
            <div className="h-3 w-10 bg-slate-200 rounded-full" />
            <div className="h-3 w-10 bg-slate-200 rounded-full" />
            <div className="h-3 w-10 bg-slate-200 rounded-full" />
          </div>
          <div className="h-6 w-20 bg-[#0D9488] rounded-lg" />
        </div>
        {/* Hero skeleton */}
        <div className="h-8 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] rounded-full w-3/4 opacity-80" />
        <div className="h-3 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-5/6" />
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="h-16 bg-[#F0FDFA] rounded-xl border border-[#CCFBF1]" />
          <div className="h-16 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl" />
          <div className="h-16 bg-[#F0FDFA] rounded-xl border border-[#CCFBF1]" />
        </div>
        <div className="h-8 bg-[#0D9488] rounded-lg w-2/5 mt-2" />
      </div>
    </div>
  );
}

/* ── Phone Mockup ─────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative w-[88px] bg-[#1E293B] rounded-[20px] shadow-xl border-2 border-[#334155] overflow-hidden">
      {/* Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#0F172A] rounded-full z-10" />
      <div className="pt-6 pb-3 px-2 space-y-1.5">
        <div className="h-10 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-lg" />
        <div className="h-3 bg-white/10 rounded-full" />
        <div className="h-3 bg-white/10 rounded-full w-4/5" />
        <div className="grid grid-cols-2 gap-1 mt-1">
          <div className="h-8 bg-white/10 rounded-md" />
          <div className="h-8 bg-white/5 rounded-md" />
        </div>
        <div className="h-5 bg-[#0D9488]/70 rounded-md" />
      </div>
    </div>
  );
}

/* ── Dashboard Chart ──────────────────────────────────── */
function DashboardCard() {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="w-[170px] glass-card-light rounded-xl shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-[#0F172A]">Revenue Growth</span>
        <span className="text-[9px] text-[#0D9488] font-bold bg-[#F0FDFA] px-1.5 py-0.5 rounded-full">+32%</span>
      </div>
      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-12">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 5
                ? "linear-gradient(180deg, #0D9488, #2DD4BF)"
                : "rgba(13,148,136,0.2)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp size={10} className="text-[#0D9488]" />
        <span className="text-[9px] text-[#64748B]">Last 7 months</span>
      </div>
    </div>
  );
}

/* ── Parallax Device Cluster ──────────────────────────── */
function DeviceCluster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateY = useTransform(springX, [-1, 1], [-6, 6]);
  const rotateX = useTransform(springY, [-1, 1], [4, -4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set((e.clientX - cx) / (rect.width / 2));
    mouseY.set((e.clientY - cy) / (rect.height / 2));
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg h-[500px] flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main browser mockup with 3D perspective tilt */}
      <motion.div
        className="relative z-10 w-full"
        style={{ rotateY, rotateX, transformPerspective: 1000 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <BrowserMockup />
        </motion.div>
      </motion.div>

      {/* Floating phone — top right */}
      <motion.div
        className="absolute -right-8 -top-10 z-20 animate-float animate-float-delay-1"
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        <PhoneMockup />
      </motion.div>

      {/* Floating dashboard card — bottom left */}
      <motion.div
        className="absolute -left-16 bottom-8 z-20 animate-float-slow animate-float-delay-2"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
      >
        <DashboardCard />
      </motion.div>

      {/* 🚀 Launched badge */}
      <FloatCard className="left-0 top-8 z-30" delay={0.2}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center text-sm">
          🚀
        </div>
        <div>
          <div className="text-[9px] text-[#64748B] font-medium">Launched</div>
          <div className="font-bold text-[#0F172A] text-sm font-mono leading-none">15+ Projects</div>
        </div>
      </FloatCard>

      {/* ★ Rating badge */}
      <FloatCard className="right-0 bottom-16 z-30" delay={0.4}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-[#FBBF24] flex items-center justify-center">
          <Star size={14} className="text-white fill-white" />
        </div>
        <div>
          <div className="text-[9px] text-[#64748B] font-medium">Client Rating</div>
          <div className="font-bold text-[#0F172A] text-sm font-mono leading-none">5.0 / 5.0</div>
        </div>
      </FloatCard>

      {/* PageSpeed */}
      <FloatCard className="right-4 top-2 z-30" delay={0.6}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
          <Zap size={13} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-[#0F172A] text-sm font-mono leading-none">98</div>
          <div className="text-[9px] text-[#64748B]">PageSpeed</div>
        </div>
      </FloatCard>

      {/* Notification card */}
      <FloatCard className="left-8 bottom-4 z-30 animate-float-delay-3" delay={0.8}>
        <CheckCircle2 size={16} className="text-[#0D9488] shrink-0" />
        <div>
          <div className="text-[9px] text-[#64748B]">Just delivered</div>
          <div className="font-bold text-[#0F172A] text-xs leading-none">E-commerce site ✓</div>
        </div>
      </FloatCard>
    </div>
  );
}

/* ── Hero Section ─────────────────────────────────────── */
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function HeroSection() {
  const [hovered, setHovered] = useState<"primary" | "secondary" | null>(null);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* ── Animated orbs — Soft Light ── */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#0D9488]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6366F1]/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#0891B2]/5 blur-[80px] pointer-events-none" />
      
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#6366F1]" />

      {/* ── Dot grid overlay ── */}
      <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

      {/* ── Moving light beam ── */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 w-64 h-[2px] bg-gradient-to-r from-transparent via-[#0D9488]/20 to-transparent animate-beam" />
      </div>

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left Content ── */}
          <motion.div variants={container} initial="hidden" animate="visible">
            {/* Status badge */}
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-8 font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                Available for new projects
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.05] mb-6 text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              <span className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] bg-clip-text text-transparent">We Build</span>
              <br />
              <span>Modern Websites</span>
              <br />
              <span>&amp; Apps That{" "}</span>
              <em
                className="text-[#0D9488]"
                style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
              >
                Help You Grow.
              </em>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={item} className="text-[#64748B] text-lg mb-10 max-w-lg leading-relaxed">
              We partner with startups and businesses worldwide to build scalable
              digital products — from landing pages to full-stack SaaS platforms and mobile apps.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/contact"
                id="hero-start-project"
                className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-base shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20"
                onMouseEnter={() => setHovered("primary")}
                onMouseLeave={() => setHovered(null)}
              >
                Start Your Project
                <motion.span
                  animate={{ x: hovered === "primary" ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </Link>
              <Link
                href="/portfolio"
                id="hero-view-work"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-base shadow-sm"
              >
                View Our Work
              </Link>
            </motion.div>

            {/* Value highlights */}
            <motion.div variants={item} className="flex flex-wrap gap-6">
              {[
                { icon: Zap, label: "Fast Delivery", sub: "2–4 weeks" },
                { icon: Code2, label: "Modern Stack", sub: "Next.js + Supabase" },
                { icon: HeartHandshake, label: "Client-First", sub: "Always responsive" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center">
                    <Icon size={14} className="text-[#0D9488]" />
                  </div>
                  <div>
                    <div className="text-[#0F172A] font-semibold text-xs leading-none mb-0.5">{label}</div>
                    <div className="text-[#64748B] text-[10px] font-mono">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Device cluster ── */}
          <div className="hidden lg:flex justify-center items-center">
            <DeviceCluster />
          </div>
        </div>
      </div>

      {/* ── Bottom fade (now pure white) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-white pointer-events-none" />
    </section>
  );
}
