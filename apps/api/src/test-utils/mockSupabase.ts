type Options = {
  itemsSelectResult?: any[];
  insertResult?: any;
  insertErrorMessage?: string | null;
};

export function makeMockSupabase(options?: Options) {
  const itemsSelectResult = options?.itemsSelectResult ?? [];

  const insertResult =
    options?.insertResult ??
    {
      id: "11111111-1111-1111-1111-111111111111",
      org_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      name: "Keyboard",
      sku: "KB-100",
      quantity: 5,
      created_at: new Date().toISOString(),
    };

  const insertErrorMessage = options?.insertErrorMessage ?? null;

  // Minimal supabase-like chain to support:
  // - from("items").select("*").eq(...).order(...)
  // - from("items").insert(...).select().single()
  return {
    from: (_table: string) => ({
      // GET /items chain
      select: (_cols?: string) => ({
        eq: (_col: string, _value: any) => ({
          order: async (_col2: string, _opts?: any) => ({
            data: itemsSelectResult,
            error: null,
          }),
        }),
      }),

      // POST /items chain
      insert: (_row: any) => ({
        select: (_cols?: string) => ({
          single: async () => ({
            data: insertErrorMessage ? null : insertResult,
            error: insertErrorMessage ? { message: insertErrorMessage } : null,
          }),
        }),
      }),
    }),
  } as any;
}