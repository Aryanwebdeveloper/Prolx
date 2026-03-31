"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getServices(activeOnly = true) {
  const supabase = await createClient();
  let query = supabase.from("services").select("*").order("display_order", { ascending: true });
  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function createService(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").insert(payload).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/services");
  return { data, error };
}

export async function updateService(id: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/services");
  return { data, error };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/services");
  return { error };
}
