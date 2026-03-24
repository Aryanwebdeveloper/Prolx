"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Phone,
  Search,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react";

const consultationTypes = [
  {
    id: "discovery",
    label: "Discovery Call",
    icon: Phone,
    duration: "30 min",
    desc: "A quick introductory call to understand your project goals and see if we're a good fit.",
  },
  {
    id: "scoping",
    label: "Project Scoping",
    icon: Search,
    duration: "60 min",
    desc: "Deep dive into your project requirements, technical needs, timeline, and budget estimation.",
  },
  {
    id: "review",
    label: "Technical Review",
    icon: FileText,
    duration: "45 min",
    desc: "Review your existing codebase or technical architecture with our senior engineers.",
  },
];

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

function generateDates() {
  const dates: { label: string; day: string; date: number; full: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    dates.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.toLocaleDateString("en-US", { month: "short" }),
      date: d.getDate(),
      full: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    });
  }
  return dates;
}

export default function BookConsultationPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    projectDesc: "",
    budget: "",
    timeline: "",
  });

  const dates = generateDates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <ProlxNavbar />
        <section className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1
              className="text-3xl font-bold text-[#0F172A] mb-3"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Consultation Booked!
            </h1>
            <p className="text-[#64748B] mb-2">
              Your{" "}
              {consultationTypes.find((c) => c.id === type)?.label ||
                "consultation"}{" "}
              is scheduled for:
            </p>
            <p className="text-[#0D9488] font-bold text-lg mb-1">
              {dates.find((d) => d.full === selectedDate)?.full || selectedDate}
            </p>
            <p className="text-[#0F172A] font-semibold mb-6">{selectedTime}</p>
            <p className="text-sm text-[#64748B] mb-8">
              We&apos;ve sent a confirmation email to{" "}
              <strong>{form.email || "your email"}</strong>. You&apos;ll
              receive a calendar invite and meeting link shortly.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </section>
        <ProlxFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Book Consultation</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Book a Free{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Consultation
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Schedule a call with our team to discuss your project. No
            commitments — just a conversation about your goals.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {["Type", "Date & Time", "Details"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > i + 1
                      ? "bg-[#0D9488] text-white"
                      : step === i + 1
                        ? "bg-[#0D9488] text-white"
                        : "bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${step === i + 1 ? "text-[#0F172A]" : "text-[#64748B]"}`}
                >
                  {s}
                </span>
                {i < 2 && (
                  <div className="w-12 h-0.5 bg-[#E2E8F0] mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Type */}
          {step === 1 && (
            <div>
              <h2
                className="text-2xl font-bold text-[#0F172A] mb-6"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Select Consultation Type
              </h2>
              <div className="grid gap-4">
                {consultationTypes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setType(c.id)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                      type === c.id
                        ? "border-[#0D9488] bg-[#F0FDFA] shadow-sm"
                        : "border-[#E2E8F0] hover:border-[#2DD4BF]"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        type === c.id ? "bg-[#0D9488]" : "bg-[#CCFBF1]"
                      }`}
                    >
                      <c.icon
                        size={20}
                        className={
                          type === c.id ? "text-white" : "text-[#0D9488]"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[#0F172A]">{c.label}</h3>
                        <span className="text-xs text-[#64748B] flex items-center gap-1">
                          <Clock size={12} /> {c.duration}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B]">{c.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${
                        type === c.id
                          ? "border-[#0D9488] bg-[#0D9488]"
                          : "border-[#E2E8F0]"
                      }`}
                    >
                      {type === c.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => type && setStep(2)}
                  disabled={!type}
                  className="px-6 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2
                className="text-2xl font-bold text-[#0F172A] mb-6"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Pick a Date & Time
              </h2>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-[#0D9488]" /> Available
                  Dates
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {dates.map((d) => (
                    <button
                      key={d.full}
                      onClick={() => setSelectedDate(d.full)}
                      className={`flex flex-col items-center min-w-[72px] py-3 px-3 rounded-xl border transition-all ${
                        selectedDate === d.full
                          ? "border-[#0D9488] bg-[#0D9488] text-white"
                          : "border-[#E2E8F0] hover:border-[#2DD4BF]"
                      }`}
                    >
                      <span className="text-xs font-medium opacity-70">
                        {d.label}
                      </span>
                      <span className="text-xl font-bold">{d.date}</span>
                      <span className="text-xs opacity-70">{d.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-[#0D9488]" /> Available
                    Times
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          selectedTime === t
                            ? "border-[#0D9488] bg-[#0D9488] text-white"
                            : "border-[#E2E8F0] text-[#64748B] hover:border-[#2DD4BF]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3 text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => selectedDate && selectedTime && setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-6 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Questionnaire */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2
                className="text-2xl font-bold text-[#0F172A] mb-6"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Pre-Consultation Details
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Brief Project Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.projectDesc}
                    onChange={(e) =>
                      setForm({ ...form, projectDesc: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors resize-none"
                    placeholder="Tell us about your project goals, target audience, and any specific requirements..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Estimated Budget
                    </label>
                    <select
                      value={form.budget}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488] transition-colors"
                    >
                      <option value="">Select budget range…</option>
                      <option>Under $500</option>
                      <option>$500 – $2,000</option>
                      <option>$2,000 – $5,000</option>
                      <option>$5,000 – $15,000</option>
                      <option>$15,000+</option>
                      <option>Not Sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Desired Timeline
                    </label>
                    <select
                      value={form.timeline}
                      onChange={(e) =>
                        setForm({ ...form, timeline: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488] transition-colors"
                    >
                      <option value="">Select timeline…</option>
                      <option>ASAP</option>
                      <option>1–2 weeks</option>
                      <option>1–2 months</option>
                      <option>3–6 months</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-3 text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] transition-all"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
