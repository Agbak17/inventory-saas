import request from "supertest";
import { serve } from "@hono/node-server";
import { createApp } from "../server";
import { makeMockSupabase } from "../test-utils/mockSupabase";

describe("GET /health", () => {
  it("returns status ok", async () => {
    const app = createApp({ supabase: makeMockSupabase() });
    const server = serve({ fetch: app.fetch, port: 0 });

    try {
      const res = await request(server).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    } finally {
      server.close();
    }
  });
});