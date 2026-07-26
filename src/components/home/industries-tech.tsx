import ScrollReveal from "@/components/scroll-reveal";

const techs = [
  { name: "React",        emoji: "⚛️" },
  { name: "Next.js",      emoji: "▲" },
  { name: "TypeScript",   emoji: "🔷" },
  { name: "Node.js",      emoji: "🟢" },
  { name: "React Native", emoji: "📱" },
  { name: "WordPress",    emoji: "🌐" },
  { name: "Supabase",     emoji: "⚡" },
  { name: "PostgreSQL",   emoji: "🐘" },
  { name: "Figma",        emoji: "🎨" },
  { name: "Tailwind CSS", emoji: "💨" },
  { name: "Shopify",      emoji: "🛒" },
  { name: "Docker",       emoji: "🐳" },
  { name: "Python",       emoji: "🐍" },
  { name: "Electron",     emoji: "⚡" },
  { name: "PHP",          emoji: "🐘" },
];

const industries = [
  { label: "E-commerce",      emoji: "🛒", color: "bg-amber-50   border-amber-200  text-amber-700"  },
  { label: "SaaS & Startups", emoji: "⚡", color: "bg-violet-50  border-violet-200 text-violet-700" },
  { label: "Education",       emoji: "📚", color: "bg-blue-50    border-blue-200   text-blue-700"   },
  { label: "Real Estate",     emoji: "🏠", color: "bg-green-50   border-green-200  text-green-700"  },
  { label: "Healthcare",      emoji: "🏥", color: "bg-red-50     border-red-200    text-red-700"    },
  { label: "Fintech",         emoji: "💳", color: "bg-teal-50    border-teal-200   text-teal-700"   },
  { label: "Non-Profit",      emoji: "🌿", color: "bg-emerald-50 border-emerald-200 text-emerald-700"},
  { label: "Hospitality",     emoji: "🏨", color: "bg-orange-50  border-orange-200 text-orange-700" },
];

export default function IndustriesTechSection() {
  return (
    <section className="py-20 bg-[#0A0F1E] border-t border-white/5 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#0D9488]/6 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7C3AED]/5 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Tech Stack */}
        <ScrollReveal direction="up" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-4 font-mono">
            Tech Stack
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <span className="text-white">Built With </span>
            <em
              className="text-gradient-teal"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              Modern Tools
            </em>
          </h2>
        </ScrollReveal>

        {/* Marquee row 1 (left → right) */}
        <div className="overflow-hidden relative mb-3">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0F1E] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0F1E] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-3 animate-marquee w-max">
            {[...techs, ...techs].map((tech, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm font-mono text-[#94A3B8] hover:text-[#2DD4BF] hover:border-[#0D9488]/40 transition-all cursor-default whitespace-nowrap"
              >
                <span>{tech.emoji}</span>
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee row 2 (right → left) */}
        <div className="overflow-hidden relative mb-16">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0F1E] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0F1E] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-3 animate-marquee-reverse w-max">
            {[...techs.slice().reverse(), ...techs.slice().reverse()].map((tech, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm font-mono text-[#94A3B8] hover:text-[#2DD4BF] hover:border-[#0D9488]/40 transition-all cursor-default whitespace-nowrap"
              >
                <span>{tech.emoji}</span>
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industries */}
        <ScrollReveal direction="up" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-[#0D9488]/30 text-[#2DD4BF] text-sm font-semibold px-4 py-2 rounded-full mb-4 font-mono">
            Industries
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <span className="text-white">Industries We </span>
            <em
              className="text-gradient-teal"
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              Serve
            </em>
          </h2>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-3">
          {industries.map(({ label, emoji, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full border cursor-default hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ${color}`}
            >
              <span>{emoji}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
