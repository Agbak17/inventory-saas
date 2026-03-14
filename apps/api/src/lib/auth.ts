import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

let cachedSupabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabaseAdmin) {
    return cachedSupabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  }

  cachedSupabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  return cachedSupabaseAdmin;
}

export async function getUserFromAuthHeader(authHeader?: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const supabaseAdmin = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
}