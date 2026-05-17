"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRecipes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select("*, products(name), recipe_items(*, ingredients(name, unit))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addRecipe(formData: FormData, items: { ingredientId: string; quantity: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: recipe, error } = await supabase.from("recipes").insert({
    product_id: formData.get("product_id") as string,
    notes: (formData.get("notes") as string) || null,
    user_id: user.id,
  }).select().single();

  if (error || !recipe) throw error;

  const itemsToInsert = items.map(item => ({
    recipe_id: recipe.id,
    ingredient_id: item.ingredientId,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("recipe_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;
  revalidatePath("/recipes");
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/recipes");
}
