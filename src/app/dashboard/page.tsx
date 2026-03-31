import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AdminDashboard from "@/components/admin/admin-dashboard";
import StaffDashboard from "@/components/staff/staff-dashboard";
import ClientDashboard from "@/components/client/client-dashboard";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch profile to determine role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  // If no profile, show a diagnostic screen to help the developer fix their first account
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
          <p className="text-slate-600 mb-4">
            You are logged in as <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-700 font-semibold">{user.email}</code>.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-800 text-xs font-mono mb-6">
              Error from Supabase: {error.message} ({error.code})
            </div>
          )}
          
          <p className="text-slate-600 text-sm mb-6">
            Even if you ran the SQL, it might be that Row Level Security (RLS) is blocking the read. Run the block below to fix both the record and the permissions:
          </p>
          
          <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm mb-6 overflow-x-auto">
            <p className="text-blue-400 mb-2">-- RUN THIS SQL IN SUPABASE TO FIX YOUR ACCOUNT:</p>
            <pre className="text-emerald-400">
{`INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES ('${user.id}', '${user.email}', 'Admin User', 'admin', 'active')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', status = 'active';`}
            </pre>
          </div>
          
          <div className="flex gap-4">
            <Link href="/sign-in" className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors text-slate-700">Sign Out</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">I ran the SQL, Refresh Page</Link>
          </div>
        </div>
      </div>
    );
  }
  if (profile.status === "rejected") {
    return redirect("/sign-in?error=Account+rejected+by+admin");
  }

  // Route based on role
  if (profile.role === "admin") {
    return <AdminDashboard user={user} />;
  }
  if (profile.role === "staff") {
    return <StaffDashboard user={user} />;
  }

  // Client
  return <ClientDashboard user={user} />;
}
