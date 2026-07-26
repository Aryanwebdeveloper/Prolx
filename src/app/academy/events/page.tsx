"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronRight, ArrowRight, Video, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { getAcademyEvents } from "@/app/academy-actions";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const data = await getAcademyEvents();
      setEvents(data);
      setLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="bg-[#060D18] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">Events & Workshops</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={15} /> Free & Paid Sessions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Events, Workshops & <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Bootcamps</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Upgrade your skills with live interactive sessions, hands-on coding challenges, and career bootcamps.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={32} className="animate-spin text-[#0D9488] mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-sm">Loading upcoming workshops and events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <Calendar size={48} className="mx-auto mb-4 text-[#7C3AED] opacity-40" />
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Events Scheduled</h3>
            <p className="text-[#64748B] text-sm mb-6">
              There are no live workshops scheduled right now. Check back soon or book a free demo session.
            </p>
            <Link href="/academy/demo" className="px-6 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm inline-block">
              Book Free Demo Session
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const total = event.total_seats || 100;
              const registered = event.registered_count || 0;
              const seatsLeft = total - registered;
              const isFull = seatsLeft <= 0;

              return (
                <div key={event.id} className="bg-white border border-slate-100 rounded-2xl p-7 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] text-xs font-bold px-3 py-1 rounded-full">
                          {event.event_type || "Workshop"}
                        </span>
                        {event.is_free ? (
                          <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold px-3 py-1 rounded-full">
                            FREE
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                            PKR {Number(event.ticket_price || 0).toLocaleString()}
                          </span>
                        )}
                        {isFull && (
                          <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full">
                            Seats Full
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {event.title}
                      </h2>

                      <p className="text-sm text-[#64748B] leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-5 text-xs text-[#64748B] font-medium pt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#0D9488]" /> {event.event_date || "TBD"}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#0D9488]" /> {event.start_time || ""} - {event.end_time || ""}</span>
                        <span className="flex items-center gap-1.5"><Video size={14} className="text-[#0D9488]" /> {event.event_mode || "Online"}</span>
                        {event.speaker_name && <span className="flex items-center gap-1.5"><Users size={14} className="text-[#0D9488]" /> Speaker: {event.speaker_name}</span>}
                      </div>
                    </div>

                    <div className="md:text-right shrink-0">
                      <div className="text-xs text-[#64748B] mb-2 font-medium">
                        {isFull ? (
                          <span className="text-red-500 font-bold">Registration Closed</span>
                        ) : (
                          <span>{seatsLeft} of {total} seats available</span>
                        )}
                      </div>
                      <Link
                        href={isFull ? "#" : "/academy/demo"}
                        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                          isFull
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                            : "bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white hover:opacity-90 shadow-md shadow-teal-500/10"
                        }`}
                      >
                        {isFull ? "Seats Full" : "Register Now"} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
