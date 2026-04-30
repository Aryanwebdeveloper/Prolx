"use server";

import { createClient } from "../../supabase/server";
import { createAdminClient } from "../../supabase/admin";
import { revalidatePath } from "next/cache";
import {
  sendEmail,
  applicationReceivedTemplate,
  shortlistedTemplate,
  interviewScheduledTemplate,
  hiredTemplate,
  customEmailTemplate,
  adminNotificationTemplate,
  ADMIN_EMAIL,
} from "@/lib/email";

// ─── CAREER JOBS ─────────────────────────────────────────────────────────────

export async function getCareerJobs(statusOnly?: "Open" | "Closed" | "Paused") {
  const supabase = await createClient();
  let query = supabase.from("career_jobs").select("*").order("created_at", { ascending: false });
  if (statusOnly) {
    query = query.eq("status", statusOnly);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function createCareerJob(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("career_jobs").insert(payload).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { data, error };
}

export async function updateCareerJob(id: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("career_jobs").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { data, error };
}

export async function deleteCareerJob(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("career_jobs").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { error };
}

// ─── JOB APPLICATIONS ────────────────────────────────────────────────────────

export async function submitJobApplication(payload: {
  job_id: string;
  name: string;
  email: string;
  phone?: string;
  portfolio_url?: string;
  resume_url?: string;
  experience?: string;
  location?: string;
  expected_salary?: string;
  notice_period?: string;
  message?: string;
}) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("career_applications")
      .insert({
        job_id: payload.job_id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        portfolio_url: payload.portfolio_url || null,
        resume_url: payload.resume_url || null,
        experience: payload.experience || null,
        location: payload.location || null,
        expected_salary: payload.expected_salary || null,
        notice_period: payload.notice_period || null,
        message: payload.message || null,
        status: "Pending",
        created_at: new Date().toISOString(),
      })
      .select("*, career_jobs(title)")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { data: null, error: error.message || "Database insert failed" };
    }

    // Send confirmation email (non-blocking)
    if (data) {
      const jobTitle = data.career_jobs?.title || "the position";
      try {
        const emailResult = await sendEmail({
          to: payload.email,
          subject: `We received your application for ${jobTitle} at Prolx`,
          html: applicationReceivedTemplate({ name: payload.name, role: jobTitle }),
        });
        // Log email
        await supabase.from("email_logs").insert({
          application_id: data.id,
          recipient_email: payload.email,
          recipient_name: payload.name,
          subject: `We received your application for ${jobTitle} at Prolx`,
          template_type: "application_received",
          status: emailResult.error ? "failed" : "sent",
          error_message: emailResult.error || null,
          resend_id: emailResult.id || null,
        });

        // Admin Notification
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `[New Application] ${payload.name} applied for ${jobTitle}`,
          html: adminNotificationTemplate({
            title: "New Job Application Received",
            message: `<strong>${payload.name}</strong> has just applied for the <strong>${jobTitle}</strong> position.<br/><br/>Email: ${payload.email}<br/>Phone: ${payload.phone || "N/A"}<br/>Experience: ${payload.experience || "N/A"}`,
            actionLabel: "View Application",
            actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.com"}/dashboard?tab=applications`,
          }),
        });

      } catch (emailErr) {
        console.error("Email send error (non-fatal):", emailErr);
      }
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("Unexpected error in submitJobApplication:", err);
    return {
      data: null,
      error: err?.message || "Unexpected error occurred",
    };
  }
}

export async function getJobApplications(jobId?: string, status?: string, search?: string, dateFrom?: string, dateTo?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("career_applications")
    .select("*, career_jobs(title, department)")
    .order("created_at", { ascending: false });

  if (jobId) query = query.eq("job_id", jobId);
  if (status) query = query.eq("status", status);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59Z");

  const { data, error } = await query;
  if (error) {
    console.error("getJobApplications error:", error);
    return { data: [], error };
  }

  // Client-side search filter (Supabase free tier doesn't support full-text search easily)
  let result = data || [];
  if (search && search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.career_jobs?.title?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q)
    );
  }

  return { data: result, error: null };
}

