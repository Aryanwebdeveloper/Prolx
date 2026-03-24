import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-[#0D9488] relative overflow-hidden">
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
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-tight"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Let&apos;s Build Something{" "}
          <em
            style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
          >
            Great
          </em>{" "}
          Together.
        </h2>
        <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">
          Ready to elevate your digital presence? Let&apos;s turn your vision into
          a product that drives real business results.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA6C0A] active:scale-95 text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-orange-900/20"
          >
            Start Your Project Today
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all text-lg"
          >
            See Our Work
          </Link>
        </div>
      </div>
    </section>
  );
}
