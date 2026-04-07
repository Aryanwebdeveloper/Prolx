"use client";

import Link from "next/link";
import { Calendar, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";

export default function BookingSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#CCFBF1]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#F0FDFA]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CCFBF1] text-[#0D9488] text-sm font-bold mb-6">
            <Calendar size={15} />
            <span>Free Consultation</span>
          </div>

          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-5 leading-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Not sure where to start?{" "}
            <span className="text-[#0D9488]">Let&apos;s talk.</span>
          </h2>

          <p className="text-[#64748B] text-base mb-8 max-w-md mx-auto">
            Book a free 30-minute call. We&apos;ll listen to your goals, answer your
            questions, and figure out the best path forward — no pressure.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            {[
              { icon: Calendar, text: "30-min call" },
              { icon: MessageSquare, text: "No sales pitch" },
              { icon: CheckCircle2, text: "Actionable advice" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[#64748B]">
                <Icon size={15} className="text-[#0D9488]" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/book-consultation"
            id="book-consultation-cta"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-100 group"
          >
            Book a Free Call
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
