"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*");
  
  if (error || !data) return { data: {}, error };

  // Convert array of {key, value} to a single object map
  const settingsMap = data.reduce((acc: any, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return { data: settingsMap, error };
}

export async function updateSiteSettings(payload: Record<string, any>) {
  const supabase = await createClient();
  
  // Upsert all keys
  const upserts = Object.keys(payload).map(key => ({
    key,
    value: payload[key]
  }));

  const { error } = await supabase.from("site_settings").upsert(upserts);
  revalidatePath("/dashboard");
  return { error };
}
