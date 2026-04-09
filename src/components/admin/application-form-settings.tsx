"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Eye, Loader2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { getApplicationFormSettings, saveApplicationFormSettings } from "@/app/careers-actions";

// Form field configuration type (defined here to avoid "use server" export issues)
type FormFieldConfig = {
  name: { enabled: boolean; required: boolean; label: string };
  email: { enabled: boolean; required: boolean; label: string };
  phone: { enabled: boolean; required: boolean; label: string };
  portfolio_url: { enabled: boolean; required: boolean; label: string };
  resume: { enabled: boolean; required: boolean; label: string };
  experience: { enabled: boolean; required: boolean; label: string };
  location: { enabled: boolean; required: boolean; label: string };
  expected_salary: { enabled: boolean; required: boolean; label: string };
  notice_period: { enabled: boolean; required: boolean; label: string };
  message: { enabled: boolean; required: boolean; label: string };
};

const DEFAULT_FORM_FIELDS: FormFieldConfig = {
  name: { enabled: true, required: true, label: "Full Name" },
  email: { enabled: true, required: true, label: "Email Address" },
  phone: { enabled: true, required: true, label: "Phone Number" },
  portfolio_url: { enabled: true, required: false, label: "Portfolio / LinkedIn URL" },
  resume: { enabled: true, required: true, label: "Resume / CV" },
  experience: { enabled: true, required: true, label: "Years of Experience" },
  location: { enabled: true, required: false, label: "Current Location" },
  expected_salary: { enabled: true, required: false, label: "Expected Salary" },
  notice_period: { enabled: true, required: false, label: "Notice Period" },
  message: { enabled: true, required: false, label: "Cover Letter / Message" },
};

export default function ApplicationFormSettings() {
  const [fields, setFields] = useState<FormFieldConfig>(DEFAULT_FORM_FIELDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await getApplicationFormSettings();
    if (data) {
      setFields(data);
    }
    if (error) {
      setError("Failed to load settings");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await saveApplicationFormSettings(fields);
    setSaving(false);
    if (error) {
      setError("Failed to save settings");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default settings? All customizations will be lost.")) {
      setFields(DEFAULT_FORM_FIELDS);
    }
  };

  const updateField = (key: keyof FormFieldConfig, updates: Partial<FormFieldConfig[keyof FormFieldConfig]>) => {
    setFields(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-[#0D9488] mb-4" />
        <p className="text-[#64748B]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#0F172A] text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Application Form Settings
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Customize which fields appear in the job application form and set their requirements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium rounded-xl hover:bg-[#F8FAFC] transition-all"
            >
              <RotateCcw size={16} />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#94A3B8] text-white text-sm font-semibold rounded-xl transition-all"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {saved && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* Form Fields Configuration */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="font-semibold text-[#0F172A]">Form Fields</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Enable/disable fields and set requirements</p>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {Object.entries(fields).map(([key, field]) => (
            <div key={key} className="p-4 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors">
              {/* Enable Toggle */}
              <button
                onClick={() => updateField(key as keyof FormFieldConfig, { enabled: !field.enabled })}
                className={`flex-shrink-0 ${field.enabled ? "text-[#0D9488]" : "text-[#94A3B8]"}`}
              >
                {field.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>

              {/* Field Label Input */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-[#64748B] uppercase tracking-wider mb-1">Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(key as keyof FormFieldConfig, { label: e.target.value })}
                  disabled={!field.enabled}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#0D9488] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                />
              </div>

              {/* Required Toggle */}
              <div className="flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(key as keyof FormFieldConfig, { required: e.target.checked })}
                    disabled={!field.enabled}
                    className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488] disabled:opacity-50"
                  />
                  <span className={`text-sm ${field.enabled ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>Required</span>
                </label>
              </div>

              {/* Field Type Badge */}
              <div className="flex-shrink-0 w-24">
                <span className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] text-xs rounded-full capitalize">
                  {key.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2">
          <Eye size={18} className="text-[#0D9488]" />
          <h3 className="font-semibold text-[#0F172A]">Form Preview</h3>
        </div>
        <div className="p-6">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-sm font-medium text-[#0F172A] mb-4">Apply: Sample Position</p>
            {Object.entries(fields)
              .filter(([_, field]) => field.enabled)
              .map(([key, field]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
                    {field.label}{field.required ? " *" : ""}
                  </label>
                  {key === "message" ? (
                    <div className="w-full h-20 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]" />
                  ) : key === "experience" || key === "notice_period" ? (
                    <div className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]" />
                  ) : key === "resume" ? (
                    <div className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2">
                      <span className="text-xs text-[#64748B]">Upload PDF or DOC</span>
                    </div>
                  ) : (
                    <div className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]" />
                  )}
                </div>
              ))}
            <div className="w-full h-11 bg-[#0D9488] rounded-xl mt-4" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#F0FDFA] rounded-2xl border border-[#CCFBF1] p-4">
        <h4 className="font-medium text-[#0D9488] mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          Important Notes
        </h4>
        <ul className="text-sm text-[#0F172A] space-y-1 ml-6 list-disc">
          <li>Changes take effect immediately after saving</li>
          <li>At least Name and Email should be enabled and required</li>
          <li>Resume uploads are stored in Supabase Storage "career-applications" bucket</li>
          <li>Maximum resume file size is 5MB (PDF, DOC, DOCX only)</li>
        </ul>
      </div>
    </div>
  );
}
