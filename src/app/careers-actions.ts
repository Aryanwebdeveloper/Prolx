"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

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
