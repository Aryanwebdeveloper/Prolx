"use client";

import Link from "next/link";
import { Calendar, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { motion } from "framer-motion";

export default function BookingSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#CCFBF1]/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0FDFA]/80 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0D9488 1px, transparent 1px), linear-gradient(90deg, #0D9488 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal direction="scale" className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFBF1] text-[#0D9488] text-sm font-bold mb-7">
            <Calendar size={15} />
            <span>Free Consultation</span>
          </div>

          {/* Heading */}
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-6 leading-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Not sure where to start?{" "}
            <span className="text-gradient-teal">Let&apos;s talk.</span>
          </h2>

          <p className="text-[#64748B] text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Book a free 30-minute call. We&apos;ll listen to your goals, answer your
            questions, and figure out the best path forward — no pressure.
          </p>

          {/* Trust chips */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-10">
            {[
              { icon: Calendar,      text: "30-min call",       bg: "bg-[#F0FDFA] border-[#CCFBF1]" },
              { icon: MessageSquare, text: "No sales pitch",     bg: "bg-[#F0FDFA] border-[#CCFBF1]" },
              { icon: CheckCircle2,  text: "Actionable advice",  bg: "bg-[#F0FDFA] border-[#CCFBF1]" },
            ].map(({ icon: Icon, text, bg }) => (
              <div
                key={text}
                className={`flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] px-4 py-2.5 rounded-full border ${bg}`}
              >
                <Icon size={15} className="text-[#0D9488]" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/book-consultation"
            id="book-consultation-cta"
            className="glow-btn inline-flex items-center gap-2.5 px-10 py-4.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-lg shadow-xl"
            style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
          >
            Book a Free Call
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight size={20} />
            </motion.span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
