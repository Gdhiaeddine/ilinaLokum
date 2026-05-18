import { z } from "zod";

export const UnitEnum = z.enum(["kg", "g", "l", "ml", "piece", "boite", "sachet"]);

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom est requis"),
  image_url: z.string().url().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  selling_price: z.number().positive("Le prix de vente doit être positif"),
  production_cost: z.number().min(0, "Le coût ne peut pas être négatif"),
  current_stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  min_stock: z.number().min(0, "Le stock minimum ne peut pas être négatif"),
  unit: UnitEnum,
  avg_price: z.number().min(0, "Le prix moyen ne peut pas être négatif").default(0),
  supplier_id: z.string().uuid().nullable().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Unit = z.infer<typeof UnitEnum>;
