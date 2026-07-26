import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";

export default function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: "linear-gradient(135deg, #0A0F1E, #0D9488, #0891B2, #7C3AED, #0A0F1E)",
          backgroundSize: "300% 300%",
        }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay opacity-20" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      {/* Glowing orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0D9488]/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: "2s" }} />

      {/* Animated light beam */}
      <div className="absolute top-1/2 w-full h-[1px] overflow-hidden pointer-events-none">
        <div className="w-48 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-beam" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <ScrollReveal direction="up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-[#2DD4BF]" />
            Ready to get started?
          </div>

          {/* Headline */}
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-[1.1]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let&apos;s Build Something{" "}
            <em className="text-shimmer" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
              Great
            </em>{" "}
            Together.
          </h2>

          <p className="text-white/70 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Whether you have a clear vision or just an idea — we&apos;re here to help
            you bring it to life. Let&apos;s talk.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              id="cta-start-project"
              className="glow-btn inline-flex items-center gap-2.5 px-9 py-4 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl text-base shadow-[0_8px_30px_rgba(249,115,22,0.4)]"
            >
              Start Your Project
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/portfolio"
              id="cta-view-work"
              className="inline-flex items-center gap-2.5 px-9 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl transition-all text-base backdrop-blur-sm"
            >
              See Our Work
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {[
              { value: "15+",    label: "Projects Delivered" },
              { value: "5.0★",   label: "Client Rating"      },
              { value: "98",     label: "PageSpeed Score"     },
              { value: "100%",   label: "Satisfaction Rate"   },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-white font-mono" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {value}
                </div>
                <div className="text-xs text-white/50 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
