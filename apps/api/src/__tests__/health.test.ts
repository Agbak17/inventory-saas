import request from "supertest";
import { app } from "../server";
import { serve } from "@hono/node-server";

describe("GET /health", () => {
  it("returns status ok", async () => {
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