export async function updateApplicationStatus(id: string, status: string, sendEmailNotification = true) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, career_jobs(title)")
    .single();

  if (error) {
    console.error("updateApplicationStatus error:", error);
    return { data, error };
  }

  // Send automated email notification
  if (data && sendEmailNotification) {
    const name = data.name;
    const email = data.email;
    const role = data.career_jobs?.title || "the position";

    let emailHtml: string | null = null;
    let subject = "";
    let templateType = "";

    if (status === "Shortlisted") {
      emailHtml = shortlistedTemplate({ name, role });
      subject = `Great news! You've been shortlisted for ${role}`;
      templateType = "shortlisted";
    } else if (status === "Rejected") {
      // NO email sent for rejections — only internal log
      console.log(`[ATS] Application ${id} marked Rejected — no email sent (policy)`);
    } else if (status === "Hired") {
      emailHtml = hiredTemplate({ name, role });
      subject = `Welcome to the Prolx team! 🎉`;
      templateType = "hired";
      await supabase
        .from("career_applications")
        .update({ hired_at: new Date().toISOString() })
        .eq("id", id);
    }

    if (emailHtml) {
      try {
        const emailResult = await sendEmail({ to: email, subject, html: emailHtml });
        await supabase.from("email_logs").insert({
          application_id: id,
          recipient_email: email,
          recipient_name: name,
          subject,
          template_type: templateType,
          status: emailResult.error ? "failed" : "sent",
          error_message: emailResult.error || null,
          resend_id: emailResult.id || null,
        });
      } catch (emailErr) {
        console.error("Email send error (non-fatal):", emailErr);
      }
    }
  }

  revalidatePath("/dashboard");
  return { data, error: null };
}

