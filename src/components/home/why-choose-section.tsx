import { Zap, MessageSquare, Code2, HeartHandshake, DollarSign, Shield } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Fast Turnaround",
    desc: "We move quickly. Most projects go from kickoff to launch in 2–4 weeks.",
  },
  {
    icon: MessageSquare,
    title: "Quick Communication",
    desc: "You'll always hear back within hours — no waiting days for a response.",
  },
  {
    icon: Code2,
    title: "Modern Tech Stack",
    desc: "Next.js, Supabase, React Native — we use tools that scale with your business.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Service",
    desc: "We treat every project like it's our own, with dedicated attention and care.",
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    desc: "Startup-friendly pricing with transparent quotes. No hidden fees, ever.",
  },
  {
    icon: Shield,
    title: "Quality You Can Trust",
    desc: "Clean code, tested across devices, and delivered on time.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Why Prolx
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Real Strengths,{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Not Big Claims
            </em>
          </h2>
          <p className="text-[#64748B] text-base max-w-xl mx-auto">
            We&apos;re a small, focused team that prioritizes quality, communication,
            and getting things done right — the first time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex gap-4 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#F0FDFA] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#CCFBF1] flex items-center justify-center shrink-0 group-hover:bg-[#0D9488] transition-colors">
                <Icon size={20} className="text-[#0D9488] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3
                  className="font-bold text-[#0F172A] mb-1 text-sm"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
