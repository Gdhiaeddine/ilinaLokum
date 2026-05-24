"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*, products(name, unit)), suppliers(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addPurchase(formData: FormData, items: { productId: string; quantity: number; price: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const dateStr = formData.get("purchase_date") as string;
  const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  const { data: purchaseData, error } = await supabase.from("purchase_orders").insert({
    supplier_id: formData.get("supplier_id") as string,
    total_amount: total,
    date,
    user_id: user.id,
  }).select().single();

  if (error || !purchaseData) throw error;

  const itemsToInsert = items.map(item => ({
    purchase_order_id: purchaseData.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase.from("purchase_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("current_stock")
      .eq("id", item.productId)
      .single();

    await supabase.from("products").update({
      current_stock: (product?.current_stock ?? 0) + item.quantity,
      production_cost: item.price,
    }).eq("id", item.productId);
  }

  revalidatePath("/purchases");
  revalidatePath("/products");
}

export async function deletePurchase(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/purchases");
}
