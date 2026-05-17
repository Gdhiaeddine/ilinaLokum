"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getIngredients() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function addIngredient(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("ingredients").insert({
    name: formData.get("name") as string,
    unit: formData.get("unit") as string,
    current_stock: Number(formData.get("current_stock")),
    min_stock: Number(formData.get("min_stock")),
    avg_price: Number(formData.get("avg_price")),
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/ingredients");
}

export async function updateIngredient(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("ingredients").update({
    name: formData.get("name") as string,
    unit: formData.get("unit") as string,
    current_stock: Number(formData.get("current_stock")),
    min_stock: Number(formData.get("min_stock")),
    avg_price: Number(formData.get("avg_price")),
  }).eq("id", id);

  if (error) throw error;
  revalidatePath("/ingredients");
}

export async function deleteIngredient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/ingredients");
}
