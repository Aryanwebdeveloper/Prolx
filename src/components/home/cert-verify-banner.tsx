import ScrollReveal from "@/components/scroll-reveal";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function CertVerifyBanner() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0FDFA] via-white to-[#F0FDFA] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal direction="scale">
          <div className="max-w-3xl mx-auto glass-card-light rounded-2xl border border-[#CCFBF1] p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-[0_8px_40px_rgba(13,148,136,0.12)]">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] flex items-center justify-center shrink-0 shadow-lg">
              <Shield size={28} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#CCFBF1] text-[#0D9488] text-xs font-bold px-3 py-1 rounded-full mb-2 font-mono">
                Trust Feature
              </div>
              <h3
                className="text-xl font-bold text-[#0F172A] mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Certificate Verification Portal
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Verify the authenticity of any Prolx-issued certificate instantly. Our
                blockchain-inspired verification system ensures complete trust and transparency.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/certificates"
              className="glow-btn shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl text-sm whitespace-nowrap"
            >
              Verify Certificate
              <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
