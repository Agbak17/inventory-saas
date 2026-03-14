import request from "supertest";
import { serve } from "@hono/node-server";
import { createApp } from "../server";
import { makeMockSupabase } from "../test-utils/mockSupabase";
import { getUserFromAuthHeader } from "../lib/auth";
import { getUserOrgId } from "../lib/orgs";

jest.mock("../lib/auth", () => ({
  getUserFromAuthHeader: jest.fn(),
}));

jest.mock("../lib/orgs", () => ({
  getUserOrgId: jest.fn(),
}));

const mockedGetUserFromAuthHeader = getUserFromAuthHeader as jest.Mock;
const mockedGetUserOrgId = getUserOrgId as jest.Mock;

const ORG_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const USER_ID = "9c7d9d9c-1234-4a56-8bcd-123456789abc";

function makeServer(mockSupabase: any) {
  const app = createApp({ supabase: mockSupabase });
  return serve({ fetch: app.fetch, port: 0 });
}

describe("Items API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /items returns 401 if authorization is missing or invalid", async () => {
    mockedGetUserFromAuthHeader.mockResolvedValue({
      user: null,
      error: "Unauthorized",
    });

    const server = makeServer(makeMockSupabase());

    try {
      const res = await request(server).get("/items");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    } finally {
      server.close();
    }
  });

  it("POST /items returns 400 on invalid body when user is authenticated", async () => {
    mockedGetUserFromAuthHeader.mockResolvedValue({
      user: { id: USER_ID },
      error: null,
    });

    mockedGetUserOrgId.mockResolvedValue({
      orgId: ORG_ID,
      error: null,
    });

    const server = makeServer(makeMockSupabase());

    try {
      const res = await request(server)
        .post("/items")
        .set("Authorization", "Bearer fake-token")
        .set("Content-Type", "application/json")
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    } finally {
      server.close();
    }
  });

  it("POST /items creates an item (201)", async () => {
    mockedGetUserFromAuthHeader.mockResolvedValue({
      user: { id: USER_ID },
      error: null,
    });

    mockedGetUserOrgId.mockResolvedValue({
      orgId: ORG_ID,
      error: null,
    });

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
        .set("Authorization", "Bearer fake-token")
        .set("Content-Type", "application/json")
        .send({
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
    mockedGetUserFromAuthHeader.mockResolvedValue({
      user: { id: USER_ID },
      error: null,
    });

    mockedGetUserOrgId.mockResolvedValue({
      orgId: ORG_ID,
      error: null,
    });

    const server = makeServer(
      makeMockSupabase({ insertErrorMessage: "DB error" })
    );

    try {
      const res = await request(server)
        .post("/items")
        .set("Authorization", "Bearer fake-token")
        .set("Content-Type", "application/json")
        .send({
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

  it("GET /items returns items for an authenticated user", async () => {
    mockedGetUserFromAuthHeader.mockResolvedValue({
      user: { id: USER_ID },
      error: null,
    });

    mockedGetUserOrgId.mockResolvedValue({
      orgId: ORG_ID,
      error: null,
    });

    const server = makeServer(
      makeMockSupabase({
        itemsSelectResult: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            org_id: ORG_ID,
            name: "Keyboard",
            sku: "KB-100",
            quantity: 5,
            created_at: new Date().toISOString(),
          },
        ],
      })
    );

    try {
      const res = await request(server)
        .get("/items")
        .set("Authorization", "Bearer fake-token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe("Keyboard");
    } finally {
      server.close();
    }
  });
});