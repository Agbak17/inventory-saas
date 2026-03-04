import { Hono } from "hono";
import { createItemSchema } from "./validators/item";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as realSupabase } from "./lib/supabase";

type Deps = {
  supabase: SupabaseClient;
};

export function createApp(deps: Deps) {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.get("/items", async (c) => {
    const orgId = c.req.query("orgId");
    if (!orgId) return c.json({ error: "orgId is required" }, 400);

    const { data, error } = await deps.supabase
      .from("items")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ items: data });
  });

  app.post("/items", async (c) => {
    const body = await c.req.json();

    const result = createItemSchema.safeParse(body);
    if (!result.success) {
      console.log(result.error.flatten());  
      return c.json({ error: result.error.flatten() }, 400);
    }

    const { orgId, name, sku, quantity } = result.data;

    const { data, error } = await deps.supabase
      .from("items")
      .insert({ org_id: orgId, name, sku, quantity })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);

    return c.json({ item: data }, 201);
  });

  return app;
}

// Default app used by runtime
export const app = createApp({ supabase: realSupabase });