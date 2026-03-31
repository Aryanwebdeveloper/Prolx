// ERP System Types

// ============================================================
// COMPANY LETTER TYPES & HELPERS
// ============================================================

export type LetterType =
  | "offer_letter"
  | "internship_letter"
  | "paid_internship_letter"
  | "appointment_letter"
  | "experience_letter"
  | "termination_letter"
  | "promotion_letter"
  | "warning_letter"
  | "nda_agreement"
  | "relieving_letter"
  | "salary_certificate"
  | "custom";

export function getLetterTemplateFields(type: LetterType) {
  const base = [
    { key: "recipient_name", label: "Recipient Full Name", type: "text", required: true },
    { key: "date", label: "Letter Date", type: "date", required: true },
  ];

  const templates: Record<LetterType, Array<{ key: string; label: string; type: string; required?: boolean; options?: string[] }>> = {
    offer_letter: [
      ...base,
      { key: "position", label: "Position / Job Title", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "salary", label: "Monthly Salary (PKR)", type: "text", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "probation_months", label: "Probation Period (Months)", type: "number" },
      { key: "office_location", label: "Office Location", type: "text" },
      { key: "reporting_to", label: "Reporting To", type: "text" },
      { key: "extra_notes", label: "Additional Terms / Notes", type: "textarea" },
    ],
    appointment_letter: [
      ...base,
      { key: "position", label: "Position / Designation", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "joining_date", label: "Joining Date", type: "date", required: true },
      { key: "employment_type", label: "Employment Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"] },
      { key: "salary", label: "Monthly Salary (PKR)", type: "text" },
      { key: "extra_notes", label: "Additional Details", type: "textarea" },
    ],
    experience_letter: [
      ...base,
      { key: "position", label: "Position Held", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "joining_date", label: "Date of Joining", type: "date", required: true },
      { key: "leaving_date", label: "Last Working Date", type: "date", required: true },
      { key: "performance", label: "Performance Remarks", type: "select", options: ["Excellent", "Very Good", "Good", "Satisfactory"] },
      { key: "extra_notes", label: "Additional Remarks", type: "textarea" },
    ],
    salary_certificate: [
      ...base,
      { key: "position", label: "Designation", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "salary", label: "Monthly Gross Salary (PKR)", type: "text", required: true },
      { key: "month_year", label: "For Month/Year", type: "text", required: true },
      { key: "bank_name", label: "Bank Name (optional)", type: "text" },
      { key: "account_number", label: "Account Number (optional)", type: "text" },
      { key: "extra_notes", label: "Additional Notes", type: "textarea" },
    ],
    internship_letter: [
      ...base,
      { key: "position", label: "Internship Role / Title", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "duration", label: "Duration (e.g. 3 Months)", type: "text", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "end_date", label: "End Date", type: "date" },
      { key: "working_hours", label: "Working Hours (e.g. 9 AM – 5 PM)", type: "text" },
      { key: "mentor_name", label: "Assigned Mentor / Supervisor", type: "text" },
      { key: "reporting_to", label: "Reporting To", type: "text" },
      { key: "office_location", label: "Office / Remote Location", type: "text" },
      { key: "extra_notes", label: "Additional Terms / Notes", type: "textarea" },
    ],
    paid_internship_letter: [
      ...base,
      { key: "position", label: "Internship Role / Title", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "duration", label: "Duration (e.g. 3 Months)", type: "text", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "end_date", label: "End Date", type: "date" },
      { key: "stipend", label: "Monthly Stipend (PKR)", type: "text", required: true },
      { key: "payment_schedule", label: "Payment Schedule", type: "select", options: ["Monthly", "Bi-weekly", "Upon Completion"] },
      { key: "working_hours", label: "Working Hours (e.g. 9 AM – 5 PM)", type: "text" },
      { key: "mentor_name", label: "Assigned Mentor / Supervisor", type: "text" },
      { key: "reporting_to", label: "Reporting To", type: "text" },
      { key: "office_location", label: "Office / Remote Location", type: "text" },
      { key: "extra_notes", label: "Additional Terms / Notes", type: "textarea" },
    ],
    termination_letter: [
      ...base,
      { key: "position", label: "Position Held", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "termination_date", label: "Last Working Date", type: "date", required: true },
      { key: "reason", label: "Reason for Termination", type: "select", options: ["Performance Issues", "Policy Violation", "Redundancy", "Mutual Agreement", "End of Contract", "Other"], required: true },
      { key: "reason_details", label: "Detailed Reason / Explanation", type: "textarea" },
      { key: "notice_period", label: "Notice Period Given", type: "text" },
      { key: "settlement_details", label: "Final Settlement Details", type: "textarea" },
      { key: "extra_notes", label: "Additional Notes", type: "textarea" },
    ],
    promotion_letter: [
      ...base,
      { key: "current_position", label: "Current Position", type: "text", required: true },
      { key: "new_position", label: "New Position / Designation", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "new_salary", label: "Revised Monthly Salary (PKR)", type: "text" },
      { key: "reporting_to", label: "New Reporting Manager", type: "text" },
      { key: "extra_notes", label: "Additional Remarks", type: "textarea" },
    ],
    warning_letter: [
      ...base,
      { key: "position", label: "Position / Designation", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "warning_type", label: "Warning Level", type: "select", options: ["Verbal Warning", "First Written Warning", "Final Written Warning"], required: true },
      { key: "violation", label: "Nature of Violation / Issue", type: "textarea", required: true },
      { key: "incident_date", label: "Date of Incident", type: "date" },
      { key: "corrective_action", label: "Expected Corrective Action", type: "textarea", required: true },
      { key: "deadline", label: "Improvement Deadline", type: "date" },
      { key: "consequences", label: "Consequences if Not Improved", type: "textarea" },
      { key: "extra_notes", label: "Additional Notes", type: "textarea" },
    ],
    nda_agreement: [
      ...base,
      { key: "position", label: "Position / Role", type: "text" },
      { key: "effective_date", label: "Agreement Effective Date", type: "date", required: true },
      { key: "duration_years", label: "NDA Duration (Years)", type: "number", required: true },
      { key: "scope", label: "Scope of Confidential Information", type: "textarea", required: true },
      { key: "project_name", label: "Project / Client Name (if specific)", type: "text" },
      { key: "governing_law", label: "Governing Law / Jurisdiction", type: "text" },
      { key: "extra_notes", label: "Additional Clauses", type: "textarea" },
    ],
    relieving_letter: [
      ...base,
      { key: "position", label: "Position Held", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "joining_date", label: "Date of Joining", type: "date", required: true },
      { key: "last_working_date", label: "Last Working Date", type: "date", required: true },
      { key: "resignation_date", label: "Resignation Submitted On", type: "date" },
      { key: "performance", label: "Performance Remarks", type: "select", options: ["Excellent", "Very Good", "Good", "Satisfactory"] },
      { key: "extra_notes", label: "Additional Remarks", type: "textarea" },
    ],
    custom: [
      ...base,
      { key: "subject", label: "Letter Subject", type: "text", required: true },
      { key: "body", label: "Letter Body", type: "textarea", required: true },
    ],
  };

  return templates[type] || templates.custom;
}

