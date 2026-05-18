import { z } from "zod";

export const PurchaseItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  quantity: z.number().positive("La quantité doit être positive"),
  unit_price: z.number().positive("Le prix unitaire doit être positif"),
});

export const PurchaseSchema = z.object({
  id: z.string().uuid().optional(),
  supplier_id: z.string().uuid(),
  total_amount: z.number().min(0),
  date: z.string().datetime(),
  items: z.array(PurchaseItemSchema).min(1, "Un achat doit contenir au moins un article"),
});

export type Purchase = z.infer<typeof PurchaseSchema>;
export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;
