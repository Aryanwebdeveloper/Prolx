"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getPricingPlans(activeOnly = true) {
  const supabase = await createClient();
  let query = supabase.from("pricing_plans").select("*").order("display_order", { ascending: true });
  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  return { data, error };
}

export async function createPricingPlan(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_plans")
    .insert(payload)
    .select()
    .single();
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { data, error };
}

export async function updatePricingPlan(id: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_plans")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { data, error };
}

export async function deletePricingPlan(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  return { error };
}
