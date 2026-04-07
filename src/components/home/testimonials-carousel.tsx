"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star as FullStar, CheckCircle2 } from "lucide-react";

export default function TestimonialsCarousel({ testimonials }: { testimonials: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-teal-900/5 border border-slate-100 text-center relative overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0FDFA] rounded-bl-full opacity-50 -z-10" />
        
        {/* Large quote mark */}
        <div
          className="text-9xl text-[#CCFBF1]/60 leading-none font-serif absolute -top-4 left-8 select-none pointer-events-none"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          "
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1.5 mb-8 relative z-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <FullStar 
              key={i} 
              size={20} 
              className={`${i < (t.rating || 5) ? "text-[#F97316] fill-[#F97316]" : "text-slate-200"}`} 
            />
          ))}
        </div>

        <blockquote
          className="text-[#0F172A] text-xl md:text-2xl leading-relaxed mb-10 relative z-10 font-medium"
          style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
        >
          "{t.quote || t.content}"
        </blockquote>

        <div className="flex flex-col items-center justify-center gap-2 relative z-10">
          <div className="text-center">
            <div className="font-bold text-[#0F172A] text-lg mb-1 flex items-center justify-center gap-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {t.name || t.author_name}
              <CheckCircle2 size={18} className="text-[#0D9488]" />
            </div>
            <div className="text-[#64748B] text-sm font-semibold tracking-wide uppercase">{t.company || t.author_role || "Verified Client"}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] hover:shadow-md transition-all active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? "bg-[#0D9488] w-8" : "bg-[#CCFBF1] w-2"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={next}
          className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] hover:shadow-md transition-all active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
