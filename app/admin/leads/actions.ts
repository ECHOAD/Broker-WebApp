"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrokerAdmin } from "@/lib/auth";
import { Database } from "@/lib/supabase/database.types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const ALLOWED_LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "meeting_requested",
  "meeting_scheduled",
  "negotiation",
  "closed_won",
  "closed_lost",
  "archived",
];

export async function updateLeadStatus(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as LeadStatus;

  if (!leadId || !ALLOWED_LEAD_STATUSES.includes(status)) {
    redirect("/admin/leads");
  }

  const { supabase, user } = await requireBrokerAdmin();

  const { error } = await supabase
    .from("leads")
    .update({
      current_status: status,
      updated_by: user.id,
    })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/leads");
  redirect(`/admin/leads?lead=${leadId}`);
}
