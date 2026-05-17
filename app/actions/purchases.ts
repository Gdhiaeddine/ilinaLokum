"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*, ingredients(name)), suppliers(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addPurchase(formData: FormData, items: { ingredientId: string; quantity: number; price: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const { data: purchaseData, error } = await supabase.from("purchase_orders").insert({
    supplier_id: formData.get("supplier_id") as string,
    total_amount: total,
    date: new Date().toISOString(),
    user_id: user.id,
  }).select().single();

  if (error || !purchaseData) throw error;

  const itemsToInsert = items.map(item => ({
    purchase_order_id: purchaseData.id,
    ingredient_id: item.ingredientId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase.from("purchase_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;
  revalidatePath("/purchases");
  revalidatePath("/ingredients");
}
