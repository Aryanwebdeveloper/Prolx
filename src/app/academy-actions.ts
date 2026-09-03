"use server";

import { createClient } from "../../supabase/server";
import { createAdminClient } from "../../supabase/admin";
import { getCertVerificationUrl } from "@/lib/certificates";
import { revalidatePath } from "next/cache";
import type { StudentEligibilityResult } from "@/types/academy";

// ── Helpers ─────────────────────────────────────────────────────────────
function generateEnrollmentId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `PLX-ENR-${year}-${rand}`;
}

function generateStudentId(): string {
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `PLX-STU-${rand}`;
}

// ── GET: Academy Stats ───────────────────────────────────────────────────
export async function getAcademyStats() {
  try {
    const supabase = await createClient();
    const [coursesRes, enrollmentsRes, eventsRes, certsRes] = await Promise.all([
      supabase.from("academy_courses").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("academy_enrollments").select("id", { count: "exact" }),
      supabase.from("academy_events").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("academy_certificates").select("id", { count: "exact" }).eq("is_published", true),
    ]);
    return {
      courses: coursesRes.count ?? 32,
      students: enrollmentsRes.count ?? 1200,
      events: eventsRes.count ?? 48,
      certificates: certsRes.count ?? 450,
    };
  } catch {
    return { courses: 32, students: 1200, events: 48, certificates: 450 };
  }
}

