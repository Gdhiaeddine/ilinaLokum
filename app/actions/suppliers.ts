"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function addSupplier(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("suppliers").insert({
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    email: formData.get("email") as string,
    notes: formData.get("notes") as string,
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("suppliers").update({
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    email: formData.get("email") as string,
    notes: formData.get("notes") as string,
  }).eq("id", id);

  if (error) throw error;
  revalidatePath("/suppliers");
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/suppliers");
}
