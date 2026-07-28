"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";
import type {
  BusinessDocType,
  BusinessDocStatus,
  BusinessDocStats,
  DocSection,
  DocumentLineItem,
} from "@/types/erp";

// ============================================================
// AUTO-ID GENERATION
// ============================================================

const TYPE_PREFIXES: Record<string, string> = {
  proposal: "PROP",
  quotation: "QUO",
  srs: "SRS",
  brd: "BRD",
  contract: "CNT",
  nda: "NDA",
  agreement: "AGR",
  scope_doc: "SCP",
  meeting_minutes: "MTG",
  purchase_order: "PO",
  service_agreement: "SA",
  project_plan: "PP",
  custom: "DOC",
};

export async function generateDocumentId(type: BusinessDocType): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const prefix = TYPE_PREFIXES[type] || "DOC";
  const idPrefix = `${prefix}-${year}-`;

  const { data } = await supabase
    .from("business_documents")
    .select("id")
    .like("id", `${idPrefix}%`)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (data?.id) {
    const parts = data.id.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }

  return `${idPrefix}${nextNumber.toString().padStart(4, "0")}`;
}

// ============================================================
// CLIENT MANAGEMENT
// ============================================================

export async function getClients() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // First check profiles with role 'client'
  let { data, error } = await adminClient
    .from("profiles")
    .select("id, full_name, email, avatar_url, role")
    .eq("role", "client")
    .order("full_name", { ascending: true });

  // If no role='client' found, fetch all profiles to ensure added clients are returned
  if (!data || data.length === 0) {
    const res = await adminClient
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .order("full_name", { ascending: true });
    data = res.data;
    error = res.error;
  }

  return { data: data || [], error };
}

export async function createClientRecord(payload: {
  full_name: string;
  email?: string;
  company?: string;
  phone?: string;
}) {
  const supabase = await createClient();
  // Use service role for inserting a profile-like client entry
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create auth user first (with a random password) so we have a UUID
  const tempEmail = payload.email || `client-${Date.now()}@prolx-internal.com`;
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: tempEmail,
    password: `ProlxClient${Date.now()}!`,
    email_confirm: true,
  });

  if (authError) return { data: null, error: authError };

  const userId = authUser.user.id;

  const { data, error } = await adminClient
    .from("profiles")
    .upsert({
      id: userId,
      full_name: payload.full_name,
      email: tempEmail,
      role: "client",
      status: "active",
    })
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error };
}

// ============================================================
// DOCUMENT CRUD
// ============================================================

export async function getDocuments(filter?: {
  type?: BusinessDocType;
  status?: BusinessDocStatus;
  clientId?: string;
  search?: string;
  templatesOnly?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("business_documents")
    .select(`
      *,
      client:profiles!business_documents_client_id_fkey(id, full_name, email, avatar_url),
      creator:profiles!business_documents_created_by_fkey(id, full_name, email),
      assignee:profiles!business_documents_assigned_to_fkey(id, full_name, email),
      line_items:document_line_items(*)
    `)
    .order("created_at", { ascending: false });

  if (filter?.type) query = query.eq("type", filter.type);
  if (filter?.status) query = query.eq("status", filter.status);
  if (filter?.clientId) query = query.eq("client_id", filter.clientId);
  if (filter?.templatesOnly !== undefined) query = query.eq("is_template", filter.templatesOnly);
  else query = query.eq("is_template", false);

  const { data, error } = await query;
  return { data, error };
}

export async function getDocumentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_documents")
    .select(`
      *,
      client:profiles!business_documents_client_id_fkey(id, full_name, email, avatar_url),
      creator:profiles!business_documents_created_by_fkey(id, full_name, email),
      assignee:profiles!business_documents_assigned_to_fkey(id, full_name, email),
      line_items:document_line_items(*)
    `)
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getDocumentByToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_documents")
    .select(`
      *,
      client:profiles!business_documents_client_id_fkey(id, full_name, email, avatar_url),
      creator:profiles!business_documents_created_by_fkey(id, full_name, email),
      line_items:document_line_items(*)
    `)
    .eq("secure_token", token)
    .eq("share_enabled", true)
    .single();
  return { data, error };
}

