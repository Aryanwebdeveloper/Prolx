"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronRight, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { getUpcomingBatches } from "@/app/academy-actions";
import { getBatchSeatDisplay } from "@/lib/marketing-stats";

const statusStyle: Record<string, string> = {
  upcoming: "bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]",
  ongoing: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  full: "bg-red-50 text-red-600 border-red-200",
};

const modeIcon: Record<string, string> = {
  online: "🌐",
  physical: "📍",
  hybrid: "🔀",
  self_paced: "📱",
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("All");

  useEffect(() => {
    async function loadBatches() {
      setLoading(true);
      const data = await getUpcomingBatches();
      setBatches(data);
      setLoading(false);
    }
    loadBatches();
  }, []);

  const filtered = batches.filter(b => filterMode === "All" || (b.mode && b.mode.toLowerCase() === filterMode.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-[#060D18] pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D9488] via-[#7C3AED] to-[#F97316]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-[#2DD4BF]">Academy</Link>
            <ChevronRight size={12} />
            <span className="text-[#2DD4BF]">Upcoming Batches</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Upcoming <span className="bg-gradient-to-r from-[#2DD4BF] to-[#A78BFA] bg-clip-text text-transparent">Batches</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Find a batch that fits your schedule. Online, physical, and hybrid options available.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 mb-8">
          {["All", "Online", "Physical", "Hybrid"].map(f => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-all ${
                filterMode === f ? "bg-[#0D9488] text-white border-[#0D9488]" : "bg-white text-[#475569] border-slate-200 hover:border-[#0D9488]"
              }`}
            >
              {f === "All" ? "All Modes" : `${modeIcon[f.toLowerCase()] || "🌐"} ${f}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={32} className="animate-spin text-[#0D9488] mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-sm">Loading upcoming batches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <Calendar size={48} className="mx-auto mb-4 text-[#0D9488] opacity-40" />
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>No Active Batches Scheduled</h3>
            <p className="text-[#64748B] text-sm mb-6">
              New batches are added regularly by our trainers. Book a free demo to get notified when a batch opens.
            </p>
            <Link href="/academy/demo" className="px-6 py-3 bg-[#0D9488] text-white font-bold rounded-xl text-sm inline-block">
              Book Free Demo & Get Notified
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((batch) => {
              const total = batch.total_seats || 30;
              const realEnrolled = batch.enrolled_seats || 0;
              const seatInfo = getBatchSeatDisplay(total, realEnrolled, batch.batch_code || batch.id);

              const days = Array.isArray(batch.class_days) ? batch.class_days.join(", ") : batch.class_days || "Regular";

              return (
                <div key={batch.id} className="bg-white border border-slate-100 rounded-2xl p-7 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${seatInfo.isFull ? statusStyle.full : statusStyle[batch.status] || "bg-slate-100 text-slate-700"} capitalize`}>
                          {seatInfo.isFull ? "Seats Full" : batch.status}
                        </span>
                        <span className="text-xs text-[#64748B] font-mono">{batch.batch_code}</span>
                        <span className="text-xs text-[#64748B] capitalize">{modeIcon[batch.mode] || "🌐"} {batch.mode}</span>
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-lg mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{batch.name}</h3>
                      <p className="text-xs text-[#0D9488] font-semibold mb-3">{batch.course?.title || "Prolx Course"}</p>
                      <div className="flex flex-wrap gap-5 text-sm text-[#64748B]">
                        <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#0D9488]" /> {batch.start_date || "TBD"} → {batch.end_date || "TBD"}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#0D9488]" /> {days} · {batch.class_time || "Flexible"}</span>
                        {batch.instructor_name && <span className="flex items-center gap-1.5"><Users size={13} className="text-[#0D9488]" /> Instructor: {batch.instructor_name}</span>}
                      </div>
                    </div>

                    <div className="md:text-right md:min-w-[200px]">
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[#64748B]">Seats</span>
                          <span className={`font-bold ${seatInfo.isFull ? "text-red-600" : "text-[#EF4444]"}`}>
                            {seatInfo.isFull ? "0 seats left (FULL)" : `${seatInfo.available} seats left!`}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full md:w-48">
                          <div className={`h-full rounded-full transition-all ${seatInfo.isFull ? "bg-red-500" : "bg-gradient-to-r from-[#0D9488] to-[#EF4444]"}`} style={{ width: `${seatInfo.pct}%` }} />
                        </div>
                      </div>

                      {seatInfo.isFull ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed w-full justify-center"
                        >
                          Seats Full (Closed)
                        </button>
                      ) : (
                        <Link
                          href={`/academy/enroll?batch=${batch.batch_code}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white font-bold rounded-xl hover:opacity-90 text-sm w-full justify-center shadow-md shadow-teal-500/10"
                        >
                          Enroll Now <ArrowRight size={14} />
                        </Link>
                      )}
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
