"use server";

import { createClient } from "../../supabase/server";
import { createAdminClient } from "../../supabase/admin";
import { revalidatePath } from "next/cache";

// Types are defined inline to avoid export issues with "use server"
// FormFieldConfig and ApplicationFormData types are defined in careers-client.tsx

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
    // Use admin client to bypass RLS policies
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
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error:", error);
      return { data: null, error: error.message || "Database insert failed" };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error("Unexpected error in submitJobApplication:", err);
    return { 
      data: null, 
      error: err?.message || "Unexpected error occurred" 
    };
  }
}

export async function getJobApplications(jobId?: string, status?: string) {
  // Use admin client to bypass RLS and read all applications
  const supabase = createAdminClient();
  let query = supabase
    .from("career_applications")
    .select("*, career_jobs(title)")
    .order("created_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getJobApplications error:", error);
  }
  return { data, error };
}

export async function updateApplicationStatus(id: string, status: string) {
  // Use admin client to bypass RLS and update applications
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateApplicationStatus error:", error);
  }
  return { data, error };
}

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
  // Use admin client to bypass RLS
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "application_form_fields")
    .single();

  if (error || !data) {
    return { data: DEFAULT_FORM_FIELDS, error: null };
  }

  // Merge with defaults to ensure all fields exist
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
  // Use admin client to bypass RLS
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

export async function uploadResume(formData: FormData) {
  // Use admin client for storage operations
  const supabase = createAdminClient();
  const file = formData.get("file") as File;

  if (!file) {
    return { data: null, error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: "Invalid file type. Only PDF and DOC/DOCX allowed." };
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { data: null, error: "File too large. Max size is 5MB." };
  }

  // Generate unique filename
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

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("career-applications")
    .getPublicUrl(fileName);

  return { data: { url: publicUrl, path: fileName }, error: null };
}
