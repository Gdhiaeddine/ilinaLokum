import { z } from "zod";

export const StockMovementSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  product_id: z.string().uuid(),
  quantity_change: z.number(),
  reason: z.string().min(1, "La raison est requise"),
  reference_id: z.string().uuid().nullable().optional(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;
