import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserOrgId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ orgId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { orgId: null, error: error.message };
  }

  if (!data) {
    return { orgId: null, error: "No organization found for user" };
  }

  return { orgId: data.org_id, error: null };
}