import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import HeroSection from "@/components/home/hero-section";
import TrustBar from "@/components/home/trust-bar";
import ServicesSection from "@/components/home/services-section";
import ProblemSolutionSection from "@/components/home/problem-solution";
import WhyChooseSection from "@/components/home/why-choose-section";
import ProcessSection from "@/components/home/process-section";
import PortfolioPreview from "@/components/home/portfolio-preview";
import TestimonialsSection from "@/components/home/testimonials-section";
import IndustriesTechSection from "@/components/home/industries-tech";
import CertVerifyBanner from "@/components/home/cert-verify-banner";
import BookingSection from "@/components/home/booking-section";
import CTABanner from "@/components/home/cta-banner";
import BackToTop from "@/components/back-to-top";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />
      <HeroSection />
      <TrustBar />
      <ServicesSection />
      <ProblemSolutionSection />
      <WhyChooseSection />
      <ProcessSection />
      <PortfolioPreview />
      <TestimonialsSection />
      <IndustriesTechSection />
      <BookingSection />
      <CertVerifyBanner />
      <CTABanner />
      <ProlxFooter />
      <BackToTop />
    </div>
  );
}
