"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, unit, created_at")
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
    unit: formData.get("unit") as string,
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").update({
    name: formData.get("name") as string,
    unit: formData.get("unit") as string,
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
