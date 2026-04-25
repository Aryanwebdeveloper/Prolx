"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// AUTO-ID GENERATION
// ============================================================

export async function generateInvoiceId(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true });
  const next = ((count || 0) + 1).toString().padStart(4, "0");
  return `INV-${year}-${next}`;
}

// ============================================================
// INVOICE ACTIONS
// ============================================================

export async function getInvoices(filter?: {
  status?: string;
  clientId?: string;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select(
      `*, 
       client:profiles!invoices_client_id_fkey(id, full_name, email, avatar_url),
       creator:profiles!invoices_created_by_fkey(id, full_name, email),
       invoice_items(*)`
    )
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }
  if (filter?.clientId) {
    query = query.eq("client_id", filter.clientId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getClientInvoices(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, invoice_items(*), creator:profiles!invoices_created_by_fkey(id, full_name, email)`)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getInvoiceById(invoiceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `*, 
       client:profiles!invoices_client_id_fkey(id, full_name, email, avatar_url),
       creator:profiles!invoices_created_by_fkey(id, full_name, email),
       invoice_items(*)`
    )
    .eq("id", invoiceId)
    .single();
  return { data, error };
}

export async function createInvoice(payload: {
  client_id: string;
  due_date?: string;
  issue_date?: string;
  notes?: string;
  tax_rate?: number;
  discount?: number;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const invoiceId = await generateInvoiceId();

  // Calculate totals
  const subtotal = payload.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxAmount = (subtotal * (payload.tax_rate || 0)) / 100;
  const total = subtotal + taxAmount - (payload.discount || 0);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      id: invoiceId,
      client_id: payload.client_id,
      created_by: user.id,
      due_date: payload.due_date,
      issue_date: payload.issue_date || new Date().toISOString().split("T")[0],
      subtotal,
      tax_rate: payload.tax_rate || 0,
      discount: payload.discount || 0,
      total,
      notes: payload.notes,
      status: "draft",
    })
    .select()
    .single();

  if (invoiceError) return { data: null, error: invoiceError };

  // Insert line items
  if (payload.items.length > 0) {
    const items = payload.items.map((item, i) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      display_order: i,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(items);

    if (itemsError) return { data: invoice, error: itemsError };
  }

  revalidatePath("/dashboard");
  return { data: invoice, error: null, invoiceId };
}

export async function updateInvoice(
  invoiceId: string,
  payload: {
    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    due_date?: string;
    notes?: string;
    tax_rate?: number;
    discount?: number;
    pdf_url?: string;
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  }
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.due_date !== undefined) updateData.due_date = payload.due_date;
  if (payload.notes !== undefined) updateData.notes = payload.notes;
  if (payload.tax_rate !== undefined) updateData.tax_rate = payload.tax_rate;
  if (payload.discount !== undefined) updateData.discount = payload.discount;
  if (payload.pdf_url !== undefined) updateData.pdf_url = payload.pdf_url;

  // Recalculate totals if items given
  if (payload.items) {
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    const subtotal = payload.items.reduce(
      (s, item) => s + item.quantity * item.unit_price,
      0
    );
    const taxAmount = (subtotal * (Number(updateData.tax_rate) || 0)) / 100;
    const total = subtotal + taxAmount - (Number(updateData.discount) || 0);
    updateData.subtotal = subtotal;
    updateData.total = total;

    const items = payload.items.map((item, i) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      display_order: i,
    }));
    await supabase.from("invoice_items").insert(items);
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", invoiceId)
    .select(`*, client:profiles!invoices_client_id_fkey(full_name, email)`)
    .single();

  if (data && !error && payload.status === "sent") {
    try {
      const { sendEmail, invoiceSentTemplate } = await import("@/lib/email");
      const { createAdminClient } = await import("../../supabase/admin");
      const supabaseAdmin = createAdminClient();
      
      const clientInfo = Array.isArray(data.client) ? data.client[0] : data.client;
      if (clientInfo && clientInfo.email) {
        const emailHtml = invoiceSentTemplate({
          name: clientInfo.full_name || "Client",
          invoiceId: data.id,
          amount: `$${Number(data.total).toFixed(2)}`,
          dueDate: data.due_date || "Upon Receipt",
        });

        const subject = `Invoice ${data.id} from Prolx`;
        const emailResult = await sendEmail({
          to: clientInfo.email,
          subject,
          html: emailHtml,
        });

        await supabaseAdmin.from("email_logs").insert({
          recipient_email: clientInfo.email,
          recipient_name: clientInfo.full_name || "Client",
          subject,
          template_type: "invoice_sent",
          status: emailResult.error ? "failed" : "sent",
          error_message: emailResult.error || null,
          resend_id: emailResult.id || null,
        });
      }
    } catch (err) {
      console.error("Invoice email error:", err);
    }
  }

  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId);
  revalidatePath("/dashboard");
  return { error };
}

export async function getInvoiceStats() {
  const supabase = await createClient();
  const [allRes, paidRes, unpaidRes, overdueRes] = await Promise.all([
    supabase.from("invoices").select("total"),
    supabase.from("invoices").select("total").eq("status", "paid"),
    supabase.from("invoices").select("total").eq("status", "sent"),
    supabase.from("invoices").select("total").eq("status", "overdue"),
  ]);

  const sum = (items: { total: number }[]) =>
    items?.reduce((s, i) => s + Number(i.total), 0) || 0;

  return {
    total: allRes.data?.length || 0,
    paid: paidRes.data?.length || 0,
    unpaid: unpaidRes.data?.length || 0,
    overdue: overdueRes.data?.length || 0,
    revenue: sum(paidRes.data as { total: number }[] || []),
    outstanding: sum(unpaidRes.data as { total: number }[] || []) + sum(overdueRes.data as { total: number }[] || []),
  };
}
