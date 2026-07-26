"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, User, Briefcase, Award, CheckSquare, X } from "lucide-react";
import { createClient } from "../../../supabase/client";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "employee" | "project" | "task" | "certificate" | "letter";
  link: string;
};

export default function GlobalSearch({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Trigger search on Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Perform search across tables
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const q = `%${query}%`;
      const searchResults: SearchResult[] = [];

      try {
        const [empRes, projRes, certRes, letterRes] = await Promise.all([
          // Search Profiles/Employees
          supabase
            .from("profiles")
            .select("id, full_name, email, role")
            .ilike("full_name", q)
            .limit(3),
          // Search Projects
          supabase
            .from("projects")
            .select("id, title, status")
            .ilike("title", q)
            .limit(3),
          // Search Certificates
          supabase
            .from("certificates")
            .select("id, title, recipient_name")
            .or(`title.ilike.${q},recipient_name.ilike.${q}`)
            .limit(3),
          // Search Letters
          supabase
            .from("company_letters")
            .select("id, subject, recipient_name")
            .or(`subject.ilike.${q},recipient_name.ilike.${q}`)
            .limit(3),
        ]);

        // Format and push results
        if (empRes.data) {
          empRes.data.forEach((e) => {
            searchResults.push({
              id: e.id,
              title: e.full_name,
              subtitle: `Employee (${e.role})`,
              type: "employee",
              link: "employees",
            });
          });
        }
        if (projRes.data) {
          projRes.data.forEach((p) => {
            searchResults.push({
              id: p.id,
              title: p.title,
              subtitle: `Project (${p.status})`,
              type: "project",
              link: "projects",
            });
          });
        }
        if (certRes.data) {
          certRes.data.forEach((c) => {
            searchResults.push({
              id: c.id,
              title: c.title,
              subtitle: `Certificate issued to ${c.recipient_name}`,
              type: "certificate",
              link: "certificates",
            });
          });
        }
        if (letterRes.data) {
          letterRes.data.forEach((l) => {
            searchResults.push({
              id: l.id,
              title: l.subject,
              subtitle: `Letter for ${l.recipient_name}`,
              type: "letter",
              link: "letters",
            });
          });
        }

        setResults(searchResults);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getResultIcon = (type: string) => {
    if (type === "employee") return <User size={14} className="text-blue-500" />;
    if (type === "project") return <Briefcase size={14} className="text-[#0D9488]" />;
    if (type === "task") return <CheckSquare size={14} className="text-amber-500" />;
    if (type === "certificate") return <Award size={14} className="text-purple-500" />;
    return <FileText size={14} className="text-slate-500" />;
  };

  return (
    <>
      {/* Search trigger button in Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-48 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg focus:outline-none transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Search size={13} />
          <span>Search...</span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border rounded">
          Ctrl+K
        </kbd>
      </button>

      {/* Modal command palette */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-[1px] p-4">
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs text-[#0F172A]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b p-3.5 gap-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, projects, documents..."
                className="flex-1 text-xs focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X size={15} />
              </button>
            </div>

            {/* Results Window */}
            <div className="max-h-80 overflow-y-auto p-2">
              {searching ? (
                <div className="p-8 text-center text-slate-400">Searching records...</div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  {query ? "No matches found." : "Search across entire ERP platform."}
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                        if (onNavigate) onNavigate(res.link);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        {getResultIcon(res.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{res.title}</div>
                        <div className="text-[10px] text-slate-400">{res.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-2 border-t text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center px-4 font-semibold">
              <span>Use arrow keys to navigate</span>
              <span>ESC to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
