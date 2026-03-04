import request from "supertest";
import { serve } from "@hono/node-server";
import { createApp } from "../server";
import { makeMockSupabase } from "../test-utils/mockSupabase";

const ORG_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

function makeServer(mockSupabase: any) {
  const app = createApp({ supabase: mockSupabase });
  return serve({ fetch: app.fetch, port: 0 });
}

describe("Items API", () => {
  it("GET /items returns 400 if orgId missing", async () => {
    const server = makeServer(makeMockSupabase());
    try {
      const res = await request(server).get("/items");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "orgId is required" });
    } finally {
      server.close();
    }
  });

  it("POST /items returns 400 on invalid body", async () => {
    const server = makeServer(makeMockSupabase());
    try {
      const res = await request(server)
        .post("/items")
        .set("Content-Type", "application/json")
        .send({ name: "" }); // invalid: missing orgId + quantity, name too short

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    } finally {
      server.close();
    }
  });

  it("POST /items creates an item (201)", async () => {
    const server = makeServer(
      makeMockSupabase({
        insertResult: {
          id: "11111111-1111-1111-1111-111111111111",
          org_id: ORG_ID,
          name: "Keyboard",
          sku: "KB-100",
          quantity: 5,
          created_at: new Date().toISOString(),
        },
      })
    );

    try {
      const res = await request(server)
        .post("/items")
        .set("Content-Type", "application/json")
        .send({
          orgId: ORG_ID,
          name: "Keyboard",
          sku: "KB-100",
          quantity: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("item");
      expect(res.body.item.name).toBe("Keyboard");
      expect(res.body.item.org_id).toBe(ORG_ID);
    } finally {
      server.close();
    }
  });

  it("POST /items returns 500 if DB insert fails", async () => {
    const server = makeServer(
      makeMockSupabase({ insertErrorMessage: "DB error" })
    );

    try {
      const res = await request(server)
        .post("/items")
        .set("Content-Type", "application/json")
        .send({
          orgId: ORG_ID,
          name: "Keyboard",
          sku: "KB-100",
          quantity: 5,
        });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "DB error" });
    } finally {
      server.close();
    }
  });
});