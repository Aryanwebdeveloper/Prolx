"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getPortfolioProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("portfolio_projects").select("*, case_studies(*)").order("display_order", { ascending: true });
  return { data, error };
}

export async function createPortfolioProject(payload: any) {
  const supabase = await createClient();
  // Generate slug if not provided
  if (!payload.slug && payload.name) {
    payload.slug = payload.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  const { data, error } = await supabase.from("portfolio_projects").insert(payload).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/portfolio");
  return { data, error };
}

export async function updatePortfolioProject(id: string, payload: any) {
  const supabase = await createClient();
  if (!payload.slug && payload.name) {
    payload.slug = payload.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  const { data, error } = await supabase.from("portfolio_projects").update(payload).eq("id", id).select().single();
  revalidatePath("/dashboard");
  revalidatePath("/portfolio");
  if (payload.slug) revalidatePath(`/portfolio/${payload.slug}`);
  return { data, error };
}

export async function deletePortfolioProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/portfolio");
  return { error };
}

// Case Study Actions
export async function getCaseStudyByProjectId(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("case_studies").select("*").eq("portfolio_id", projectId).maybeSingle();
  return { data, error };
}

export async function getCaseStudyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("case_studies").select("*, portfolio_projects(*)").eq("slug", slug).maybeSingle();
  return { data, error };
}

export async function upsertCaseStudy(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("case_studies").upsert(payload, { onConflict: "portfolio_id" }).select().single();
  
  // Revalidate both listing and detail pages
  revalidatePath("/portfolio");
  if (payload.slug) revalidatePath(`/portfolio/${payload.slug}`);
  
  return { data, error };
}

