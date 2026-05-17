import { z } from "zod";

export const SaleItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive("La quantité doit être positive"),
  unit_price: z.number().positive("Le prix unitaire doit être positif"),
});

export const SaleSchema = z.object({
  id: z.string().uuid().optional(),
  total_amount: z.number().min(0),
  date: z.string().datetime().default(() => new Date().toISOString()),
  notes: z.string().nullable().optional(),
  items: z.array(SaleItemSchema).min(1, "Une vente doit contenir au moins un produit"),
});

export type Sale = z.infer<typeof SaleSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