export function getLetterTypeLabel(type: LetterType): string {
  const labels: Record<LetterType, string> = {
    offer_letter: "Offer Letter",
    internship_letter: "Internship Offer Letter",
    paid_internship_letter: "Paid Internship Offer Letter",
    appointment_letter: "Appointment Letter",
    experience_letter: "Experience Letter",
    termination_letter: "Termination Letter",
    promotion_letter: "Promotion Letter",
    warning_letter: "Warning Letter",
    nda_agreement: "NDA Agreement",
    relieving_letter: "Relieving Letter",
    salary_certificate: "Salary Certificate",
    custom: "Custom Letter",
  };
  return labels[type] || type;
}

// ============================================================
// INVOICE TYPES
// ============================================================

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  display_order: number;
};

export type Invoice = {
  id: string;
  client_id: string | null;
  created_by: string | null;
  status: InvoiceStatus;
  due_date: string | null;
  issue_date: string;
  subtotal: number;
  tax_rate: number;
  discount: number;
  total: number;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceWithItems = Invoice & {
  invoice_items: InvoiceItem[];
  client: { id: string; full_name: string; email: string; avatar_url?: string } | null;
  creator: { id: string; full_name: string; email: string } | null;
};

// ============================================================
// COMPANY LETTER TYPES
// ============================================================

export type LetterStatus = "draft" | "sent";

export type CompanyLetter = {
  id: string;
  letter_type: LetterType;
  recipient_id: string | null;
  created_by: string | null;
  recipient_name: string;
  subject: string;
  content: Record<string, string>;
  pdf_url: string | null;
  docx_url: string | null;
  status: LetterStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyLetterWithProfiles = CompanyLetter & {
  recipient: { id: string; full_name: string; email: string; role: string } | null;
  creator: { id: string; full_name: string; email: string } | null;
};

// ============================================================
// ATTENDANCE TYPES
// ============================================================

export type AttendanceStatus = "present" | "absent" | "late" | "half_day";

export type AttendanceRecord = {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  check_in_photo_url?: string | null;
  check_out_photo_url?: string | null;
  task_description?: string | null;
  completed_tasks?: string | null;
  sessions?: Array<{ check_in: string; check_out: string | null }> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceWithUser = AttendanceRecord & {
  user: { id: string; full_name: string; email: string; avatar_url?: string; role: string } | null;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  total: number;
};
