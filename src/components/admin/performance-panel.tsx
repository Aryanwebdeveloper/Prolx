"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus, TrendingUp, UserRound, CalendarDays, CheckCircle2 } from "lucide-react";
import { getAllProfiles } from "@/app/certificate-actions";
import { createPerformanceReview, getPerformanceReviews, getReviewCriteria } from "@/app/erp-actions";

type Profile = { id: string; full_name: string; email: string; role: string };
type ReviewCriteria = { id: string; name: string; weight: number; description?: string };
type ReviewItem = {
  id: string;
  review_period: string;
  review_type?: string;
  overall_score?: number;
  overall_rating?: string;
  strengths?: string;
  improvements?: string;
  goals_for_next_period?: string;
  recommendations?: string;
  status?: string;
  created_at?: string;
  employee?: { full_name?: string; email?: string };
  reviewer?: { full_name?: string };
};

const defaultForm = {
  employee_id: "",
  review_period: "",
  review_type: "quarterly" as "quarterly" | "annual" | "probation" | "ad_hoc",
  strengths: "",
  improvements: "",
  goals_for_next_period: "",
  recommendations: "",
  ratings: {} as Record<string, string>,
};

export default function PerformancePanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [criteria, setCriteria] = useState<ReviewCriteria[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, criteriaRes, reviewsRes] = await Promise.all([
        getAllProfiles(),
        getReviewCriteria(),
        getPerformanceReviews(),
      ]);

      setProfiles((profilesRes.data as Profile[]) || []);
      setCriteria((criteriaRes.data as ReviewCriteria[]) || []);
      setReviews((reviewsRes.data as ReviewItem[]) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employee_id || !form.review_period) {
      alert("Please select an employee and review period.");
      return;
    }

    const missingRatings = criteria.some((c) => !form.ratings[c.id]);
    if (missingRatings) {
      alert("Please score every review criterion.");
      return;
    }

    setSaving(true);
    try {
      await createPerformanceReview({
        employee_id: form.employee_id,
        review_period: form.review_period,
        review_type: form.review_type,
        strengths: form.strengths,
        improvements: form.improvements,
        goals_for_next_period: form.goals_for_next_period,
        recommendations: form.recommendations,
        ratings: criteria.map((c) => ({
          criteria_id: c.id,
          score: Number(form.ratings[c.id]),
          comment: "",
        })),
      });
      setForm(defaultForm);
      await load();
    } catch (err) {
      alert("Unable to create performance review. " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Performance Review Management
            </h2>
            <p className="text-sm text-[#64748B]">Create structured employee evaluations and review historical submissions.</p>
          </div>
          <button onClick={() => load()} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0D9488]">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Employee</label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
              >
                <option value="">Select employee</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Review Period</label>
                <input
                  value={form.review_period}
                  onChange={(e) => setForm((f) => ({ ...f, review_period: e.target.value }))}
                  placeholder="Q3 2026"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Review Type</label>
                <select
                  value={form.review_type}
                  onChange={(e) => setForm((f) => ({ ...f, review_type: e.target.value as typeof form.review_type }))}
                  className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="probation">Probation</option>
                  <option value="ad_hoc">Ad hoc</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Strengths</label>
              <textarea
                rows={3}
                value={form.strengths}
                onChange={(e) => setForm((f) => ({ ...f, strengths: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Improvements</label>
              <textarea
                rows={3}
                value={form.improvements}
                onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Goals for Next Period</label>
              <textarea
                rows={3}
                value={form.goals_for_next_period}
                onChange={(e) => setForm((f) => ({ ...f, goals_for_next_period: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Recommendations</label>
              <textarea
                rows={3}
                value={form.recommendations}
                onChange={(e) => setForm((f) => ({ ...f, recommendations: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm"
              />
            </div>
            <div className="rounded-xl border border-[#E2E8F0] p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <TrendingUp size={15} className="text-[#0D9488]" /> Review Criteria Scores
              </div>
              {criteria.map((criterion) => (
                <div key={criterion.id}>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">
                    {criterion.name} {criterion.weight ? `· Weight ${criterion.weight}` : ""}
                  </label>
                  <select
                    value={form.ratings[criterion.id] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, ratings: { ...f.ratings, [criterion.id]: e.target.value } }))}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  >
                    <option value="">Select score</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                      <option key={score} value={score}>{score}/10</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />} Save review
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="border-b border-[#E2E8F0] p-4">
          <h3 className="font-semibold text-[#0F172A]">Recent Reviews</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-[#64748B]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">No reviews yet.</div>
        ) : (
          <div className="divide-y divide-[#F8FAFC]">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <UserRound size={14} className="text-[#0D9488]" /> {review.employee?.full_name || "Employee"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">
                      <CalendarDays size={12} /> {review.review_period}
                      <span className="text-[#CBD5E1]">•</span>
                      <span className="capitalize">{review.review_type || "quarterly"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#F0FDFA] px-3 py-1 text-xs font-semibold text-[#0D9488]">
                    <CheckCircle2 size={12} /> {review.overall_score ?? "—"}/10
                  </div>
                </div>
                <div className="mt-3 text-sm text-[#475569]">
                  <div className="font-medium text-[#0F172A]">Strengths</div>
                  <p className="text-[#64748B]">{review.strengths || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
