"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;

  if (!description || isNaN(amount) || !date) {
    throw new Error("Tous les champs sont obligatoires");
  }

  const { error } = await supabase.from("expenses").insert({
    description,
    amount,
    date,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/expenses");
}
