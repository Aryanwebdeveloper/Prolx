"use client";

import Link from "next/link";
import { Calendar, ArrowRight, CheckCircle2, Clock, Shield } from "lucide-react";

export default function BookingSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F0FDFA] -skew-x-12 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#CCFBF1]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CCFBF1] text-[#0D9488] text-sm font-bold mb-6">
              <Calendar size={16} />
              <span>Limited Availability</span>
            </div>
            
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] mb-6 leading-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Ready to Scale? <br />
              <span className="text-[#0D9488]">Book a Free</span> Strategy Session.
            </h2>
            
            <p className="text-[#64748B] text-lg mb-8 max-w-lg">
              Get expert advice on your digital product, technical architecture, and growth strategy. No pitch, no pressure — just pure value.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: Clock, text: "30-Minute Deep Dive", desc: "Focus on your immediate challenges" },
                { icon: CheckCircle2, text: "Actionable Roadmap", desc: "Leave with clear next steps" },
                { icon: Shield, text: "No Commitment", desc: "100% free, no strings attached" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-[#0D9488]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm">{item.text}</p>
                    <p className="text-xs text-[#64748B]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl transition-all text-lg shadow-xl shadow-teal-100 group"
            >
              Reserve Your Slot
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Content: Visual Representation of Booking */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#0D9488]/20 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F1F5F9]">
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Upcoming Session</p>
                  <h3 className="text-xl font-bold text-[#0F172A]">Strategy Consultation</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] flex items-center justify-center">
                  <Calendar className="text-[#0D9488]" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Expert" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Asad Ullah</p>
                    <p className="text-xs text-[#64748B]">Senior Technical Architect</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Duration</p>
                    <p className="text-sm font-bold text-[#0F172A]">30 Minutes</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Platform</p>
                    <p className="text-sm font-bold text-[#0F172A]">Google Meet</p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#64748B]">
                    <span>Popular Times</span>
                    <span className="text-[#0D9488]">Available Today</span>
                  </div>
                  <div className="flex gap-2">
                    {["10:00 AM", "2:30 PM", "4:00 PM"].map(time => (
                      <div key={time} className="flex-1 py-2 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] text-center text-[10px] font-bold text-[#0D9488]">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative floating element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#0D9488]/5 rounded-full" />
            </div>

            {/* Floating testimonial-like card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xl max-w-[200px] animate-bounce-slow">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-orange-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-[10px] text-[#64748B] italic">"The most valuable 30 mins we spent this quarter."</p>
              <p className="text-[10px] font-bold text-[#0F172A] mt-1">— CEO, TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Star({ size, fill, className }: { size?: number, fill?: string, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill={fill || "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
