"use server";

import { createClient } from "../../../supabase/server";
import { revalidatePath } from "next/cache";

export async function submitConsultation(payload: {
  type: string;
  date: string;
  time: string;
  name: string;
  email: string;
  company?: string;
  projectDesc: string;
  budget?: string;
  timeline?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      status: "Scheduled",
      type: payload.type,
      date: payload.date,
      time: payload.time,
      name: payload.name,
      email: payload.email,
      company: payload.company,
      project_desc: payload.projectDesc,
      budget: payload.budget,
      timeline: payload.timeline,
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getConsultations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function updateConsultationStatus(id: string, status: "Scheduled" | "Completed" | "Cancelled") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
    
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteConsultation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("consultations")
    .delete()
    .eq("id", id);
    
  revalidatePath("/dashboard");
  return { error };
}
