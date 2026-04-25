"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const role = formData.get("role")?.toString() || 'client';
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
        role: role,
      }
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      // Insert into legacy users table (if exists)
      await supabase
        .from('users')
        .insert({
          id: user.id,
          name: fullName,
          full_name: fullName,
          email: email,
          user_id: user.id,
          token_identifier: user.id,
          created_at: new Date().toISOString()
        });

      // Insert into profiles table (new system)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: email,
          role: role === 'staff' ? 'staff' : 'client',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    } catch (err) {
      console.error('Error in user profile creation:', err);
    }

    // Admin Notification for New Sign-up
    try {
      const { sendEmail, adminNotificationTemplate, ADMIN_EMAIL } = await import("@/lib/email");
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[New User] ${fullName} signed up`,
        html: adminNotificationTemplate({
          title: "New Account Registration",
          message: `<strong>${fullName}</strong> has registered for a new account.<br/><br/>Email: ${email}<br/>Role Requested: ${role}<br/><br/>The account is currently <strong>Pending</strong> admin approval.`,
          actionLabel: "Manage Users",
          actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.cloud"}/dashboard?tab=users`,
        }),
      });
    } catch (emailErr) {
      console.error("Admin sign-up notification error:", emailErr);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Account created! Your registration is pending admin approval. You'll receive access once approved.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Check profile status
  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', authData.user.id)
      .single();

    if (profile) {
      if (profile.status === 'pending') {
        await supabase.auth.signOut();
        return encodedRedirect("error", "/sign-in", "Your account is pending admin approval. Please wait for activation.");
      }
      if (profile.status === 'rejected') {
        await supabase.auth.signOut();
        return encodedRedirect("error", "/sign-in", "Your account has been rejected. Please contact support.");
      }
    }
  }

  return redirect("/dashboard");
};


export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function getGlobalStats() {
  const supabase = await createClient();
  
  const [
    { count: usersCount },
    { count: contactsCount },
    { count: portfolioCount },
    { count: blogCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: usersCount || 0,
    contacts: contactsCount || 0,
    portfolio: portfolioCount || 0,
    blog: blogCount || 0,
  };
}

export async function getOverviewAnalytics() {
  const supabase = await createClient();

  // --- Visitor Trend: contacts submitted per day over last 7 days ---
  const days: string[] = [];
  const dayLabels: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayLabels: string[] = [];
  const counts: number[] = [];

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    days.push(dateStr);
    todayLabels.push(dayLabels[d.getDay()]);
    counts.push(0);
  }

  // Fetch from page_views instead of contacts for actual historical traffic
  const { data: pageViewRows } = await supabase
    .from("page_views")
    .select("visitor_id, created_at, path")
    .gte("created_at", days[0] + "T00:00:00Z");

  if (pageViewRows) {
    // We want unique visitors per day
    const visitorsPerDay: Record<string, Set<string>> = {};
    for (const d of days) visitorsPerDay[d] = new Set();

    for (const row of pageViewRows) {
      const rowDate = (row.created_at as string).split("T")[0];
      if (visitorsPerDay[rowDate]) {
        visitorsPerDay[rowDate].add(row.visitor_id);
      }
    }

    for (let i = 0; i < days.length; i++) {
      counts[i] = visitorsPerDay[days[i]].size;
    }
  }

  const visitorTrend = todayLabels.map((label, i) => ({ label, count: counts[i] }));

  // --- Lead Sources: track referrers from page_views ---
  const { data: allReferrers } = await supabase
    .from("page_views")
    .select("referrer")
    .neq("referrer", "")
    .not("referrer", "is", null);

  const sourceCounts: Record<string, number> = {};
  
  if (allReferrers) {
    for (const row of allReferrers) {
      let ref = (row.referrer as string).toLowerCase();
      // Simplify referrer URLs into readable names
      if (ref.includes("google")) ref = "Google";
      else if (ref.includes("facebook") || ref.includes("fb.com")) ref = "Facebook";
      else if (ref.includes("twitter") || ref.includes("t.co") || ref.includes("x.com")) ref = "Twitter / X";
      else if (ref.includes("linkedin")) ref = "LinkedIn";
      else if (ref.includes("localhost") || ref.includes("127.0.0.1") || ref.includes(process.env.NEXT_PUBLIC_SITE_URL || "prolx.cloud")) continue; // Skip internal traffic
      else {
        try {
          const url = new URL(ref);
          ref = url.hostname.replace("www.", "");
        } catch {
          ref = "Direct / Other";
        }
      }
      
      sourceCounts[ref] = (sourceCounts[ref] || 0) + 1;
    }
  }
  
  // If no referrers tracked yet, add Direct as default
  if (Object.keys(sourceCounts).length === 0) {
    sourceCounts["Direct / Unknown"] = 1;
  }

  const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  const leadSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({
      source,
      pct: Math.round((count / total) * 100),
    }));

  // --- Recent Leads: latest 5 contacts ---
  const { data: recentLeads } = await supabase
    .from("contacts")
    .select("name, email, service, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  // --- Top Pages History (Last 7 Days) ---
  const topPagesCounts: Record<string, number> = {};
  if (pageViewRows) {
    for (const row of pageViewRows) {
      const path = (row as any).path || "/";
      topPagesCounts[path] = (topPagesCounts[path] || 0) + 1;
    }
  }

  const topPagesHistory = Object.entries(topPagesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, views]) => ({ page, views }));

  return {
    visitorTrend,
    leadSources,
    recentLeads: recentLeads || [],
    topPagesHistory,
  };
}

