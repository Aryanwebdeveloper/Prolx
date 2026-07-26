"use client";

import { XCircle, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const problems = [
  "Outdated website that doesn't reflect your brand",
  "Low search engine visibility and organic traffic",
  "No mobile-friendly or fast-loading experience",
  "Struggling to convert visitors into customers",
  "Unclear or inconsistent brand identity",
  "No time to manage or update your site yourself",
];

const solutions = [
  "Modern, fast websites built to impress and convert",
  "SEO-optimized pages that help you get discovered",
  "Mobile-first designs that load fast on any device",
  "Clear user journeys designed to drive action",
  "Cohesive branding that builds recognition and trust",
  "Easy-to-manage or fully maintained by our team",
];

function ListColumn({
  items,
  type,
  delay = 0,
}: {
  items: string[];
  type: "problem" | "solution";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const isProblem = type === "problem";

  return (
    <div
      ref={ref}
      className={`rounded-2xl p-7 border h-full ${
        isProblem
          ? "bg-red-50/80 border-red-100"
          : "bg-[#F0FDFA] border-[#CCFBF1]"
      }`}
    >
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isProblem ? "bg-red-100" : "bg-[#CCFBF1]"
          }`}
        >
          {isProblem ? (
            <XCircle size={16} className="text-red-500" />
          ) : (
            <CheckCircle size={16} className="text-[#0D9488]" />
          )}
        </div>
        <h3
          className={`text-base font-bold ${isProblem ? "text-[#0F172A]" : "text-[#0F172A]"}`}
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {isProblem ? "Common Challenges" : "The Prolx Approach"}
        </h3>
      </div>

      <ul className="space-y-3.5">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: isProblem ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: delay + i * 0.08, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            {isProblem ? (
              <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={16} className="text-[#0D9488] mt-0.5 shrink-0" />
            )}
            <span className="text-[#64748B] text-sm leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0D9488 0, #0D9488 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal direction="up" className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-2 rounded-full mb-5 font-mono">
            The Problem &amp; Solution
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Sound Familiar?{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              We Can Help.
            </em>
          </h2>
          <p className="text-[#64748B] text-lg max-w-md mx-auto">
            We help startups and local businesses overcome these exact challenges with
            focused digital solutions.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <ListColumn items={problems} type="problem" delay={0.1} />
          <ListColumn items={solutions} type="solution" delay={0.2} />
        </div>
      </div>
    </section>
  );
}
