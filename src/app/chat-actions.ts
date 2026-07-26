"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

type ChatMessage = {
  id: string;
  channel_id?: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  file_url?: string;
  file_type?: string;
  is_pinned: boolean;
  created_at: string;
};

// ============================================================
// CHANNELS
// ============================================================

export async function getChannels() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  // Fetch channels where user is a member or public channels
  const { data, error } = await supabase
    .from("chat_channels")
    .select(`
      *,
      members:channel_members(user_id)
    `)
    .order("name", { ascending: true });

  const result = (data || []).filter(c =>
    c.is_private === false ||
    c.members?.some((m: any) => m.user_id === user.id)
  );

  return { data: result, error };
}

export async function createChannel(name: string, isPrivate = false, memberIds: string[] = []) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  // Check sender role
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const leadershipRoles = ["super_admin", "admin", "hr_manager", "project_manager"];
  if (!senderProfile || !leadershipRoles.includes(senderProfile.role)) {
    return { data: null, error: "Only Admin, HR, and Project Managers can create channels." };
  }

  const { data: channel, error } = await supabase
    .from("chat_channels")
    .insert({
      name: name.toLowerCase().replace(/\s+/g, "-"),
      is_private: isPrivate,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !channel) return { data: null, error };

  // Add members
  const allMembers = Array.from(new Set([user.id, ...memberIds]));
  const memberRows = allMembers.map(uid => ({
    channel_id: channel.id,
    user_id: uid,
  }));

  await supabase.from("channel_members").insert(memberRows);

  revalidatePath("/dashboard");
  return { data: channel, error: null };
}

// ============================================================
// MESSAGES (CHANNELS & DMS)
// ============================================================

export async function getChannelMessages(channelId: string, limit = 80) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_messages")
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, avatar_url, role)
    `)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: (data || []).reverse(), error };
}

export async function sendChannelMessage(channelId: string, content: string, fileUrl?: string, fileType?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("team_messages").insert({
    channel_id: channelId,
    sender_id: user.id,
    content: content.trim(),
    file_url: fileUrl || null,
    file_type: fileType || null,
  });

  return { error };
}

export async function getDirectMessages(otherUserId: string, limit = 80) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("direct_messages")
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, avatar_url, role),
      recipient:profiles!recipient_id(id, full_name, avatar_url, role)
    `)
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: (data || []).reverse(), error };
}

export async function sendDirectMessage(recipientId: string, content: string, fileUrl?: string, fileType?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch sender and recipient profiles to enforce DM rules
  const [{ data: senderProfile }, { data: recipientProfile }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("profiles").select("role").eq("id", recipientId).single(),
  ]);

  const leadershipRoles = ["super_admin", "admin", "hr_manager", "project_manager", "team_lead"];
  const isSenderLeadership = senderProfile && leadershipRoles.includes(senderProfile.role);
  const isRecipientLeadership = recipientProfile && leadershipRoles.includes(recipientProfile.role);

  // If sender is NOT leadership (e.g. staff/intern), recipient MUST be leadership
  if (!isSenderLeadership && !isRecipientLeadership) {
    return { error: "Staff members can only send direct messages to Admin, HR, Project Managers, or Team Leads." };
  }

  const { error } = await supabase.from("direct_messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    content: content.trim(),
    file_url: fileUrl || null,
    file_type: fileType || null,
  });

  return { error };
}

// ============================================================
// MENTIONS & PINNED MESSAGES
// ============================================================

export async function pinMessage(messageId: string, isChannel = true) {
  const supabase = await createClient();
  const table = isChannel ? "team_messages" : "direct_messages";
  const { error } = await supabase
    .from(table)
    .update({ is_pinned: true })
    .eq("id", messageId);
  return { error };
}

export async function unpinMessage(messageId: string, isChannel = true) {
  const supabase = await createClient();
  const table = isChannel ? "team_messages" : "direct_messages";
  const { error } = await supabase
    .from(table)
    .update({ is_pinned: false })
    .eq("id", messageId);
  return { error };
}
