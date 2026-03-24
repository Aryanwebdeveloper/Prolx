import Link from "next/link";
import {
  Globe,
  Code2,
  Smartphone,
  Palette,
  PenTool,
  Layers,
  ShoppingBag,
  Box,
  Search,
  BarChart2,
  Cloud,
  Settings,
} from "lucide-react";

const services = [
  { icon: Globe, title: "Website Development", desc: "Blazing-fast, SEO-optimized websites that convert visitors into customers." },
  { icon: Code2, title: "Custom Web Apps", desc: "Scalable web applications built with modern frameworks and clean architecture." },
  { icon: Smartphone, title: "Mobile App Development", desc: "Native and cross-platform apps for iOS and Android that delight users." },
  { icon: Palette, title: "UI/UX Design", desc: "Research-driven designs that balance beauty with intuitive user experience." },
  { icon: PenTool, title: "Graphic Design", desc: "Compelling visual assets that communicate your brand story effectively." },
  { icon: Layers, title: "Branding", desc: "Complete brand identity systems built for recognition and trust." },
  { icon: ShoppingBag, title: "E-commerce Development", desc: "High-converting online stores on Shopify, WooCommerce, or custom platforms." },
  { icon: Box, title: "SaaS Development", desc: "End-to-end SaaS product development from MVP to enterprise scale." },
  { icon: Search, title: "SEO Optimization", desc: "Technical and content SEO strategies that drive sustainable organic growth." },
  { icon: BarChart2, title: "Digital Marketing", desc: "Data-driven campaigns across paid, social, and email channels." },
  { icon: Cloud, title: "Cloud Solutions", desc: "AWS, GCP, and Azure architecture, deployment, and DevOps consulting." },
  { icon: Settings, title: "Website Maintenance", desc: "Ongoing support, updates, security monitoring, and performance optimization." },
];

export default function ServicesSection() {
  return (
    <section className="py-24 bg-[#F0FDFA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            What We Do
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
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
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            From design to deployment — we cover the full digital spectrum so you
            can focus on what matters most: growing your business.
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
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
