"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export async function submitContact(payload: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  client_id?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      status: "New",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      service: payload.service,
      budget: payload.budget,
      message: payload.message,
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function updateContactStatus(id: string, status: "New" | "Read" | "Replied") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
    
  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);
    
  revalidatePath("/dashboard");
  return { error };
}
