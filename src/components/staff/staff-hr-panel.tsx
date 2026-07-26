"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle2, Clock, AlertCircle, TrendingUp, RefreshCw, Star, Target, Lightbulb, Award, DollarSign } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { getPerformanceReviews, getMyPayslips } from "@/app/erp-actions";
import LeaveRequestPanel from "@/components/staff/leave-request-panel";
import StaffLettersPanel from "@/components/staff/staff-letters-panel";

type LeaveBalance = {
  leave_type: string;
  total_allowed: number;
  taken: number;
  remaining: number;
};

type Project = {
  id: string;
  title: string;
  status: string;
  progress: number;
  end_date?: string;
};

export default function StaffHRPanel({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"leave" | "projects" | "payslips" | "review" | "letters">("leave");
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const [balRes, projRes, payRes, revRes] = await Promise.all([
        supabase.from("leave_balances").select("*, leave_type:leave_types(name)").eq("employee_id", userId),
        supabase
          .from("project_members")
          .select("project:projects(id, title, status, progress, end_date)")
          .eq("user_id", userId),
        getMyPayslips(),
        getPerformanceReviews({ employeeId: userId }),
      ]);

      // Map leave balances
      const balData = (balRes.data || []).map((b: any) => ({
        leave_type: b.leave_type?.name || "Unknown",
        total_allowed: b.total_days || 0,
        taken: b.used_days || 0,
        remaining: (b.total_days || 0) - (b.used_days || 0),
      }));
      setLeaveBalances(balData);

      // Map projects
      const projData = (projRes.data || [])
        .map((pm: any) => pm.project)
        .filter(Boolean);
      setMyProjects(projData as Project[]);

      setPayslips(payRes.data || []);
      setReviews(revRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const tabs = [
    { id: "leave", label: "Leave Balance" },
    { id: "projects", label: "My Projects" },
    { id: "payslips", label: "Payslips" },
    { id: "review", label: "Performance" },
    { id: "letters", label: "My Letters" },
  ] as const;

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          My HR Portal
        </h2>
        <button onClick={load} className="flex items-center gap-1 text-slate-400 hover:text-[#0D9488] font-semibold">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${tab === t.id ? "bg-white shadow text-[#0D9488]" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 py-12 text-center">Loading your HR information...</div>
      ) : (
        <>
          {/* LEAVE BALANCE */}
          {tab === "leave" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {leaveBalances.length === 0 ? (
                  <div className="col-span-3 text-slate-400 text-center py-8 bg-white border rounded-xl">
                    No leave balances configured yet. Contact your HR manager.
                  </div>
                ) : leaveBalances.map(bal => (
                  <div key={bal.leave_type} className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="font-bold text-slate-700 mb-2">{bal.leave_type}</p>
                    <div className="flex justify-between font-semibold mb-2">
                      <span className="text-slate-500">Taken</span>
                      <span className="text-orange-600">{bal.taken} days</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-[#0D9488] rounded-full"
                        style={{ width: `${bal.total_allowed > 0 ? (bal.remaining / bal.total_allowed) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Remaining</span>
                      <span className="text-emerald-600 font-bold">{bal.remaining} days left</span>
                    </div>
                  </div>
                ))}
              </div>
              <LeaveRequestPanel userId={userId} />
            </div>
          )}

          {/* MY PROJECTS */}
          {tab === "projects" && (
            <div className="space-y-3">
              {myProjects.length === 0 ? (
                <div className="text-slate-400 text-center py-12 bg-white border rounded-xl">
                  You are not currently assigned to any projects.
                </div>
              ) : myProjects.map(proj => {
                const isLate = proj.end_date && new Date(proj.end_date) < new Date() && proj.status !== "completed";
                return (
                  <div key={proj.id} className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{proj.title}</h3>
                      <div className="flex items-center gap-1.5">
                        {isLate && <AlertCircle size={12} className="text-rose-500" />}
                        <span className={`text-[9px] font-bold capitalize px-2 py-0.5 rounded ${proj.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                    {proj.end_date && (
                      <p className={`text-[10px] flex items-center gap-1 mb-2 ${isLate ? "text-rose-500 font-semibold" : "text-slate-400"}`}>
                        <Calendar size={10} />
                        Deadline: {new Date(proj.end_date).toLocaleDateString()}
                        {isLate && " (Overdue)"}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0D9488] transition-all"
                          style={{ width: `${proj.progress || 0}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 shrink-0">{proj.progress || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAYSLIPS */}
          {tab === "payslips" && (
            <div className="space-y-4">
              {payslips.length === 0 ? (
                <div className="text-slate-400 text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl p-6">
                  <DollarSign size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No payroll records available yet.</p>
                </div>
              ) : payslips.map(p => (
                <div key={p.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        Payslip: {p.period?.period_label || "Unknown Period"}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Generated on: {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${p.payment_status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                      {p.payment_status || "Pending"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Basic Salary</div>
                      <div className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{p.basic_salary?.toLocaleString()}</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-emerald-600 font-semibold mb-1 uppercase tracking-wider">Allowances</div>
                      <div className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-sm">+{p.total_allowances?.toLocaleString()}</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100">
                      <div className="text-[10px] text-rose-600 font-semibold mb-1 uppercase tracking-wider">Deductions & Tax</div>
                      <div className="font-bold font-mono text-rose-700 dark:text-rose-400 text-sm">-{(Number(p.total_deductions || 0) + Number(p.tax_deduction || 0) + Number(p.advance_deduction || 0)).toLocaleString()}</div>
                    </div>
                    <div className="bg-[#F0FDFA] dark:bg-teal-900/20 p-3 rounded-xl border border-teal-100 flex flex-col justify-center shadow-inner">
                      <div className="text-[10px] text-[#0D9488] font-bold mb-1 uppercase tracking-wider">Net Payable</div>
                      <div className="font-bold font-mono text-[#0D9488] text-lg">{p.net_salary?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PERFORMANCE REVIEWS */}
          {tab === "review" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-slate-400 text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl p-6">
                  <Award size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No performance reviews on record yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Evaluations submitted by your manager or HR will appear here.</p>
                </div>
              ) : reviews.map(rev => (
                <div key={rev.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {rev.review_period} Review ({rev.review_type || "Quarterly"})
                        </span>
                        {rev.overall_rating && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rev.overall_rating}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Evaluated by: <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.reviewer?.full_name || "Manager"}</span> · Date: {new Date(rev.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-[#F0FDFA] border border-[#CCFBF1] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Star size={14} className="text-[#0D9488] fill-[#0D9488]" />
                      <span className="font-bold font-mono text-[#0D9488] text-sm">{rev.overall_score || 0}/10</span>
                    </div>
                  </div>

                  {/* Detailed Review Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {rev.strengths && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border space-y-1">
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Key Strengths
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.strengths}</p>
                      </div>
                    )}

                    {rev.improvements && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border space-y-1">
                        <div className="font-bold text-amber-700 flex items-center gap-1">
                          <Lightbulb size={13} /> Areas for Improvement
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.improvements}</p>
                      </div>
                    )}

                    {rev.goals_for_next_period && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border space-y-1">
                        <div className="font-bold text-indigo-700 flex items-center gap-1">
                          <Target size={13} /> Goals for Next Period
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.goals_for_next_period}</p>
                      </div>
                    )}

                    {rev.recommendations && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border space-y-1">
                        <div className="font-bold text-[#0D9488] flex items-center gap-1">
                          <TrendingUp size={13} /> Recommendations
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.recommendations}</p>
                      </div>
                    )}
                  </div>

                  {/* Ratings breakdown */}
                  {rev.ratings && rev.ratings.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <span className="font-bold text-[#0F172A] dark:text-slate-200 text-xs">Criteria Scores Breakdown</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {rev.ratings.map((r: any) => (
                          <div key={r.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border flex justify-between items-center text-[10px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300 truncate">{r.criteria?.name || "Criterion"}</span>
                            <span className="font-bold font-mono text-[#0D9488] shrink-0 ml-1">{r.score}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* LETTERS TAB */}
          {tab === "letters" && (
            <StaffLettersPanel userId={userId} />
          )}
        </>
      )}
    </div>
  );
}
