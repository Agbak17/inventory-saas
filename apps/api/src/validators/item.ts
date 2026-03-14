import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative(),
});