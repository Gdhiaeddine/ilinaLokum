"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSales() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createSale(formData: FormData, saleItems: { productId: string; quantity: number; price: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const total = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const { data: saleData, error: saleError } = await supabase.from("sales").insert({
    total_amount: total,
    date: new Date().toISOString(),
    notes: (formData.get("notes") as string) || null,
    user_id: user.id,
  }).select().single();

  if (saleError || !saleData) throw saleError;

  const itemsToInsert = saleItems.map(item => ({
    sale_id: saleData.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;
  revalidatePath("/sales");
  revalidatePath("/dashboard");
}
