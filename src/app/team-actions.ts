"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getTeamMembers(activeOnly = true) {
  const supabase = await createClient();
  // Using explicit join with linked_user_id
  let query = supabase.from("team_members").select("*, profiles!team_members_linked_user_id_fkey(full_name, avatar_url, bio)").order("display_order", { ascending: true });
  
  if (activeOnly) {
    // Only show members who are both active AND marked visible by admin
    query = query.eq("is_active", true).eq("is_visible", true);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function getMyTeamProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  console.log("getMyTeamProfile called for user.id:", user.id);

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("linked_user_id", user.id)
    .limit(1)
    .maybeSingle();
  
  console.log("getMyTeamProfile result:", data ? data.id : "null", error);
  
  if (error) console.error("Error in getMyTeamProfile:", error);
  
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
  const { data: authUser } = await supabase.auth.getUser();
  
  const { data, error } = await supabase.from("team_members").update(payload).eq("id", id).select().single();

  // Identity Sync: If this profile is linked to the current user, sync Name/Photo/Bio to profiles table
  if (data && authUser.user && data.linked_user_id === authUser.user.id) {
    const profileUpdates: any = {};
    if (payload.full_name) profileUpdates.full_name = payload.full_name;
    if (payload.photo_url) profileUpdates.avatar_url = payload.photo_url;
    if (payload.bio) profileUpdates.bio = payload.bio;

    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from("profiles").update(profileUpdates).eq("id", authUser.user.id);
    }
  }

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

