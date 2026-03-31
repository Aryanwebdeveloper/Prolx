"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";
import type { LetterType } from "@/types/erp";

// ============================================================
// AUTO-ID GENERATION
// ============================================================

export async function generateLetterId(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("company_letters")
    .select("*", { count: "exact", head: true });
  const next = ((count || 0) + 1).toString().padStart(4, "0");
  return `LTR-${year}-${next}`;
}

// ============================================================
// LETTER ACTIONS
// ============================================================

export async function getLetters(filter?: { recipientId?: string; type?: string; status?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("company_letters")
    .select(`*, 
      recipient:profiles!company_letters_recipient_id_fkey(id, full_name, email, role),
      creator:profiles!company_letters_created_by_fkey(id, full_name, email)`)
    .order("created_at", { ascending: false });

  if (filter?.recipientId) query = query.eq("recipient_id", filter.recipientId);
  if (filter?.type && filter.type !== "all") query = query.eq("letter_type", filter.type);
  if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);

  const { data, error } = await query;
  return { data, error };
}

export async function getLetterById(letterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_letters")
    .select(`*, 
      recipient:profiles!company_letters_recipient_id_fkey(id, full_name, email, role),
      creator:profiles!company_letters_created_by_fkey(id, full_name, email)`)
    .eq("id", letterId)
    .single();
  return { data, error };
}

export async function createLetter(payload: {
  letter_type: LetterType;
  recipient_id?: string;
  recipient_name: string;
  subject: string;
  content: Record<string, string>;
  status?: "draft" | "sent";
  notes?: string;
  pdf_url?: string;
  docx_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const letterId = await generateLetterId();

  const { data, error } = await supabase
    .from("company_letters")
    .insert({
      id: letterId,
      letter_type: payload.letter_type,
      recipient_id: payload.recipient_id || null,
      created_by: user.id,
      recipient_name: payload.recipient_name,
      subject: payload.subject,
      content: payload.content,
      status: payload.status || "draft",
      notes: payload.notes,
      pdf_url: payload.pdf_url || null,
      docx_url: payload.docx_url || null,
    })
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error, letterId };
}

export async function updateLetter(
  letterId: string,
  payload: {
    status?: "draft" | "sent";
    pdf_url?: string;
    docx_url?: string;
    content?: Record<string, string>;
    notes?: string;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_letters")
    .update(payload)
    .eq("id", letterId)
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteLetter(letterId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_letters")
    .delete()
    .eq("id", letterId);
  revalidatePath("/dashboard");
  return { error };
}

export async function getLetterStats() {
  const supabase = await createClient();
  const [allRes, sentRes, draftRes] = await Promise.all([
    supabase.from("company_letters").select("id", { count: "exact", head: true }),
    supabase.from("company_letters").select("id", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("company_letters").select("id", { count: "exact", head: true }).eq("status", "draft"),
  ]);
  return {
    total: allRes.count || 0,
    sent: sentRes.count || 0,
    draft: draftRes.count || 0,
  };
}
