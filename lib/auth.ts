import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireBrokerAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile || profile.role !== "broker_admin") {
    redirect("/admin");
  }

  return { user, profile, supabase };
}
