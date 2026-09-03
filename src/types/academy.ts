export type StudentStatus = 'active' | 'completed' | 'on_hold' | 'withdrawn' | 'dropped';

export interface AcademyStudent {
  id: string;
  user_id?: string | null;
  student_code: string;
  full_name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  education?: string | null;
  current_profession?: string | null;
  course_id?: string | null;
  batch_id?: string | null;
  enrollment_id?: string | null;
  enrollment_date?: string | null;
  course_start_date?: string | null;
  completion_date?: string | null;
  status: StudentStatus;
  attendance_pct: number;
  result_score: number;
  instructor_name?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  course?: { id: string; title: string; slug: string; duration_weeks?: number } | null;
  batch?: { id: string; name: string; batch_code: string; mode?: string } | null;
}

export type CertificateStatus =
  | 'draft'
  | 'eligible'
  | 'generated'
  | 'issued'
  | 'downloaded'
  | 'verified'
  | 'revoked'
  | 'cancelled';

export type AcademicCertificateType =
  | 'course_completion'
  | 'training_completion'
  | 'internship_completion'
  | 'participation'
  | 'achievement'
  | 'appreciation'
  | 'excellence'
  | 'opa'
  | 'workshop';

export interface AcademyCertificate {
  id: string;
  certificate_id: string;
  student_id?: string | null;
  user_id?: string | null;
  enrollment_id?: string | null;
  course_id?: string | null;
  batch_id?: string | null;
  template_id?: string | null;
  recipient_name: string;
  recipient_email?: string | null;
  course_title: string;
  course_duration?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  issue_date: string;
  valid_until?: string | null;
  certificate_type: AcademicCertificateType | string;
  status: CertificateStatus;
  is_published: boolean;
  is_uploaded: boolean;
  file_url?: string | null;
  qr_code_url?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  created_by?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  student?: AcademyStudent | null;
  course?: { id: string; title: string } | null;
  batch?: { id: string; name: string } | null;
  template?: AcademyCertificateTemplate | null;
  profiles?: { full_name: string; email: string; avatar_url?: string } | null;
}

export interface AcademyCertificateTemplate {
  id: string;
  name: string;
  description?: string | null;
  template_type: string;
  is_default: boolean;
  is_active: boolean;
  bg_image_url: string;
  logo_url?: string | null;
  signature_url?: string | null;
  seal_url?: string | null;
  primary_color: string;
  secondary_color: string;
  title_text: string;
  subtitle_text: string;
  body_template: string;
  config: {
    namePos: { x: number; y: number; fontSize: number; color: string };
    idPos: { x: number; y: number; fontSize: number; color: string };
    datePos: { x: number; y: number; fontSize: number; color: string };
    qrPos: { x: number; y: number; size: number };
  };
  created_at?: string;
  updated_at?: string;
}

export interface AcademyCertificateSettings {
  id: string;
  id_prefix: string;
  year_format: string;
  sequence_counter: number;
  default_template_id?: string | null;
  verification_base_url: string;
  issuing_authority: string;
  signatory_name: string;
  signatory_title: string;
  updated_at?: string;
}

export interface AcademyCertificateLog {
  id: string;
  certificate_id: string;
  action: 'CREATED' | 'GENERATED' | 'ISSUED' | 'DOWNLOADED' | 'VERIFIED' | 'REVOKED' | 'EDITED';
  performed_by?: string | null;
  performed_by_name?: string | null;
  ip_address?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface StudentEligibilityResult {
  isEligible: boolean;
  student: AcademyStudent;
  courseTitle: string;
  reasons: string[];
  requirements: {
    attendancePct: number;
    minAttendancePct: number;
    resultScore: number;
    minResultScore: number;
    isCourseCompleted: boolean;
    manualApprovalRequired: boolean;
    isApprovedManually: boolean;
  };
}
