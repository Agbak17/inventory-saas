import { z } from "zod";

export const createItemSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative()
});