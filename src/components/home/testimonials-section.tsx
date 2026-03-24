"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Prolx completely transformed our online presence. Our conversion rate tripled in just 3 months after the redesign. The team is exceptional — professional, creative, and truly invested in our success.",
    name: "Sarah Mitchell",
    company: "CEO, FinEdge Technologies",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    rating: 5,
  },
  {
    quote: "From concept to launch in 6 weeks — I was blown away. The mobile app they built for us has a 4.9-star rating on both stores. Prolx understands both design and engineering at a world-class level.",
    name: "James Okonkwo",
    company: "Founder, MedCare Solutions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    rating: 5,
  },
  {
    quote: "The SEO work Prolx did for us generated a 240% increase in organic traffic within 4 months. Their digital marketing team is analytical, strategic, and transparent. Highly recommend.",
    name: "Priya Sharma",
    company: "Marketing Director, Bloom Retail",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-24 bg-[#F0FDFA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Testimonials
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Words from Our{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Clients
            </em>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-[#E2E8F0] text-center relative">
            {/* Large quote mark */}
            <div
              className="text-8xl text-[#CCFBF1] leading-none font-serif absolute top-4 left-8 select-none"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              "
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={18} className="text-[#F97316] fill-current" />
              ))}
            </div>

            <blockquote
              className="text-[#0F172A] text-lg md:text-xl leading-relaxed mb-8 relative z-10"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              "{t.quote}"
            </blockquote>

            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#CCFBF1]">
                <Image src={t.avatar} alt={t.name} width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[#0F172A] text-sm">{t.name}</div>
                <div className="text-[#64748B] text-xs">{t.company}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-[#0D9488] w-6" : "bg-[#CCFBF1]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
