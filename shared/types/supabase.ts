export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string | null;
          address: string | null;
          email: string | null;
          notes: string | null;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["suppliers"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
      };
      ingredients: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          unit: string;
          current_stock: number;
          min_stock: number;
          avg_price: number;
          supplier_id: string | null;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ingredients"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["ingredients"]["Insert"]>;
      };
      purchase_orders: {
        Row: {
          id: string;
          created_at: string;
          supplier_id: string;
          total_amount: number;
          date: string;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["purchase_orders"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["purchase_orders"]["Insert"]>;
      };
      purchase_items: {
        Row: {
          id: string;
          created_at: string;
          purchase_order_id: string;
          ingredient_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["purchase_items"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["purchase_items"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          image_url: string | null;
          selling_price: number;
          production_cost: number;
          category: string;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      recipes: {
        Row: {
          id: string;
          created_at: string;
          product_id: string;
          notes: string | null;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recipes"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
      };
      recipe_items: {
        Row: {
          id: string;
          created_at: string;
          recipe_id: string;
          ingredient_id: string;
          quantity: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recipe_items"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["recipe_items"]["Insert"]>;
      };
      sales: {
        Row: {
          id: string;
          created_at: string;
          total_amount: number;
          date: string;
          notes: string | null;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sales"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["sales"]["Insert"]>;
      };
      sale_items: {
        Row: {
          id: string;
          created_at: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sale_items"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["sale_items"]["Insert"]>;
      };
      stock_movements: {
        Row: {
          id: string;
          created_at: string;
          ingredient_id: string;
          quantity_change: number;
          reason: string;
          reference_id: string | null;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["stock_movements"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Insert"]>;
      };
      expenses: {
        Row: {
          id: string;
          created_at: string;
          description: string;
          amount: number;
          date: string;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["expenses"]["Row"],
          "id" | "created_at" | "user_id"
        >;
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
