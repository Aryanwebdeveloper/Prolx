"use client";

import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  MessageSquare,
  BookOpen,
  ExternalLink,
  Send,
  CheckCircle2,
} from "lucide-react";

const knowledgeBase = [
  { title: "Getting Started with Prolx", href: "#" },
  { title: "How to Submit a Project Brief", href: "#" },
  { title: "Understanding Our Development Process", href: "#" },
  { title: "Post-Launch Support & Maintenance", href: "#" },
  { title: "Billing & Payment FAQ", href: "#" },
  { title: "Accessing Your Project Dashboard", href: "#" },
];

const priorities = ["Low", "Medium", "High", "Critical"];
const categories = [
  "Bug Report",
  "Feature Request",
  "Billing Issue",
  "General Question",
  "Maintenance Request",
  "Account Access",
];

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    priority: "Medium",
    subject: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-[#F0FDFA]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
            <Link href="/" className="hover:text-[#0D9488]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#0D9488]">Support</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            How Can We{" "}
            <em
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                color: "#0D9488",
              }}
            >
              Help?
            </em>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl">
            Need assistance? Submit a support ticket, browse our knowledge base,
            or reach out directly. We&apos;re here for you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Ticket Form */}
            <div className="lg:col-span-2">
              <h2
                className="text-2xl font-bold text-[#0F172A] mb-6"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Submit a Support Ticket
              </h2>

              {submitted ? (
                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-[#0F172A] mb-3"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                  >
                    Ticket Submitted!
                  </h3>
                  <p className="text-[#64748B] mb-2">
                    Your support ticket has been created. Our team will respond
                    within 24 business hours.
                  </p>
                  <p className="text-sm text-[#64748B] mb-6">
                    Ticket Reference: <strong className="text-[#0D9488] font-mono">SUP-{Math.floor(100000 + Math.random() * 900000)}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        category: "",
                        priority: "Medium",
                        subject: "",
                        description: "",
                      });
                    }}
                    className="px-6 py-2.5 bg-[#0D9488] text-white rounded-lg font-semibold text-sm hover:bg-[#0F766E] transition-colors"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
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
                        placeholder="Your name"
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
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Category *
                      </label>
                      <select
                        required
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#0D9488] transition-colors"
                      >
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {priorities.map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() =>
                              setForm({ ...form, priority: p })
                            }
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                              form.priority === p
                                ? p === "Critical"
                                  ? "border-[#EF4444] bg-red-50 text-[#EF4444]"
                                  : p === "High"
                                    ? "border-[#F97316] bg-orange-50 text-[#F97316]"
                                    : "border-[#0D9488] bg-[#F0FDFA] text-[#0D9488]"
                                : "border-[#E2E8F0] text-[#64748B] hover:border-[#2DD4BF]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Subject *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] transition-colors resize-none"
                      placeholder="Provide as much detail as possible about the issue you're experiencing..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-[#0D9488] text-white rounded-lg font-semibold hover:bg-[#0F766E] active:scale-95 transition-all"
                  >
                    <Send size={16} /> Submit Ticket
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Knowledge Base */}
              <div>
                <h3
                  className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  <BookOpen size={18} className="text-[#0D9488]" />
                  Knowledge Base
                </h3>
                <div className="space-y-2">
                  {knowledgeBase.map((article) => (
                    <a
                      key={article.title}
                      href={article.href}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#F0FDFA] transition-all group"
                    >
                      <span className="text-sm text-[#64748B] group-hover:text-[#0F172A] transition-colors">
                        {article.title}
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-[#E2E8F0] group-hover:text-[#0D9488]"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0D9488] flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <h4
                  className="font-bold text-[#0F172A] mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Live Chat
                </h4>
                <p className="text-sm text-[#64748B] mb-4">
                  Chat with our support team in real-time during business hours.
                </p>
                <button className="w-full px-4 py-2.5 bg-[#0D9488] text-white rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors">
                  Start Chat
                </button>
              </div>

              {/* Status Page */}
              <div className="border border-[#E2E8F0] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <h4 className="font-bold text-[#0F172A] text-sm">
                    All Systems Operational
                  </h4>
                </div>
                <p className="text-xs text-[#64748B] mb-3">
                  All services are running normally. Last checked 2 minutes ago.
                </p>
                <a
                  href="#"
                  className="text-sm text-[#0D9488] font-medium flex items-center gap-1 hover:underline"
                >
                  View Status Page <ExternalLink size={12} />
                </a>
              </div>

              {/* Contact */}
              <div className="border border-[#E2E8F0] rounded-2xl p-6">
                <h4
                  className="font-bold text-[#0F172A] mb-3"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Other Ways to Reach Us
                </h4>
                <div className="space-y-2 text-sm text-[#64748B]">
                  <p>
                    📧{" "}
                    <a
                      href="mailto:support@prolx.digital"
                      className="text-[#0D9488] hover:underline"
                    >
                      support@prolx.digital
                    </a>
                  </p>
                  <p>📞 +92 300 1234567</p>
                  <p>
                    💬{" "}
                    <a href="#" className="text-[#0D9488] hover:underline">
                      WhatsApp Support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProlxFooter />
    </div>
  );
}
