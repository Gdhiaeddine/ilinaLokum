import { z } from "zod";

export const UnitEnum = z.enum(["kg", "g", "l", "ml", "piece", "boite", "sachet"]);

export const IngredientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom est requis"),
  unit: UnitEnum,
  current_stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  min_stock: z.number().min(0, "Le stock minimum ne peut pas être négatif"),
  avg_price: z.number().min(0).default(0),
  supplier_id: z.string().uuid().nullable().optional(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type Unit = z.infer<typeof UnitEnum>;
