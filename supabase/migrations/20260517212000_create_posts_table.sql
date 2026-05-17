-- Kunafa Manager - Schema Supabase
-- =====================================================

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (managed by Supabase Auth, but we reference it)
-- profiles table for extra user info
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  store_name TEXT DEFAULT 'Ma Boutique',
  currency TEXT DEFAULT 'DZD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  notes TEXT,

  CONSTRAINT unique_supplier_name_per_user UNIQUE (user_id, name)
);

-- Ingredients/Stock
CREATE TABLE ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  CONSTRAINT unique_ingredient_name_per_user UNIQUE (user_id, name)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Purchase Items
CREATE TABLE purchase_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  production_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'kunafa',

  CONSTRAINT unique_product_name_per_user UNIQUE (user_id, name)
);

-- Recipes
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT,
  notes TEXT
);

-- Recipe Items (ingredients in a recipe)
CREATE TABLE recipe_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,

  CONSTRAINT unique_recipe_ingredient UNIQUE (recipe_id, ingredient_id)
);

-- Sales
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Sale Items
CREATE TABLE sale_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Stock Movements
CREATE TABLE stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_change DECIMAL(10,2) NOT NULL, -- positive = in, negative = out
  reason TEXT NOT NULL,
  reference_id UUID,
  movement_type TEXT DEFAULT 'manual' -- 'purchase', 'sale', 'manual', 'adjustment'
);

-- Expenses (miscellaneous)
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create indexes
CREATE INDEX idx_suppliers_user ON suppliers(user_id);
CREATE INDEX idx_ingredients_user ON ingredients(user_id);
CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_purchase_orders_user ON purchase_orders(user_id);
CREATE INDEX idx_purchase_items_order ON purchase_items(purchase_order_id);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_recipes_product ON recipes(product_id);
CREATE INDEX idx_recipe_items_recipe ON recipe_items(recipe_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_stock_movements_user ON stock_movements(user_id);
CREATE INDEX idx_stock_movements_ingredient ON stock_movements(ingredient_id);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can only see their own suppliers" ON suppliers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own ingredients" ON ingredients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own purchase_orders" ON purchase_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own purchase_items" ON purchase_items
  FOR ALL USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only see their own products" ON products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own recipe_items" ON recipe_items
  FOR ALL USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only see their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own sale_items" ON sale_items
  FOR ALL USING (
    sale_id IN (
      SELECT id FROM sales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only see their own stock_movements" ON stock_movements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- Triggers
-- =====================================================

-- When a purchase is made, update ingredient stock
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients
  SET current_stock = current_stock + NEW.quantity
  WHERE id = NEW.ingredient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- When a sale is made, deduct from ingredient stock (via recipes)
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  recipe_record RECORD;
BEGIN
  -- Find the recipe for this product
  FOR recipe_record IN
    SELECT ri.ingredient_id, ri.quantity * NEW.quantity as total_quantity
    FROM recipe_items ri
    JOIN recipes r ON ri.recipe_id = r.id
    WHERE r.product_id = NEW.product_id
  LOOP
    -- Deduct from stock
    UPDATE ingredients
    SET current_stock = GREATEST(current_stock - recipe_record.total_quantity, 0)
    WHERE id = recipe_record.ingredient_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate purchase total automatically
CREATE OR REPLACE FUNCTION calculate_purchase_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total_amount = total_amount + (NEW.quantity * NEW.unit_price)
  WHERE id = NEW.purchase_order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate sale total automatically
CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sales
  SET total_amount = total_amount + (NEW.quantity * NEW.unit_price)
  WHERE id = NEW.sale_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stock movement logging
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <> OLD.current_stock THEN
    INSERT INTO stock_movements (user_id, ingredient_id, quantity_change, reason, reference_id)
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.current_stock - OLD.current_stock,
      'Manual adjustment',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

print('Schema Kunafa Manager created successfully!')
