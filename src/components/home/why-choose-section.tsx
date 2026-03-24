import { Trophy, Clock, Users, Code, HeartHandshake, TrendingUp, Shield, Headphones } from "lucide-react";

const reasons = [
  { icon: Trophy, stat: "250+", desc: "Projects delivered on time and on budget" },
  { icon: Clock, stat: "48h", desc: "Average response time for project queries" },
  { icon: Users, stat: "50+", desc: "Dedicated specialists across every discipline" },
  { icon: Code, stat: "15+", desc: "Technologies and frameworks mastered" },
  { icon: HeartHandshake, stat: "98%", desc: "Client retention and satisfaction rate" },
  { icon: TrendingUp, stat: "3x", desc: "Average ROI improvement for clients" },
  { icon: Shield, stat: "100%", desc: "NDA-protected and secure development process" },
  { icon: Headphones, stat: "24/7", desc: "Support and monitoring after launch" },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Why Prolx
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Built for Results,{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Not Just Deliverables
            </em>
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            We measure our success by your growth. Every decision we make is
            anchored in strategy, craftsmanship, and long-term impact.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {reasons.map(({ icon: Icon, stat, desc }) => (
            <div
              key={stat}
              className="group text-center p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#F0FDFA] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0D9488] transition-colors">
                <Icon size={22} className="text-[#0D9488] group-hover:text-white transition-colors" />
              </div>
              <div
                className="text-3xl font-bold text-[#0F172A] mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {stat}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
