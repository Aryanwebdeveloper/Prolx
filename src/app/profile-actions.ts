"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  return { data, error };
}

export async function updateMyProfile(payload: { full_name?: string; avatar_url?: string; bio?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select()
    .single();

  revalidatePath("/dashboard");
  revalidatePath("/team"); // Revalidate team page in case avatar syncs there
  
  return { data, error };
}
