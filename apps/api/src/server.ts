import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createItemSchema } from "./validators/item";
import { getUserFromAuthHeader } from "./lib/auth";
import { getUserOrgId } from "./lib/orgs";

type Deps = {
  supabase: SupabaseClient;
};

export function createApp(deps: Deps) {
  const app = new Hono();

  app.onError((err, c) => {
    console.error("API Error:", err);

    return c.json(
      {
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      500
    );
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.get("/items", async (c) => {
    const authHeader = c.req.header("authorization");
    const { user, error: authError } = await getUserFromAuthHeader(authHeader);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orgId, error: orgError } = await getUserOrgId(
      deps.supabase,
      user.id
    );

    if (orgError || !orgId) {
      return c.json({ error: orgError ?? "No organization found" }, 404);
    }

    const { data, error } = await deps.supabase
      .from("items")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ items: data ?? [] });
  });

  app.post("/items", async (c) => {
    const authHeader = c.req.header("authorization");
    const { user, error: authError } = await getUserFromAuthHeader(authHeader);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orgId, error: orgError } = await getUserOrgId(
      deps.supabase,
      user.id
    );

    if (orgError || !orgId) {
      return c.json({ error: orgError ?? "No organization found" }, 404);
    }

    const body = await c.req.json();

    const result = createItemSchema.safeParse(body);
    if (!result.success) {
      return c.json({ error: result.error.flatten() }, 400);
    }

    const { name, sku, quantity } = result.data;

    const { data, error } = await deps.supabase
      .from("items")
      .insert({
        org_id: orgId,
        name,
        sku,
        quantity,
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ item: data }, 201);
  });

  return app;
}