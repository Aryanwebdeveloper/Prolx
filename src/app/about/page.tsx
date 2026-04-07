import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Award, Users, Globe, Rocket } from "lucide-react";

const milestones = [
  { year: "Jan 2026", title: "Founded", desc: "Prolx was founded in Abbottabad, Pakistan, starting our journey with a small, elite team of innovators." },
  { year: "Feb 2026", title: "Seed Funding & Web Apps", desc: "Won seed money in BIC AUST and delivered our first 2 client web applications with high quality." },
  { year: "Mar 2026", title: "Rapid Growth & Excellence", desc: "Completed 15+ projects in 3 months, showcasing speed and technical excellence using Next.js & modern tools." },
];

const values = [
  { icon: Rocket, title: "Innovation First", desc: "We stay ahead of technology trends so our clients always receive future-proof solutions." },
  { icon: Users, title: "Client Partnership", desc: "We don't just deliver projects — we build long-term partnerships anchored in mutual success." },
  { icon: Award, title: "Quality Without Compromise", desc: "Every line of code, every pixel, every word is crafted to the highest professional standard." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">About Us</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                We&apos;re Prolx —{" "}
                <em
                  style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
                >
                  Your Digital Growth Partner
                </em>
              </h1>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Founded in early 2026 in Abbottabad, Pakistan, Prolx has rapidly grown 
                from a bold vision into a results-driven digital agency. In just three 
                months, we&apos;ve secured seed funding and delivered exceptional value 
                to local and international clients through innovative technology.
              </p>
            </div>
            <div className="relative h-80">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Prolx Team"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Mission, Vision & Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Our Mission", text: "To democratize access to premium digital solutions, helping businesses of every size compete effectively in the digital economy." },
              { label: "Our Vision", text: "To become the most trusted digital agency for growth-focused companies across South Asia, the Middle East, and beyond." },
            ].map(({ label, text }) => (
              <div key={label} className="bg-[#F0FDFA] rounded-2xl p-8 border border-[#CCFBF1]">
                <h3
                  className="text-xl font-bold text-[#0D9488] mb-3"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {label}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{text}</p>
              </div>
            ))}
            <div className="bg-[#0D9488] rounded-2xl p-8">
              <h3
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Our Values
              </h3>
              <ul className="space-y-2">
                {["Transparency", "Excellence", "Innovation", "Integrity", "Impact"].map((v) => (
                  <li key={v} className="flex items-center gap-2 text-teal-100 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-200" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Value cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0F172A] mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</h4>
                  <p className="text-sm text-[#64748B]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Our{" "}
              <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
                Journey
              </em>
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-[#CCFBF1]" />
            <div className="space-y-8">
              {milestones.map(({ year, title, desc }, i) => (
                <div key={`${year}-${i}`} className={`flex gap-6 md:gap-0 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-12" : "pl-12"}`}>
                    <div className="text-[#0D9488] font-mono font-bold text-lg">{year}</div>
                    <h4 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</h4>
                    <p className="text-sm text-[#64748B]">{desc}</p>
                  </div>
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-[#0D9488] text-white shrink-0 items-center justify-center text-xs font-bold relative z-10">
                    {i === milestones.length - 1 ? (
                      <svg viewBox="0 0 128 128" width="20" height="20" fill="currentColor">
                        <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 120C33.1 120 8 94.9 8 64S33.1 8 64 8s56 25.1 56 56-25.1 56-56 56z"/><path d="M101.3 101.3L50.5 35.5V101h-8.8V27h8.8l50.8 65.8V27h8.8v74.3z"/>
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1 md:hidden">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white shrink-0 flex items-center justify-center text-xs font-bold">
                        {i === milestones.length - 1 ? (
                          <svg viewBox="0 0 128 128" width="16" height="16" fill="currentColor">
                            <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 120C33.1 120 8 94.9 8 64S33.1 8 64 8s56 25.1 56 56-25.1 56-56 56z"/><path d="M101.3 101.3L50.5 35.5V101h-8.8V27h8.8l50.8 65.8V27h8.8v74.3z"/>
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="text-[#0D9488] font-mono font-bold text-sm">{year}</div>
                    </div>
                    <h4 className="font-bold text-[#0F172A]">{title}</h4>
                    <p className="text-sm text-[#64748B]">{desc}</p>
                  </div>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "pl-12" : "pr-12"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Meet the{" "}
              <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}>
                Team
              </em>
            </h2>
            <p className="text-[#64748B] mt-2">The talented people behind every Prolx project.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Zain Ahmad", role: "CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
              { name: "Sara Malik", role: "CTO", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
              { name: "Fatima Shah", role: "Lead Designer", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80" },
              { name: "Hassan Ali", role: "Lead Engineer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
            ].map((m) => (
              <div key={m.name} className="text-center group">
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[#E2E8F0] group-hover:border-[#0D9488] transition-colors">
                  <Image src={m.img} alt={m.name} fill className="object-cover" />
                </div>
                <h4 className="font-bold text-[#0F172A] text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{m.name}</h4>
                <p className="text-xs text-[#64748B]">{m.role}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] text-white rounded-xl font-semibold hover:bg-[#0F766E] transition-all text-sm"
            >
              View Full Team
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
