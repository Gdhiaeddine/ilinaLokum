import { z } from "zod";

export const RecipeItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  quantity: z.number().positive("La quantité doit être positive"),
});

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  items: z.array(RecipeItemSchema).min(1, "Une recette doit contenir au moins un produit"),
  notes: z.string().nullable().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeItem = z.infer<typeof RecipeItemSchema>;
