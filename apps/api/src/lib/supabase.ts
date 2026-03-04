import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log("ENV DEBUG:", process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey);