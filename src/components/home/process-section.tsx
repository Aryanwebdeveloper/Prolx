const steps = [
  { num: "01", title: "Discovery Call", desc: "We understand your goals, audience, and what success looks like for your project." },
  { num: "02", title: "Design", desc: "Wireframes and polished UI designs reviewed with you every step of the way." },
  { num: "03", title: "Development", desc: "Clean, scalable code built with modern frameworks and best practices." },
  { num: "04", title: "Review & Test", desc: "Quality checks across devices and browsers to ensure everything is perfect." },
  { num: "05", title: "Launch", desc: "Smooth deployment and go-live support so your launch day is stress-free." },
];

export default function ProcessSection() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
            Our Process
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Simple Process,{" "}
            <em
              style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
            >
              Great Results
            </em>
          </h2>
          <p className="text-[#64748B] text-base max-w-xl mx-auto">
            A transparent, collaborative workflow that keeps you informed and in
            control from day one to launch.
          </p>
        </div>

        {/* Desktop Horizontal Stepper */}
        <div className="hidden md:grid grid-cols-5 gap-4 relative">
          {/* Connector line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-[#CCFBF1] z-0" />

          {steps.map(({ num, title, desc }) => (
            <div key={num} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#0D9488] text-white font-bold flex items-center justify-center mb-4 text-sm shadow-lg shadow-teal-200 font-mono">
                {num}
              </div>
              <h4
                className="font-bold text-[#0F172A] text-sm mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {title}
              </h4>
              <p className="text-[#64748B] text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden space-y-6">
          {steps.map(({ num, title, desc }, i) => (
            <div key={num} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                  {num}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-[#CCFBF1] mt-2" />
                )}
              </div>
              <div className="pb-6">
                <h4
                  className="font-bold text-[#0F172A] mb-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {title}
                </h4>
                <p className="text-[#64748B] text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
