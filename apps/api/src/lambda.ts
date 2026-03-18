import { handle } from "hono/aws-lambda";
import { createApp } from "./server";
import { supabase } from "./lib/supabase";

const app = createApp({ supabase });

export const handler = handle(app);