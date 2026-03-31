"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function getBlogPosts(options?: { category?: string; publishedOnly?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

  if (options?.category && options.category !== "All") {
    query = query.eq("category", options.category);
  }
  
  if (options?.publishedOnly) {
    query = query.eq("status", "Published");
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getBlogPost(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  return { data, error };
}

export async function createBlogPost(payload: {
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  author_name?: string;
  featured_image_url?: string;
  status: "Draft" | "Published" | "Scheduled";
  featured?: boolean;
  read_time?: string;
  tags?: string;
  meta_title?: string;
  meta_description?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author_id: user?.id,
      published_at: payload.status === 'Published' ? new Date().toISOString() : null,
      ...payload,
    })
    .select()
    .single();

  if (!error && user) {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "CREATE_BLOG_POST",
      target_type: "blog_post",
      target_id: data.id,
      details: { title: payload.title },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  return { data, error };
}

export async function updateBlogPost(id: string, payload: Partial<{
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author_name: string;
  featured_image_url: string;
  status: "Draft" | "Published" | "Scheduled";
  featured: boolean;
  read_time: string;
  tags: string;
  meta_title: string;
  meta_description: string;
}>) {
  const supabase = await createClient();
  
  // If changing to published, set published_at
  const updateData = { ...payload } as any;
  if (payload.status === 'Published') {
    updateData.published_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  return { data, error };
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);
    
  revalidatePath("/dashboard");
  revalidatePath("/blog");
  return { error };
}
