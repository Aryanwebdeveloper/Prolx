"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";

const steps = [
  {
    num: "01",
    title: "Discovery Call",
    desc: "We understand your goals, audience, and what success looks like for your project.",
    icon: "🎯",
    color: "#0D9488",
  },
  {
    num: "02",
    title: "Design",
    desc: "Wireframes and polished UI designs reviewed with you every step of the way.",
    icon: "✏️",
    color: "#0891B2",
  },
  {
    num: "03",
    title: "Development",
    desc: "Clean, scalable code built with modern frameworks and best practices.",
    icon: "⚡",
    color: "#7C3AED",
  },
  {
    num: "04",
    title: "Review & Test",
    desc: "Quality checks across devices and browsers to ensure everything is perfect.",
    icon: "🔍",
    color: "#059669",
  },
  {
    num: "05",
    title: "Launch",
    desc: "Smooth deployment and go-live support so your launch day is stress-free.",
    icon: "🚀",
    color: "#F97316",
  },
];

/* ── Single step node (desktop) ─────────────────────────── */
function StepNode({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="relative z-10 flex flex-col items-center text-center group">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: index * 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-5"
      >
        {/* Glow ring on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md"
          style={{ background: step.color, transform: "scale(1.5)" }}
        />
        {/* Circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm font-mono relative z-10 shadow-xl"
          style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
        >
          {step.num}
        </div>
        {/* Emoji reveal */}
        <div className="absolute -top-2 -right-2 text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          {step.icon}
        </div>
      </motion.div>

      <motion.h4
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.15 + 0.15, duration: 0.4 }}
        className="font-bold text-[#0F172A] text-sm mb-2"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {step.title}
      </motion.h4>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.15 + 0.25, duration: 0.4 }}
        className="text-[#64748B] text-xs leading-relaxed max-w-[130px]"
      >
        {step.desc}
      </motion.p>
    </div>
  );
}

/* ── Animated connector between nodes ─────────────────── */
function Connector({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div ref={ref} className="relative flex-1 flex items-start pt-7 mx-1">
      <div className="w-full h-[2px] bg-[#E2E8F0] relative overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          style={{ originX: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Mobile step row ──────────────────────────────────── */
function MobileStep({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="flex gap-5">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs font-mono shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
        >
          {step.num}
        </motion.div>
        {!isLast && (
          <motion.div
            className="w-0.5 flex-1 mt-2 origin-top rounded-full"
            style={{ background: `linear-gradient(180deg, ${step.color}60, transparent)` }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
          />
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
        className="pb-10"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{step.icon}</span>
          <h4
            className="font-bold text-[#0F172A]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {step.title}
          </h4>
        </div>
        <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
      </motion.div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────── */
export default function ProcessSection() {
  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFBF1] to-transparent" />
      <div className="absolute -top-10 right-1/4 w-64 h-64 rounded-full bg-[#0D9488]/5 blur-[60px] pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
            Our Process
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Simple Process,{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
              Great Results
            </em>
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">
            A transparent, collaborative workflow that keeps you informed and in
            control from day one to launch.
          </p>
        </ScrollReveal>

        {/* Desktop — flex row with animated connectors between nodes */}
        <div className="hidden md:flex items-start gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start flex-1">
              <div className="flex-1">
                <StepNode step={step} index={i} />
              </div>
              {i < steps.length - 1 && <Connector index={i} />}
            </div>
          ))}
        </div>

        {/* Mobile — vertical timeline */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => (
            <MobileStep key={step.num} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
