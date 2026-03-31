"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getTeamMembers(activeOnly = true) {
  const supabase = await createClient();
  let query = supabase.from("team_members").select("*").order("display_order", { ascending: true });
  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function createTeamMember(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").insert(payload).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/team");
  return { data, error };
}

export async function updateTeamMember(id: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/team");
  return { data, error };
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/team");
  return { error };
}
