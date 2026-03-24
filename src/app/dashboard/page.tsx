import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <AdminDashboard user={user} />;
}
