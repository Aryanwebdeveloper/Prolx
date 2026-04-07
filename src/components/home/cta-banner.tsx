import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 bg-[#0D9488] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0F766E]/50 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          Ready to get started?
        </div>
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 max-w-2xl mx-auto leading-tight"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Let&apos;s Build Something{" "}
          <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
            Great
          </em>{" "}
          Together.
        </h2>
        <p className="text-teal-100 text-base mb-8 max-w-md mx-auto">
          Whether you have a clear vision or just an idea — we&apos;re here to help
          you bring it to life. Let&apos;s talk.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            id="cta-start-project"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA6C0A] active:scale-95 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-orange-900/20"
          >
            Start Your Project
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/portfolio"
            id="cta-view-work"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all text-base"
          >
            See Our Work
          </Link>
        </div>
      </div>
    </section>
  );
}
