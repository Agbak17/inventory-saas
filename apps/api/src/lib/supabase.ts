import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

console.log("SUPABASE DB ENV DEBUG", {
  hasUrl: !!supabaseUrl,
  url: supabaseUrl,
  hasServiceRoleKey: !!serviceRoleKey,
  serviceRoleKeyLength: serviceRoleKey.length,
  serviceRoleKeyHasNewline:
    serviceRoleKey.includes("\n") || serviceRoleKey.includes("\r"),
});

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey);