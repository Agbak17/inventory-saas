"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getApiBaseUrl } from "@/lib/config";

type Item = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  created_at: string;
};

type UserState = {
  email: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      const supabase = getSupabaseClient();

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        setUser({ email: session.user.email ?? null });

        const res = await fetch(`${getApiBaseUrl()}/items`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load items");
          return;
        }

        setItems(data.items ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleCreateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const supabase = getSupabaseClient();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          sku,
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create item");
        return;
      }

      setItems((prev) => [data.item, ...prev]);
      setName("");
      setSku("");
      setQuantity(0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create item";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="mb-6 text-sm text-gray-600">
          Logged in as: {user?.email}
        </p>

        <form onSubmit={handleCreateItem} className="space-y-3 mb-8">
          <h2 className="text-lg font-medium">Create Item</h2>

          <input
            type="text"
            placeholder="Item name"
            className="w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="SKU"
            className="w-full rounded-lg border px-3 py-2"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantity"
            className="w-full rounded-lg border px-3 py-2"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={0}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg border px-4 py-2"
          >
            {submitting ? "Adding..." : "Add Item"}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="rounded-xl border p-4 mb-6">
          <h2 className="font-medium mb-3">Items</h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-600">No items yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border p-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    SKU: {item.sku || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border px-4 py-2"
        >
          Log out
        </button>
      </div>
    </main>
  );
}