export async function createDocument(payload: {
  type: BusinessDocType;
  title: string;
  description?: string;
  client_id?: string;
  assigned_to?: string;
  valid_until?: string;
  expiry_date?: string;
  currency?: string;
  tax_rate?: number;
  discount?: number;
  pricing_model?: string;
  sections?: DocSection[];
  metadata?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  internal_notes?: string;
  line_items?: Omit<DocumentLineItem, "id" | "document_id" | "created_at">[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const docId = await generateDocumentId(payload.type);

  // Calculate totals from line items
  const items = payload.line_items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmt = (subtotal * (payload.tax_rate || 0)) / 100;
  const total = subtotal + taxAmt - (payload.discount || 0);

  const { data: doc, error: docError } = await supabase
    .from("business_documents")
    .insert({
      id: docId,
      type: payload.type,
      title: payload.title,
      description: payload.description || null,
      client_id: payload.client_id || null,
      created_by: user.id,
      assigned_to: payload.assigned_to || null,
      valid_until: payload.valid_until || null,
      expiry_date: payload.expiry_date || null,
      currency: payload.currency || "PKR",
      tax_rate: payload.tax_rate || 0,
      discount: payload.discount || 0,
      pricing_model: payload.pricing_model || "fixed",
      sections: payload.sections || [],
      metadata: payload.metadata || {},
      branding: payload.branding || {},
      internal_notes: payload.internal_notes || null,
      subtotal,
      total,
      status: "draft",
    })
    .select()
    .single();

  if (docError) return { data: null, error: docError };

  // Insert line items
  if (items.length > 0) {
    const lineItemsData = items.map((item, i) => ({
      document_id: docId,
      category: item.category || "development",
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || "unit",
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      is_optional: item.is_optional || false,
      display_order: item.display_order ?? i,
      notes: item.notes || null,
    }));

    await supabase.from("document_line_items").insert(lineItemsData);
  }

  // Audit log
  await supabase.from("document_audit_log").insert({
    document_id: docId,
    action: "created",
    actor_id: user.id,
    details: { type: payload.type, title: payload.title },
  });

  revalidatePath("/dashboard");
  return { data: doc, error: null, docId };
}

export async function updateDocument(
  docId: string,
  payload: {
    title?: string;
    description?: string;
    status?: BusinessDocStatus;
    client_id?: string;
    assigned_to?: string;
    valid_until?: string;
    expiry_date?: string;
    currency?: string;
    tax_rate?: number;
    discount?: number;
    pricing_model?: string;
    sections?: DocSection[];
    metadata?: Record<string, unknown>;
    branding?: Record<string, unknown>;
    internal_notes?: string;
    rejection_reason?: string;
    pdf_url?: string;
    docx_url?: string;
    share_enabled?: boolean;
    is_template?: boolean;
    template_name?: string;
    line_items?: Omit<DocumentLineItem, "id" | "document_id" | "created_at">[];
    change_notes?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  // Snapshot current state for version history
  const { data: currentDoc } = await supabase
    .from("business_documents")
    .select("*")
    .eq("id", docId)
    .single();

  if (currentDoc) {
    await supabase.from("document_versions").insert({
      document_id: docId,
      version_number: currentDoc.version_number,
      snapshot: currentDoc,
      change_notes: payload.change_notes || null,
      created_by: user.id,
    });
  }

  const updateData: Record<string, unknown> = { version_number: (currentDoc?.version_number || 1) + 1 };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.client_id !== undefined) updateData.client_id = payload.client_id;
  if (payload.assigned_to !== undefined) updateData.assigned_to = payload.assigned_to;
  if (payload.valid_until !== undefined) updateData.valid_until = payload.valid_until;
  if (payload.expiry_date !== undefined) updateData.expiry_date = payload.expiry_date;
  if (payload.currency !== undefined) updateData.currency = payload.currency;
  if (payload.tax_rate !== undefined) updateData.tax_rate = payload.tax_rate;
  if (payload.discount !== undefined) updateData.discount = payload.discount;
  if (payload.pricing_model !== undefined) updateData.pricing_model = payload.pricing_model;
  if (payload.sections !== undefined) updateData.sections = payload.sections;
  if (payload.metadata !== undefined) updateData.metadata = payload.metadata;
  if (payload.branding !== undefined) updateData.branding = payload.branding;
  if (payload.internal_notes !== undefined) updateData.internal_notes = payload.internal_notes;
  if (payload.rejection_reason !== undefined) updateData.rejection_reason = payload.rejection_reason;
  if (payload.pdf_url !== undefined) updateData.pdf_url = payload.pdf_url;
  if (payload.docx_url !== undefined) updateData.docx_url = payload.docx_url;
  if (payload.share_enabled !== undefined) updateData.share_enabled = payload.share_enabled;
  if (payload.is_template !== undefined) updateData.is_template = payload.is_template;
  if (payload.template_name !== undefined) updateData.template_name = payload.template_name;

  // Recalculate totals if line items provided
  if (payload.line_items !== undefined) {
    await supabase.from("document_line_items").delete().eq("document_id", docId);
    const items = payload.line_items;
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxRate = Number(payload.tax_rate ?? currentDoc?.tax_rate ?? 0);
    const discount = Number(payload.discount ?? currentDoc?.discount ?? 0);
    const taxAmt = (subtotal * taxRate) / 100;
    updateData.subtotal = subtotal;
    updateData.total = subtotal + taxAmt - discount;

    if (items.length > 0) {
      await supabase.from("document_line_items").insert(
        items.map((item, i) => ({
          document_id: docId,
          category: item.category || "development",
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || "unit",
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          is_optional: item.is_optional || false,
          display_order: item.display_order ?? i,
          notes: item.notes || null,
        }))
      );
    }
  }

  const { data, error } = await supabase
    .from("business_documents")
    .update(updateData)
    .eq("id", docId)
    .select(`
      *,
      client:profiles!business_documents_client_id_fkey(id, full_name, email, avatar_url),
      creator:profiles!business_documents_created_by_fkey(id, full_name, email)
    `)
    .single();

  if (!error) {
    // Audit
    await supabase.from("document_audit_log").insert({
      document_id: docId,
      action: payload.status ? `status_changed_to_${payload.status}` : "edited",
      actor_id: user.id,
      details: { changes: Object.keys(payload) },
    });

    // Send notification email if status changed to "sent"
    if (payload.status === "sent" && data) {
      try {
        const clientInfo = Array.isArray(data.client) ? data.client[0] : data.client;
        if (clientInfo?.email) {
          const { sendEmail } = await import("@/lib/email");
          const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/doc/${data.secure_token}`;
          await sendEmail({
            to: clientInfo.email,
            subject: `${data.title} — Shared by Prolx Digital Agency`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0D9488; padding: 24px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">PROLX</h1>
                  <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Digital Agency</p>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 8px 8px;">
                  <h2 style="color: #0F172A; margin-top: 0;">Dear ${clientInfo.full_name || "Client"},</h2>
                  <p style="color: #64748B;">We have shared a document with you: <strong>${data.title}</strong></p>
                  <p style="color: #64748B;">Click the button below to view, approve, or sign the document.</p>
                  <a href="${shareUrl}" style="display: inline-block; background: #0D9488; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                    View Document →
                  </a>
                  <p style="color: #94A3B8; font-size: 13px; margin-top: 24px;">If you have any questions, please contact us at info@prolx.com</p>
                </div>
              </div>
            `,
          });
        }
      } catch (err) {
        console.error("Document email send error:", err);
      }
    }
  }

  revalidatePath("/dashboard");
  return { data, error };
}