// ── GET: All Categories ─────────────────────────────────────────────────
export async function getAcademyCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── GET: All Courses (with filters) ─────────────────────────────────────
export async function getAcademyCourses(opts?: {
  category?: string;
  level?: string;
  mode?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("academy_courses")
      .select(`*, category:academy_categories(name, slug, color)`)
      .eq("is_active", true);

    if (opts?.category) query = query.eq("academy_categories.slug", opts.category);
    if (opts?.level) query = query.eq("level", opts.level);
    if (opts?.featured) query = query.eq("is_featured", true);
    if (opts?.search) query = query.ilike("title", `%${opts.search}%`);
    if (opts?.limit) query = query.limit(opts.limit);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── GET: Single Course ──────────────────────────────────────────────────
export async function getCourseBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(`
        *,
        category:academy_categories(name, slug, color, icon),
        curriculum:academy_curriculum(id, week_number, title, topics, sort_order),
        batches:academy_batches(id, name, batch_code, start_date, end_date, class_days, class_time, instructor_name, total_seats, enrolled_seats, mode, campus_location, status),
        reviews:academy_reviews(id, student_name, rating, review, employment_status, company_joined, salary_package, is_approved)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// ── GET: Upcoming Batches ────────────────────────────────────────────────
export async function getUpcomingBatches() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_batches")
      .select(`*, course:academy_courses(title, slug, thumbnail_url, level)`)
      .in("status", ["upcoming", "ongoing"])
      .order("start_date", { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── GET: Events ──────────────────────────────────────────────────────────
export async function getAcademyEvents() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_events")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── GET: Internships ─────────────────────────────────────────────────────
export async function getInternships() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_internships")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── POST: Create Enrollment ──────────────────────────────────────────────
export async function createEnrollment(formData: FormData) {
  try {
    const supabase = await createClient();

    const enrollment_id = generateEnrollmentId();
    const student_id = generateStudentId();

    const rawPayment = (formData.get("payment_method") as string) || "cash";
    let payment_method = "cash";
    if (rawPayment.toLowerCase().includes("bank")) {
      payment_method = "bank_transfer";
    } else if (rawPayment.toLowerCase().includes("cheque")) {
      payment_method = "cheque";
    } else {
      payment_method = "cash";
    }

    const payload = {
      enrollment_id,
      student_id,
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      city: formData.get("city") as string,
      education: formData.get("education") as string,
      current_profession: formData.get("current_profession") as string,
      learning_mode: formData.get("learning_mode") as string || "online",
      payment_method,
      referral_code: formData.get("referral_code") as string || null,
      notes: formData.get("notes") as string || null,
      status: "pending",
      payment_status: "pending",
    };

    const courseSlug = formData.get("course_slug") as string;
    let courseId = null;
    if (courseSlug) {
      const { data: course } = await supabase
        .from("academy_courses")
        .select("id")
        .eq("slug", courseSlug)
        .single();
      if (course) {
        (payload as any).course_id = course.id;
        courseId = course.id;
      }
    }

    const batchCode = formData.get("batch_code") as string;
    let batchId = null;
    if (batchCode) {
      const { data: batch } = await supabase
        .from("academy_batches")
        .select("id")
        .eq("batch_code", batchCode)
        .single();
      if (batch) {
        (payload as any).batch_id = batch.id;
        batchId = batch.id;
      }
    }

    const { data, error } = await supabase
      .from("academy_enrollments")
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Also auto-create or update student record in `academy_students`
    try {
      await supabase.from("academy_students").insert({
        student_code: student_id,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        whatsapp: payload.whatsapp,
        city: payload.city,
        education: payload.education,
        current_profession: payload.current_profession,
        course_id: courseId,
        batch_id: batchId,
        enrollment_id: data?.id,
        status: "active",
        attendance_pct: 0,
        result_score: 0,
      });
    } catch {
      // Ignore conflict if student already exists
    }

    return {
      success: true,
      enrollment_id,
      student_id,
      data,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── POST: Book Demo Class ────────────────────────────────────────────────
export async function bookDemoClass(formData: FormData) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("academy_demo_bookings").insert({
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      course_interest: formData.get("course_interest") as string,
      preferred_date: formData.get("preferred_date") as string || null,
      preferred_time: formData.get("preferred_time") as string || null,
      mode: formData.get("mode") as string || "online",
      questions: formData.get("questions") as string || null,
      status: "pending",
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── GET: Verify Certificate ──────────────────────────────────────────────
export async function verifyCertificate(certificateId: string) {
  try {
    const supabase = createAdminClient();
    const cleanId = certificateId.trim().toUpperCase();

    // Check academy_certificates
    const { data: cert, error } = await supabase
      .from("academy_certificates")
      .select(`
        *,
        student:academy_students(full_name, email, avatar_url),
        course:academy_courses(title, slug, duration_weeks),
        batch:academy_batches(name, batch_code)
      `)
      .eq("certificate_id", cleanId)
      .maybeSingle();

    if (cert) {
      // Log verification event
      await supabase.from("academy_certificate_logs").insert({
        certificate_id: cleanId,
        action: "VERIFIED",
        details: { verified_at: new Date().toISOString() },
      });
      return { found: true, certificate: cert };
    }

    // Fallback to legacy certificates table
    const { data: legacyCert } = await supabase
      .from("certificates")
      .select("*, profiles:profiles!certificates_user_id_fkey(full_name)")
      .eq("id", cleanId)
      .maybeSingle();

    if (legacyCert) {
      return {
        found: true,
        certificate: {
          certificate_id: legacyCert.id,
          recipient_name: legacyCert.recipient_name,
          course_title: legacyCert.title,
          issue_date: legacyCert.issue_date,
          status: legacyCert.status === "active" ? "issued" : legacyCert.status,
          certificate_type: legacyCert.certificate_type || "internship",
          revoked_at: legacyCert.revoked_at,
          revoked_reason: legacyCert.revoked_reason,
          is_uploaded: legacyCert.is_uploaded || false,
          file_url: legacyCert.file_url || null,
        },
      };
    }

    return { found: false };
  } catch {
    return { found: false };
  }
}

// ── ADMIN: Get Students Directory ─────────────────────────────────────────
export async function getAdminStudents(opts?: { courseId?: string; batchId?: string; status?: string; search?: string }) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("academy_students")
      .select(`
        *,
        course:academy_courses(id, title, slug, duration_weeks),
        batch:academy_batches(id, name, batch_code, mode)
      `)
      .order("created_at", { ascending: false });

    if (opts?.courseId) query = query.eq("course_id", opts.courseId);
    if (opts?.batchId) query = query.eq("batch_id", opts.batchId);
    if (opts?.status) query = query.eq("status", opts.status);
    if (opts?.search) query = query.or(`full_name.ilike.%${opts.search}%,email.ilike.%${opts.search}%,student_code.ilike.%${opts.search}%`);

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Upsert Student ─────────────────────────────────────────────────
export async function upsertStudent(studentData: any) {
  try {
    const supabase = await createClient();
    const payload = { ...studentData, updated_at: new Date().toISOString() };
    if (!payload.student_code) {
      payload.student_code = generateStudentId();
    }

    const { data, error } = await supabase
      .from("academy_students")
      .upsert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Delete Student ─────────────────────────────────────────────────
export async function deleteStudent(studentId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("academy_students").delete().eq("id", studentId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Check Certificate Eligibility ──────────────────────────────────
export async function checkStudentEligibility(studentId: string, courseId?: string): Promise<StudentEligibilityResult | null> {
  try {
    const supabase = await createClient();
    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(`
        *,
        course:academy_courses(id, title, min_attendance_pct, min_result_score, require_manual_approval, duration_weeks),
        batch:academy_batches(name, batch_code)
      `)
      .eq("id", studentId)
      .single();

    if (studentError || !student) return null;

    const course = student.course;
    const minAttendance = course?.min_attendance_pct ?? 75;
    const minResult = course?.min_result_score ?? 60;
    const requireApproval = course?.require_manual_approval ?? false;

    const reasons: string[] = [];
    const isCourseCompleted = student.status === "completed";
    const hasMinAttendance = (student.attendance_pct || 0) >= minAttendance;
    const hasMinScore = (student.result_score || 0) >= minResult;

    if (!isCourseCompleted) reasons.push(`Student status is '${student.status}' (must be 'completed').`);
    if (!hasMinAttendance) reasons.push(`Attendance is ${student.attendance_pct}% (minimum required: ${minAttendance}%).`);
    if (!hasMinScore) reasons.push(`Result score is ${student.result_score}% (minimum required: ${minResult}%).`);

    const isEligible = isCourseCompleted && hasMinAttendance && hasMinScore;

    return {
      isEligible,
      student,
      courseTitle: course?.title || "Academy Course",
      reasons,
      requirements: {
        attendancePct: student.attendance_pct || 0,
        minAttendancePct: minAttendance,
        resultScore: student.result_score || 0,
        minResultScore: minResult,
        isCourseCompleted,
        manualApprovalRequired: requireApproval,
        isApprovedManually: true,
      },
    };
  } catch {
    return null;
  }
}

// ── ADMIN: Generate Certificate ───────────────────────────────────────────
export async function generateStudentCertificate(payload: {
  student_id: string;
  course_id?: string;
  batch_id?: string;
  template_id?: string;
  certificate_type?: string;
  issue_date?: string;
  custom_cert_id?: string;
}) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Fetch student info
    const { data: student } = await supabase
      .from("academy_students")
      .select(`*, course:academy_courses(title, duration_weeks), batch:academy_batches(name)`)
      .eq("id", payload.student_id)
      .single();

    if (!student) return { success: false, error: "Student not found." };

    // Generate unique Certificate ID
    let certificate_id = payload.custom_cert_id?.trim().toUpperCase();
    if (!certificate_id) {
      // Call database RPC sequence generator or build fallback
      const { data: rpcId } = await supabase.rpc("generate_next_certificate_id");
      if (rpcId) {
        certificate_id = rpcId;
      } else {
        const year = new Date().getFullYear().toString().slice(-2);
        const rand = Math.floor(Math.random() * 900000) + 100000;
        certificate_id = `PRLX-CERT-${year}-${rand}`;
      }
    }

    const verification_url = getCertVerificationUrl(certificate_id);
    const issue_date = payload.issue_date || new Date().toISOString().split("T")[0];
    const courseTitle = student.course?.title || "Prolx Professional Training Course";
    const courseDuration = student.course?.duration_weeks ? `${student.course.duration_weeks} Weeks` : "1 Month";

    // Insert into academy_certificates
    const { data: cert, error: certError } = await supabase
      .from("academy_certificates")
      .insert({
        certificate_id,
        student_id: student.id,
        user_id: student.user_id || null,
        enrollment_id: student.enrollment_id || null,
        course_id: student.course_id || payload.course_id || null,
        batch_id: student.batch_id || payload.batch_id || null,
        template_id: payload.template_id || null,
        recipient_name: student.full_name,
        recipient_email: student.email,
        course_title: courseTitle,
        course_duration: courseDuration,
        start_date: student.course_start_date || null,
        completion_date: student.completion_date || null,
        issue_date,
        certificate_type: payload.certificate_type || "course_completion",
        status: "issued",
        is_published: true,
        is_uploaded: false,
        qr_code_url: verification_url,
        created_by: currentUser?.id || null,
      })
      .select()
      .single();

    if (certError) return { success: false, error: certError.message };

    // Also mirror to `certificates` table for legacy UI compatibility
    if (student.user_id) {
      try {
        await supabase.from("certificates").insert({
          id: certificate_id,
          user_id: student.user_id,
          recipient_name: student.full_name,
          recipient_email: student.email,
          title: courseTitle,
          category: "Course Completion",
          issue_date,
          status: "active",
          issued_by: "Prolx Digital Agency",
          certificate_type: payload.certificate_type || "course_completion",
          qr_code_url: verification_url,
          created_by: currentUser?.id || null,
        });
      } catch {
        // Ignore if user_id is missing or already inserted
      }
    }

    // Audit Log
    await supabase.from("academy_certificate_logs").insert({
      certificate_id,
      action: "GENERATED",
      performed_by: currentUser?.id || null,
      details: { student_name: student.full_name, course: courseTitle },
    });

    // Send Email Notification if email present
    if (student.email) {
      try {
        const { sendEmail, certificateIssuedTemplate } = await import("@/lib/email");
        const emailHtml = certificateIssuedTemplate({
          name: student.full_name,
          title: courseTitle,
          certId: certificate_id,
          issueDate: issue_date,
          category: "Academy Course Completion",
        });

        await sendEmail({
          to: student.email,
          subject: `Congratulations! Your Prolx Certificate of Completion is Ready: ${certificate_id}`,
          html: emailHtml,
        });
      } catch (e) {
        console.error("Failed to send certificate notification email:", e);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, certificate_id, data: cert };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Upload External Certificate ────────────────────────────────────
export async function uploadStudentCertificate(formData: FormData) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const studentId = formData.get("student_id") as string;
    const courseTitle = formData.get("course_title") as string;
    const certificateType = formData.get("certificate_type") as string || "course_completion";
    const customCertId = formData.get("certificate_id") as string;
    const issueDate = formData.get("issue_date") as string || new Date().toISOString().split("T")[0];
    const file = formData.get("file") as File;

    if (!studentId || !file) {
      return { success: false, error: "Student and certificate file are required." };
    }

    // Get student details
    const { data: student } = await supabase.from("academy_students").select("*").eq("id", studentId).single();
    if (!student) return { success: false, error: "Student record not found." };

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `uploaded_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("certificates")
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return { success: false, error: "Storage upload failed: " + uploadError.message };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("certificates").getPublicUrl(filePath);
    const fileUrl = publicUrlData.publicUrl;

    // Certificate ID
    let certificate_id = customCertId?.trim().toUpperCase();
    if (!certificate_id) {
      const year = new Date().getFullYear().toString().slice(-2);
      const rand = Math.floor(Math.random() * 900000) + 100000;
      certificate_id = `PRLX-CERT-${year}-${rand}`;
    }

    const verification_url = getCertVerificationUrl(certificate_id);

    // Save record
    const { data: cert, error: insertError } = await supabase
      .from("academy_certificates")
      .insert({
        certificate_id,
        student_id: student.id,
        user_id: student.user_id || null,
        recipient_name: student.full_name,
        recipient_email: student.email,
        course_title: courseTitle || "Uploaded Certificate Document",
        issue_date: issueDate,
        certificate_type: certificateType,
        status: "issued",
        is_published: true,
        is_uploaded: true,
        file_url: fileUrl,
        qr_code_url: verification_url,
        created_by: currentUser?.id || null,
      })
      .select()
      .single();

    if (insertError) return { success: false, error: insertError.message };

    // Mirror to legacy table for dashboard compatibility
    if (student.user_id) {
      try {
        await supabase.from("certificates").insert({
          id: certificate_id,
          user_id: student.user_id,
          recipient_name: student.full_name,
          recipient_email: student.email,
          title: courseTitle || "Uploaded Certificate Document",
          category: "Uploaded Document",
          issue_date: issueDate,
          status: "active",
          issued_by: "Prolx Digital Agency",
          certificate_type: certificateType,
          is_uploaded: true,
          file_url: fileUrl,
          qr_code_url: verification_url,
          created_by: currentUser?.id || null,
        });
      } catch {
        // ignore duplicate
      }
    }

    // Audit Log
    await supabase.from("academy_certificate_logs").insert({
      certificate_id,
      action: "CREATED",
      performed_by: currentUser?.id || null,
      details: { uploaded_file: fileName },
    });

    revalidatePath("/dashboard");
    return { success: true, certificate_id, fileUrl, data: cert };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Revoke Academy Certificate ────────────────────────────────────
export async function revokeAcademyCertificate(certificateId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const cleanId = certificateId.trim().toUpperCase();

    // Update academy_certificates
    await supabase
      .from("academy_certificates")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || "Revoked by Administrator",
      })
      .eq("certificate_id", cleanId);

    // Update legacy certificates
    await supabase
      .from("certificates")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || "Revoked by Administrator",
      })
      .eq("id", cleanId);

    // Log audit
    await supabase.from("academy_certificate_logs").insert({
      certificate_id: cleanId,
      action: "REVOKED",
      performed_by: currentUser?.id || null,
      details: { reason: reason || "Revoked by Administrator" },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Bulk Generate Certificates for Batch ───────────────────────────
export async function bulkGenerateCertificates(batchId: string, studentIds: string[]) {
  try {
    const results = [];
    for (const id of studentIds) {
      const res = await generateStudentCertificate({ student_id: id, batch_id: batchId });
      results.push({ studentId: id, ...res });
    }
    revalidatePath("/dashboard");
    return { success: true, results };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Get Master Certificates List ───────────────────────────────────
export async function getAdminAcademyCertificates(opts?: { status?: string; search?: string }) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("academy_certificates")
      .select(`
        *,
        student:academy_students(full_name, email, student_code),
        course:academy_courses(title),
        batch:academy_batches(name, batch_code)
      `)
      .order("created_at", { ascending: false });

    if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status);
    if (opts?.search) query = query.or(`certificate_id.ilike.%${opts.search}%,recipient_name.ilike.%${opts.search}%,course_title.ilike.%${opts.search}%`);

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Certificate Templates CRUD ─────────────────────────────────────
export async function getCertificateTemplates() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("academy_certificate_templates").select("*").order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function upsertCertificateTemplate(templateData: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("academy_certificate_templates").upsert(templateData).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Certificate Settings CRUD ──────────────────────────────────────
export async function getAcademyCertificateSettings() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("academy_certificate_settings").select("*").limit(1).maybeSingle();
    return data || {
      id_prefix: "PRLX-CERT",
      year_format: "26",
      sequence_counter: 1001,
      issuing_authority: "Prolx Digital Agency",
      signatory_name: "Aryan M Yaseen",
    };
  } catch {
    return {
      id_prefix: "PRLX-CERT",
      year_format: "26",
      sequence_counter: 1001,
      issuing_authority: "Prolx Digital Agency",
      signatory_name: "Aryan M Yaseen",
    };
  }
}

export async function updateAcademyCertificateSettings(settings: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("academy_certificate_settings").upsert({
      id: settings.id || "b1fec999-9c0b-4ef8-bb6d-6bb9bd380b22",
      ...settings,
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Update Enrollment Status ─────────────────────────────────────
export async function updateEnrollmentStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("academy_enrollments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Approve Review ─────────────────────────────────────────────────
export async function approveReview(id: string, approved: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("academy_reviews")
      .update({ is_approved: approved })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Upsert Course ──────────────────────────────────────────────────
export async function upsertCourse(course: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .upsert({ ...course, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Upsert Batch ───────────────────────────────────────────────────
export async function upsertBatch(batch: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_batches")
      .upsert(batch)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Issue Certificate (Legacy compatible) ──────────────────────────
export async function issueCertificate(enrollmentId: string, certData: any) {
  try {
    const supabase = await createClient();
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 90000) + 10000;
    const certificate_id = `PLX-CERT-${year}-${rand}`;

    const { data, error } = await supabase
      .from("academy_certificates")
      .insert({
        certificate_id,
        enrollment_id: enrollmentId,
        issued_at: new Date().toISOString().split("T")[0],
        is_published: true,
        ...certData,
      })
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, certificate_id, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Get All Enrollments ───────────────────────────────────────────
export async function getAdminEnrollments() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_enrollments")
      .select(`*, batch:academy_batches(name, batch_code), course:academy_courses(title)`)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Get All Demo Bookings ─────────────────────────────────────────
export async function getAdminDemoBookings() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_demo_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Get All Courses (full) ─────────────────────────────────────────
export async function getAdminCourses() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(`*, category:academy_categories(name, slug)`)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Get All Batches (full) ─────────────────────────────────────────
export async function getAdminBatches() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_batches")
      .select(`*, course:academy_courses(title, slug)`)
      .order("start_date", { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Toggle Course Active ───────────────────────────────────────────
export async function toggleCourseActive(id: string, is_active: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("academy_courses")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Delete Course ──────────────────────────────────────────────────
export async function deleteCourse(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("academy_courses").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Delete Batch ───────────────────────────────────────────────────
export async function deleteBatch(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("academy_batches").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Update Batch Status ────────────────────────────────────────────
export async function updateBatchStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("academy_batches")
      .update({ status })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Update Demo Booking Status ─────────────────────────────────────
export async function updateDemoStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("academy_demo_bookings")
      .update({ status })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── ADMIN: Get Categories (for forms) ─────────────────────────────────────
export async function getAdminCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_categories")
      .select("*")
      .order("sort_order");
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── ADMIN: Update Enrollment Payment ──────────────────────────────────────
export async function updateEnrollmentPayment(id: string, payment_status: string, amount_paid?: number) {
  try {
    const supabase = await createClient();
    const update: any = { payment_status, updated_at: new Date().toISOString() };
    if (amount_paid !== undefined) update.amount_paid = amount_paid;
    const { error } = await supabase
      .from("academy_enrollments")
      .update(update)
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
