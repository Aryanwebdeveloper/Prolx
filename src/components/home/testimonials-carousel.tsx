"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  company: string;
  avatar?: string;
  rating: number;
}

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  };

  const t = testimonials[index];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.96 }),
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Card */}
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white rounded-3xl p-10 md:p-14 shadow-[0_30px_80px_rgba(13,148,136,0.12)] border border-[#E2E8F0] text-center relative overflow-hidden"
          >
            {/* Decorative quote mark */}
            <div
              className="absolute -top-4 left-8 text-[120px] leading-none font-serif text-[#0D9488]/8 select-none pointer-events-none"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              &ldquo;
            </div>

            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0FDFA] rounded-bl-full opacity-60 -z-10" />

            {/* Stars */}
            <div className="flex justify-center gap-1.5 mb-7 relative z-10">
              {Array.from({ length: t.rating }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Star size={20} className="text-[#F97316] fill-[#F97316]" />
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <blockquote
              className="text-[#0F172A] text-lg md:text-xl leading-relaxed mb-8 relative z-10 font-medium"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0D9488]/30 ring-2 ring-[#CCFBF1]">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center text-white font-bold text-lg">
                      {t.name[0]}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0D9488] rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-[#0F172A] text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {t.name}
                </div>
                <div className="text-xs text-[#64748B]">{t.company}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] flex items-center justify-center transition-all group"
          aria-label="Previous"
        >
          <ChevronLeft size={18} className="text-[#64748B] group-hover:text-[#0D9488] transition-colors" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className="transition-all duration-300"
              aria-label={`Go to testimonial ${i + 1}`}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  background: i === index ? "#0D9488" : "#E2E8F0",
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border-2 border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] flex items-center justify-center transition-all group"
          aria-label="Next"
        >
          <ChevronRight size={18} className="text-[#64748B] group-hover:text-[#0D9488] transition-colors" />
        </button>
      </div>
    </div>
  );
}
