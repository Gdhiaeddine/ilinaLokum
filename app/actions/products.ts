"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("products").insert({
    name: formData.get("name") as string,
    category_id: (formData.get("category_id") as string) || null,
    selling_price: Number(formData.get("selling_price")),
    production_cost: Number(formData.get("production_cost")),
    current_stock: Number(formData.get("current_stock")),
    min_stock: Number(formData.get("min_stock")),
    unit: formData.get("unit") as string,
    avg_price: Number(formData.get("avg_price")),
    image_url: (formData.get("image_url") as string) || null,
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").update({
    name: formData.get("name") as string,
    category_id: (formData.get("category_id") as string) || null,
    selling_price: Number(formData.get("selling_price")),
    production_cost: Number(formData.get("production_cost")),
    current_stock: Number(formData.get("current_stock")),
    min_stock: Number(formData.get("min_stock")),
    unit: formData.get("unit") as string,
    avg_price: Number(formData.get("avg_price")),
    image_url: (formData.get("image_url") as string) || null,
  }).eq("id", id);

  if (error) throw error;
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/products");
}
