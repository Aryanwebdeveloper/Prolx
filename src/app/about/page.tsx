import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Award, Users, Globe, Rocket } from "lucide-react";

const milestones = [
  { year: "2017", title: "Founded", desc: "Prolx was founded in Karachi with a team of 3 passionate developers." },
  { year: "2018", title: "First 20 Clients", desc: "Reached our first 20 client milestone across Pakistan and UAE." },
  { year: "2019", title: "Expanded Services", desc: "Launched mobile development and digital marketing service lines." },
  { year: "2020", title: "Remote-First", desc: "Transitioned to remote-first model, expanding global reach." },
  { year: "2021", title: "100 Projects", desc: "Celebrated our 100th project delivery with a 98% satisfaction rate." },
  { year: "2023", title: "Global Presence", desc: "Now serving clients in 20+ countries across 5 continents." },
];

const values = [
  { icon: Rocket, title: "Innovation First", desc: "We stay ahead of technology trends so our clients always receive future-proof solutions." },
  { icon: Users, title: "Client Partnership", desc: "We don't just deliver projects — we build long-term partnerships anchored in mutual success." },
  { icon: Award, title: "Quality Without Compromise", desc: "Every line of code, every pixel, every word is crafted to the highest professional standard." },
];

const awards = [
  "Clutch Top Agency 2023", "Upwork Top Rated Plus", "Google Partner", "Shopify Partner",
  "AWS Select Partner", "Best Agency Pakistan 2022",
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
                Founded in 2017 in Karachi, Pakistan, Prolx has grown from a small web studio 
                into a full-service digital agency trusted by startups and enterprises across 20+ 
                countries. We believe every business deserves world-class digital experiences — 
                and we have the talent and process to deliver them.
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
                <div key={year} className={`flex gap-6 md:gap-0 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-12" : "pl-12"}`}>
                    <div className="text-[#0D9488] font-mono font-bold text-lg">{year}</div>
                    <h4 className="font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</h4>
                    <p className="text-sm text-[#64748B]">{desc}</p>
                  </div>
                  <div className="hidden md:flex w-8 h-8 rounded-full bg-[#0D9488] text-white shrink-0 items-center justify-center text-xs font-bold relative z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 md:hidden">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white shrink-0 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <div className="text-[#0D9488] font-mono font-bold">{year}</div>
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

      {/* Awards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-4xl font-bold text-[#0F172A] mb-10"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Awards &amp; Certifications
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {awards.map((a) => (
              <div
                key={a}
                className="px-6 py-3 bg-[#F0FDFA] border border-[#CCFBF1] rounded-full text-[#0D9488] font-semibold text-sm"
              >
                🏆 {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
