import { Globe, Code2, Smartphone, Palette, ShoppingBag, Settings } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "Fast, SEO-optimized websites built to convert visitors into customers.",
  },
  {
    icon: Code2,
    title: "Custom Web Apps",
    desc: "Scalable web applications built with modern frameworks and clean architecture.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Cross-platform apps for iOS and Android using React Native.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Clean, intuitive designs that prioritize user experience and conversion.",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Development",
    desc: "High-converting online stores on Shopify or custom-built platforms.",
  },
  {
    icon: Settings,
    title: "Website Maintenance",
    desc: "Ongoing updates, security monitoring, and performance optimization.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-[#F0FDFA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            What We Do
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Services Built for{" "}
            <em
              className="not-italic text-[#0D9488]"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              Impact
            </em>
          </h2>
          <p className="text-[#64748B] text-base max-w-xl mx-auto">
            From design to deployment — we cover the full digital spectrum so you
            can focus on growing your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#2DD4BF] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center mb-4 group-hover:bg-[#CCFBF1] transition-colors">
                <Icon size={22} className="text-[#0D9488]" />
              </div>
              <h3
                className="text-lg font-bold text-[#0F172A] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/services"
            id="services-view-all"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#0D9488] hover:text-white transition-all"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