export async function submitSupportTicket(payload: {
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("contacts").insert({
    name: payload.name,
    email: payload.email,
    service: payload.category,
    message: `[SUPPORT TICKET | Priority: ${payload.priority} | Subject: ${payload.subject}]\n\n${payload.description}`,
    status: "New",
  }).select().single();

  if (data && !error) {
    // Admin Notification for Support Ticket
    try {
      const { sendEmail, adminNotificationTemplate, ADMIN_EMAIL } = await import("@/lib/email");
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[Support Ticket] ${payload.subject}`,
        html: adminNotificationTemplate({
          title: "New Support Ticket Received",
          message: `<strong>${payload.name}</strong> has submitted a support ticket.<br/><br/>Email: ${payload.email}<br/>Category: ${payload.category}<br/>Priority: ${payload.priority}<br/><br/><strong>Subject:</strong> ${payload.subject}<br/><strong>Description:</strong><br/>${payload.description}`,
          actionLabel: "View Tickets",
          actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://prolx.cloud"}/dashboard?tab=overview`,
        }),
      });
    } catch (emailErr) {
      console.error("Admin support ticket notification error:", emailErr);
    }
  }

  return { data, error };
}

export async function pingLiveVisitor(visitorId: string, path: string) {
  const supabase = await createClient();
  
  // We use upsert on visitor_id to update last_seen and current_path
  const { error } = await supabase
    .from('live_visitors')
    .upsert(
      { visitor_id: visitorId, current_path: path, last_seen: new Date().toISOString() },
      { onConflict: 'visitor_id' }
    );
    
  return { error: error ? error.message : null };
}

export async function getLiveVisitors() {
  const supabase = await createClient();
  
  // Get users active in the last 5 minutes
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('live_visitors')
    .select('*')
    .gte('last_seen', fiveMinsAgo);
    
  if (error || !data) return { activeCount: 0, topPages: [] };
  
  const activeCount = data.length;
  
  // Group by path to find top pages
  const pageCounts: Record<string, number> = {};
  data.forEach((visitor) => {
    const path = visitor.current_path || '/';
    pageCounts[path] = (pageCounts[path] || 0) + 1;
  });
  
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([path, count]) => ({ path, count }));
    
  return { activeCount, topPages };
}

export async function trackPageView(visitorId: string, path: string, referrer: string = "") {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('page_views')
    .insert({
      visitor_id: visitorId,
      path: path,
      referrer: referrer
    });
    
  return { error: error ? error.message : null };
}