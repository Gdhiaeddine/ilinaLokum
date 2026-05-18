"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("categories").insert({
    name: formData.get("name") as string,
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").update({
    name: formData.get("name") as string,
  }).eq("id", id);

  if (error) throw error;
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/categories");
}
