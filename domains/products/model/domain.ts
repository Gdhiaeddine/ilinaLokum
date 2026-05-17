import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom est requis"),
  image_url: z.string().url().nullable().optional(),
  selling_price: z.number().positive("Le prix de vente doit être positif"),
  production_cost: z.number().min(0, "Le coût ne peut pas être négatif"),
  category: z.string().min(1, "La catégorie est requise"),
});

export type Product = z.infer<typeof ProductSchema>;