export async function deleteDocument(docId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_documents").delete().eq("id", docId);
  revalidatePath("/dashboard");
  return { error };
}

export async function duplicateDocument(docId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };

  const { data: orig } = await supabase
    .from("business_documents")
    .select("*, line_items:document_line_items(*)")
    .eq("id", docId)
    .single();

  if (!orig) return { data: null, error: new Error("Document not found") };

  const newId = await generateDocumentId(orig.type as BusinessDocType);

  const { data: newDoc, error } = await supabase
    .from("business_documents")
    .insert({
      id: newId,
      type: orig.type,
      title: `${orig.title} (Copy)`,
      description: orig.description,
      client_id: orig.client_id,
      created_by: user.id,
      currency: orig.currency,
      tax_rate: orig.tax_rate,
      discount: orig.discount,
      subtotal: orig.subtotal,
      total: orig.total,
      pricing_model: orig.pricing_model,
      sections: orig.sections,
      metadata: orig.metadata,
      branding: orig.branding,
      status: "draft",
      version_number: 1,
    })
    .select()
    .single();

  if (error) return { data: null, error };

  if (orig.line_items?.length > 0) {
    await supabase.from("document_line_items").insert(
      orig.line_items.map((item: DocumentLineItem, i: number) => ({
        document_id: newId,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
        is_optional: item.is_optional,
        display_order: i,
        notes: item.notes,
      }))
    );
  }

  await supabase.from("document_audit_log").insert({
    document_id: newId,
    action: "duplicated",
    actor_id: user.id,
    details: { source_id: docId },
  });

  revalidatePath("/dashboard");
  return { data: newDoc, error: null, docId: newId };
}