export async function bulkUpdateApplicationStatus(ids: string[], status: string, sendEmailNotification = true) {
  const supabase = createAdminClient();
  
  let updateData: any = { status, updated_at: new Date().toISOString() };
  if (status === "Hired") {
    updateData.hired_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("career_applications")
    .update(updateData)
    .in("id", ids);

  if (error) {
    console.error("bulkUpdateApplicationStatus error:", error);
    return { error };
  }

  if (sendEmailNotification && (status === "Shortlisted" || status === "Hired")) {
    const { data: apps } = await supabase
      .from("career_applications")
      .select("id, name, email, career_jobs(title)")
      .in("id", ids);

    if (apps) {
      for (const app of apps) {
        const name = app.name;
        const email = app.email;
        const role = (app.career_jobs as any)?.title || "the position";
        let emailHtml: string | null = null;
        let subject = "";
        let templateType = "";

        if (status === "Shortlisted") {
          emailHtml = shortlistedTemplate({ name, role });
          subject = `Great news! You've been shortlisted for ${role}`;
          templateType = "shortlisted";
        } else if (status === "Hired") {
          emailHtml = hiredTemplate({ name, role });
          subject = `Welcome to the Prolx team! 🎉`;
          templateType = "hired";
        }

        if (emailHtml) {
          try {
            const emailResult = await sendEmail({ to: email, subject, html: emailHtml });
            await supabase.from("email_logs").insert({
              application_id: app.id,
              recipient_email: email,
              recipient_name: name,
              subject,
              template_type: templateType,
              status: emailResult.error ? "failed" : "sent",
              error_message: emailResult.error || null,
              resend_id: emailResult.id || null,
            });
          } catch (emailErr) {
            console.error("Email send error (non-fatal):", emailErr);
          }
        }
      }
    }
  }

  revalidatePath("/dashboard");
  return { error: null };
}

// ─── INTERVIEW MANAGEMENT ────────────────────────────────────────────────────

export async function scheduleInterview(
  applicationId: string,
  data: {
    scheduled_at: string;
    meeting_link?: string;
    office_address?: string;
    interview_mode?: "Online" | "Physical";
    interview_type?: string;
    interviewer_name?: string;
  }
) {
  const supabase = createAdminClient();

  const isPhysical = data.interview_mode === "Physical";

  // Create interview record
  const { data: interview, error } = await supabase
    .from("interviews")
    .insert({
      application_id: applicationId,
      scheduled_at: data.scheduled_at,
      meeting_link: isPhysical ? null : (data.meeting_link || null),
      office_address: isPhysical ? (data.office_address || null) : null,
      interview_mode: data.interview_mode || "Online",
      interview_type: data.interview_type || "Video Call",
      interviewer_name: data.interviewer_name || null,
      status: "Scheduled",
    })
    .select()
    .single();

  if (error) {
    console.error("scheduleInterview error:", error);
    return { data: null, error };
  }

  // Update application status + interviewed_at
  const { data: appData } = await supabase
    .from("career_applications")
    .update({
      status: "Interview Scheduled",
      interviewed_at: data.scheduled_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select("*, career_jobs(title)")
    .single();

  // Send interview email
  if (appData) {
    const name = appData.name;
    const email = appData.email;
    const role = appData.career_jobs?.title || "the position";
    const interviewDate = new Date(data.scheduled_at).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const subject = `Interview Scheduled — ${role} at Prolx`;

    try {
      const emailResult = await sendEmail({
        to: email,
        subject,
        html: interviewScheduledTemplate({
          name,
          role,
          interviewDate,
          interviewType: data.interview_type || (data.interview_mode === "Physical" ? "In-Person" : "Video Call"),
          interviewMode: data.interview_mode,
          meetingLink: data.interview_mode === "Physical" ? undefined : data.meeting_link,
          officeAddress: data.interview_mode === "Physical" ? data.office_address : undefined,
        }),
      });
      await supabase.from("email_logs").insert({
        application_id: applicationId,
        recipient_email: email,
        recipient_name: name,
        subject,
        template_type: "interview_scheduled",
        status: emailResult.error ? "failed" : "sent",
        error_message: emailResult.error || null,
        resend_id: emailResult.id || null,
      });
    } catch (emailErr) {
      console.error("Interview email error (non-fatal):", emailErr);
    }
  }

  revalidatePath("/dashboard");
  return { data: interview, error: null };
}

export async function scheduleBulkInterviews(
  applicationIds: string[],
  data: {
    scheduled_at: string;
    meeting_link?: string;
    office_address?: string;
    interview_mode?: "Online" | "Physical";
    interview_type?: string;
    interviewer_name?: string;
  }
) {
  const supabase = createAdminClient();
  const isPhysical = data.interview_mode === "Physical";
  
  const { error: appUpdateError } = await supabase
    .from("career_applications")
    .update({
      status: "Interview Scheduled",
      interviewed_at: data.scheduled_at,
      updated_at: new Date().toISOString(),
    })
    .in("id", applicationIds);

  if (appUpdateError) {
    return { error: appUpdateError };
  }

  const { data: apps } = await supabase
    .from("career_applications")
    .select("id, name, email, career_jobs(title)")
    .in("id", applicationIds);

  if (apps) {
    const interviewDate = new Date(data.scheduled_at).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    for (const app of apps) {
      const role = (app.career_jobs as any)?.title || "the position";
      const subject = `Interview Scheduled — ${role} at Prolx`;

      await supabase.from("interviews").insert({
        application_id: app.id,
        scheduled_at: data.scheduled_at,
        meeting_link: isPhysical ? null : (data.meeting_link || null),
        office_address: isPhysical ? (data.office_address || null) : null,
        interview_mode: data.interview_mode || "Online",
        interview_type: data.interview_type || "Video Call",
        interviewer_name: data.interviewer_name || null,
        status: "Scheduled",
      });

      try {
        const emailResult = await sendEmail({
          to: app.email,
          subject,
          html: interviewScheduledTemplate({
            name: app.name,
            role,
            interviewDate,
            interviewType: data.interview_type || (data.interview_mode === "Physical" ? "In-Person" : "Video Call"),
            interviewMode: data.interview_mode,
            meetingLink: data.interview_mode === "Physical" ? undefined : data.meeting_link,
            officeAddress: data.interview_mode === "Physical" ? data.office_address : undefined,
          }),
        });
        await supabase.from("email_logs").insert({
          application_id: app.id,
          recipient_email: app.email,
          recipient_name: app.name,
          subject,
          template_type: "interview_scheduled",
          status: emailResult.error ? "failed" : "sent",
          error_message: emailResult.error || null,
          resend_id: emailResult.id || null,
        });
      } catch (err) {
        console.error("Bulk interview email error:", err);
      }
    }
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function getInterviews(applicationId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("interviews")
    .select("*, career_applications(name, email, career_jobs(title))")
    .order("scheduled_at", { ascending: true });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) console.error("getInterviews error:", error);
  return { data: data || [], error };
}

export async function updateInterview(
  interviewId: string,
  updates: {
    status?: string;
    feedback?: string;
    interviewer_notes?: string;
    rating?: number;
  }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interviews")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", interviewId)
    .select()
    .single();

  if (error) console.error("updateInterview error:", error);
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteInterview(interviewId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("interviews").delete().eq("id", interviewId);
  revalidatePath("/dashboard");
  return { error };
}

// ─── EMAIL ACTIONS ────────────────────────────────────────────────────────────

export async function sendEmailToApplicant(
  applicationId: string,
  subject: string,
  body: string,
  templateType = "custom"
) {
  const supabase = createAdminClient();
  const { data: app } = await supabase
    .from("career_applications")
    .select("name, email, career_jobs(title)")
    .eq("id", applicationId)
    .single();

  if (!app) return { error: "Application not found" };

  const html = customEmailTemplate({ name: app.name, body });
  const emailResult = await sendEmail({ to: app.email, subject, html });

  await supabase.from("email_logs").insert({
    application_id: applicationId,
    recipient_email: app.email,
    recipient_name: app.name,
    subject,
    body,
    template_type: templateType,
    status: emailResult.error ? "failed" : "sent",
    error_message: emailResult.error || null,
    resend_id: emailResult.id || null,
  });

  return { error: emailResult.error || null };
}

export async function sendBulkEmail(applicationIds: string[], subject: string, body: string) {
  const supabase = createAdminClient();
  const { data: apps } = await supabase
    .from("career_applications")
    .select("id, name, email")
    .in("id", applicationIds);

  if (!apps || apps.length === 0) return { error: "No applications found", sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const app of apps) {
    const html = customEmailTemplate({ name: app.name, body });
    const emailResult = await sendEmail({ to: app.email, subject, html });

    await supabase.from("email_logs").insert({
      application_id: app.id,
      recipient_email: app.email,
      recipient_name: app.name,
      subject,
      body,
      template_type: "custom",
      status: emailResult.error ? "failed" : "sent",
      error_message: emailResult.error || null,
      resend_id: emailResult.id || null,
    });

    if (emailResult.error) failed++;
    else sent++;
  }

  return { error: null, sent, failed };
}

export async function getEmailLogs(applicationId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) console.error("getEmailLogs error:", error);
  return { data: data || [], error };
}

export async function resendLoggedEmail(logId: string) {
  const supabase = createAdminClient();
  const { data: log } = await supabase
    .from("email_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (!log) return { error: "Email log not found" };

  const html = log.body
    ? (await import("@/lib/email")).customEmailTemplate({ name: log.recipient_name || log.recipient_email, body: log.body })
    : `<p>${log.subject}</p>`;

  const emailResult = await sendEmail({
    to: log.recipient_email,
    subject: `[Resent] ${log.subject}`,
    html,
  });

  await supabase.from("email_logs").update({
    status: emailResult.error ? "failed" : "sent",
    error_message: emailResult.error || null,
    resend_id: emailResult.id || null,
  }).eq("id", logId);

  return { error: emailResult.error || null };
}

// ─── CSV EXPORT ──────────────────────────────────────────────────────────────

export async function exportApplicationsCSV(jobId?: string, status?: string) {
  const { data, error } = await getJobApplications(jobId, status);
  if (error || !data) return { csv: null, error: "Failed to fetch applications" };

  const headers = [
    "Name", "Email", "Phone", "Position", "Department", "Applied Date",
    "Status", "Experience", "Location", "Expected Salary", "Notice Period",
    "Portfolio URL", "Resume URL", "Message",
  ];

  const rows = data.map((app) => [
    app.name,
    app.email,
    app.phone || "",
    app.career_jobs?.title || "",
    app.career_jobs?.department || "",
    new Date(app.created_at).toLocaleDateString(),
    app.status,
    app.experience || "",
    app.location || "",
    app.expected_salary || "",
    app.notice_period || "",
    app.portfolio_url || "",
    app.resume_url || "",
    (app.message || "").replace(/\n/g, " "),
  ]);

  const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
  const csvLines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ];

  return { csv: csvLines.join("\n"), error: null };
}

// ─── APPLICATION FORM SETTINGS ────────────────────────────────────────────────

const DEFAULT_FORM_FIELDS = {
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

export async function getApplicationFormSettings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "application_form_fields")
    .single();

  if (error || !data) {
    return { data: DEFAULT_FORM_FIELDS, error: null };
  }

  const savedSettings = data.value as Record<string, any>;
  const mergedSettings: typeof DEFAULT_FORM_FIELDS = { ...DEFAULT_FORM_FIELDS };
  for (const key of Object.keys(DEFAULT_FORM_FIELDS)) {
    if (savedSettings[key]) {
      mergedSettings[key as keyof typeof DEFAULT_FORM_FIELDS] = {
        ...DEFAULT_FORM_FIELDS[key as keyof typeof DEFAULT_FORM_FIELDS],
        ...savedSettings[key],
      };
    }
  }

  return { data: mergedSettings, error: null };
}

export async function saveApplicationFormSettings(settings: typeof DEFAULT_FORM_FIELDS) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      key: "application_form_fields",
      value: settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  revalidatePath("/careers");
  return { data, error };
}

// ─── RESUME UPLOAD ────────────────────────────────────────────────────────────

export async function uploadResume(formData: FormData) {
  const supabase = createAdminClient();
  const file = formData.get("file") as File;

  if (!file) {
    return { data: null, error: "No file provided" };
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: "Invalid file type. Only PDF and DOC/DOCX allowed." };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { data: null, error: "File too large. Max size is 5MB." };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("career-applications")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { data: null, error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("career-applications").getPublicUrl(fileName);

  return { data: { url: publicUrl, path: fileName }, error: null };
}
