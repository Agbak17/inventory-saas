import { serve } from "@hono/node-server";
import { createApp } from "./server";
import { supabase } from "./lib/supabase";

const app = createApp({ supabase });

const port = Number(process.env.PORT ?? 4000);
console.log(`API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });