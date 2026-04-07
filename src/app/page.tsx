import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import HeroSection from "@/components/home/hero-section";
import TrustBar from "@/components/home/trust-bar";
import ServicesSection from "@/components/home/services-section";
import PortfolioPreview from "@/components/home/portfolio-preview";
import WhyChooseSection from "@/components/home/why-choose-section";
import ProcessSection from "@/components/home/process-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import ProblemSolutionSection from "@/components/home/problem-solution";
import IndustriesTechSection from "@/components/home/industries-tech";
import CertVerifyBanner from "@/components/home/cert-verify-banner";
import BookingSection from "@/components/home/booking-section";
import CTABanner from "@/components/home/cta-banner";
import BackToTop from "@/components/back-to-top";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* 1. Land — first impression */}
      <HeroSection />

      {/* 2. Trust signals — credibility above the fold */}
      <TrustBar />

      {/* 3. Services — what we offer */}
      <ServicesSection />

      {/* 4. Portfolio — proof of work */}
      <PortfolioPreview />

      {/* 5. Why Prolx — differentiation */}
      <WhyChooseSection />

      {/* 6. Process — how we work */}
      <ProcessSection />

      {/* 7. Testimonials — social proof */}
      <TestimonialsSection />

      {/* 8. Problem & Solution — relatability */}
      <ProblemSolutionSection />

      {/* 9. Tech & Industries — credibility */}
      <IndustriesTechSection />

      {/* 10. Certificate Verification — unique trust feature */}
      <CertVerifyBanner />

      {/* 11. Low-commitment CTA — free call */}
      <BookingSection />

      {/* 12. Final push CTA */}
      <CTABanner />

      <ProlxFooter />
      <BackToTop />
    </div>
  );
}
