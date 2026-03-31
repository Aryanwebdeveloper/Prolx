"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getTestimonials(visibleOnly = true) {
  const supabase = await createClient();
  let query = supabase.from("testimonials").select("*").order("display_order", { ascending: true });
  if (visibleOnly) {
    query = query.eq("is_visible", true);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function createTestimonial(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").insert(payload).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { data, error };
}

export async function updateTestimonial(id: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { data, error };
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { error };
}