// ============================================================
// STATS
// ============================================================

export async function getDocumentStats(): Promise<BusinessDocStats> {
  const supabase = await createClient();

  const { data: allDocs } = await supabase
    .from("business_documents")
    .select("status, total")
    .eq("is_template", false);

  const docs = allDocs || [];
  const sum = (list: { total: number }[]) => list.reduce((s, d) => s + Number(d.total), 0);

  const byStatus = (s: string) => docs.filter(d => d.status === s);

  const sent = byStatus("sent").length + byStatus("viewed").length;
  const accepted = byStatus("accepted").length;
  const conversionRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

  return {
    total: docs.length,
    draft: byStatus("draft").length,
    review: byStatus("review").length,
    approved: byStatus("approved").length,
    sent: byStatus("sent").length + byStatus("viewed").length,
    accepted,
    rejected: byStatus("rejected").length,
    expired: byStatus("expired").length,
    totalValue: sum(docs as { total: number }[]),
    acceptedValue: sum(byStatus("accepted") as { total: number }[]),
    pendingValue: sum([...byStatus("sent"), ...byStatus("viewed"), ...byStatus("approved")] as { total: number }[]),
    conversionRate,
  };
}

// ============================================================
// VERSION HISTORY
// ============================================================

export async function getDocumentVersions(docId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_versions")
    .select("*, creator:profiles!document_versions_created_by_fkey(id, full_name, email)")
    .eq("document_id", docId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function restoreDocumentVersion(docId: string, versionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { data: version } = await supabase
    .from("document_versions")
    .select("snapshot")
    .eq("id", versionId)
    .single();

  if (!version) return { error: new Error("Version not found") };

  const snap = version.snapshot as Record<string, unknown>;
  const { error } = await supabase
    .from("business_documents")
    .update({
      title: snap.title,
      sections: snap.sections,
      metadata: snap.metadata,
      sections_: snap.sections,
    })
    .eq("id", docId);

  await supabase.from("document_audit_log").insert({
    document_id: docId,
    action: "version_restored",
    actor_id: user.id,
    details: { version_id: versionId },
  });

  revalidatePath("/dashboard");
  return { error };
}

// ============================================================
// SIGNATURES
// ============================================================

export async function addSignature(payload: {
  document_id: string;
  signer_name: string;
  signer_email?: string;
  signer_role?: string;
  signature_data: string;
  signature_type?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_signatures")
    .insert({
      document_id: payload.document_id,
      signer_name: payload.signer_name,
      signer_email: payload.signer_email || null,
      signer_role: payload.signer_role || "client",
      signature_data: payload.signature_data,
      signature_type: payload.signature_type || "drawn",
    })
    .select()
    .single();

  if (!error) {
    await supabase.from("document_audit_log").insert({
      document_id: payload.document_id,
      action: "signed",
      actor_name: payload.signer_name,
      actor_email: payload.signer_email || null,
      details: { role: payload.signer_role },
    });
  }

  return { data, error };
}

export async function getDocumentSignatures(docId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_signatures")
    .select("*")
    .eq("document_id", docId)
    .order("created_at", { ascending: true });
  return { data, error };
}

// ============================================================
// COMMENTS
// ============================================================

export async function addComment(payload: {
  document_id: string;
  content: string;
  is_internal?: boolean;
  author_name?: string;
  author_email?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const { data, error } = await supabase
    .from("document_comments")
    .insert({
      document_id: payload.document_id,
      author_id: user?.id || null,
      author_name: payload.author_name || null,
      author_email: payload.author_email || null,
      content: payload.content,
      is_internal: payload.is_internal ?? false,
    })
    .select()
    .single();

  return { data, error };
}

export async function getDocumentComments(docId: string, isInternal?: boolean) {
  const supabase = await createClient();
  let query = supabase
    .from("document_comments")
    .select("*")
    .eq("document_id", docId)
    .order("created_at", { ascending: true });

  if (isInternal !== undefined) query = query.eq("is_internal", isInternal);

  const { data, error } = await query;
  return { data, error };
}

// ============================================================
// AUDIT LOG
// ============================================================

export async function getDocumentAuditLog(docId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_audit_log")
    .select("*")
    .eq("document_id", docId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getTemplates(type?: BusinessDocType) {
  const supabase = await createClient();
  let query = supabase
    .from("document_templates")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  return { data, error };
}

export async function saveAsTemplate(docId: string, name: string, description?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { data: doc } = await supabase
    .from("business_documents")
    .select("*")
    .eq("id", docId)
    .single();

  if (!doc) return { error: new Error("Document not found") };

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      name,
      description: description || null,
      type: doc.type,
      template_data: {
        sections: doc.sections,
        metadata: doc.metadata,
        branding: doc.branding,
        pricing_model: doc.pricing_model,
      },
      created_by: user.id,
    })
    .select()
    .single();

  return { data, error };
}

// ============================================================
// PUBLIC CLIENT ACTIONS (for share page)
// ============================================================

export async function clientApproveDocument(token: string, action: "accepted" | "rejected", name: string, email: string, reason?: string) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("business_documents")
    .select("id")
    .eq("secure_token", token)
    .eq("share_enabled", true)
    .single();

  if (!doc) return { error: new Error("Document not found") };

  const updatePayload: Record<string, unknown> = { status: action };
  if (action === "rejected" && reason) updatePayload.rejection_reason = reason;

  const { error } = await supabase
    .from("business_documents")
    .update(updatePayload)
    .eq("id", doc.id);

  if (!error) {
    await supabase.from("document_audit_log").insert({
      document_id: doc.id,
      action: action === "accepted" ? "client_accepted" : "client_rejected",
      actor_name: name,
      actor_email: email,
      details: { reason: reason || null },
    });
  }

  return { error };
}

export async function recordClientView(token: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("business_documents")
    .select("id, status")
    .eq("secure_token", token)
    .single();

  if (!doc) return;

  const updates: Record<string, unknown> = { client_viewed_at: new Date().toISOString() };
  if (doc.status === "sent") updates.status = "viewed";

  await supabase.from("business_documents").update(updates).eq("id", doc.id);

  await supabase.from("document_audit_log").insert({
    document_id: doc.id,
    action: "client_viewed",
    details: {},
  });
}
