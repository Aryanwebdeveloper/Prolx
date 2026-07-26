"use server";

import { createClient } from "../../supabase/server";

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
    const [coursesRes, enrollmentsRes, eventsRes] = await Promise.all([
      supabase.from("academy_courses").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("academy_enrollments").select("id", { count: "exact" }),
      supabase.from("academy_events").select("id", { count: "exact" }).eq("is_active", true),
    ]);
    return {
      courses: coursesRes.count ?? 32,
      students: enrollmentsRes.count ?? 1200,
      events: eventsRes.count ?? 48,
    };
  } catch {
    return { courses: 32, students: 1200, events: 48 };
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
    if (courseSlug) {
      const { data: course } = await supabase
        .from("academy_courses")
        .select("id")
        .eq("slug", courseSlug)
        .single();
      if (course) (payload as any).course_id = course.id;
    }

    const batchCode = formData.get("batch_code") as string;
    if (batchCode) {
      const { data: batch } = await supabase
        .from("academy_batches")
        .select("id")
        .eq("batch_code", batchCode)
        .single();
      if (batch) {
        (payload as any).batch_id = batch.id;
        // Increment enrolled_seats
        await supabase.rpc("increment_batch_seats", { batch_id_param: batch.id });
      }
    }

    const { data, error } = await supabase
      .from("academy_enrollments")
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_certificates")
      .select("*")
      .eq("certificate_id", certificateId.trim().toUpperCase())
      .eq("is_published", true)
      .single();
    if (error || !data) return { found: false };
    return { found: true, certificate: data };
  } catch {
    return { found: false };
  }
}

// ── POST: Submit Review ──────────────────────────────────────────────────
export async function submitReview(formData: FormData) {
  try {
    const supabase = await createClient();
    const courseSlug = formData.get("course_slug") as string;
    const { data: course } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("slug", courseSlug)
      .single();

    const { error } = await supabase.from("academy_reviews").insert({
      course_id: course?.id || null,
      student_name: formData.get("student_name") as string,
      rating: parseInt(formData.get("rating") as string) || 5,
      review: formData.get("review") as string,
      employment_status: formData.get("employment_status") as string || null,
      company_joined: formData.get("company_joined") as string || null,
      salary_package: formData.get("salary_package") as string || null,
      is_approved: false,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
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

// ── ADMIN: Issue Certificate ──────────────────────────────────────────────
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
