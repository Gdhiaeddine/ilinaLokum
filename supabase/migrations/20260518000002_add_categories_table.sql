-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user ON categories(user_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Add category_id FK to products
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Migrate existing text categories to the new table
-- For each user, insert distinct category values, then link products
INSERT INTO categories (user_id, name)
SELECT DISTINCT user_id, category
FROM products
WHERE category IS NOT NULL AND category <> '';

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE c.user_id = p.user_id AND c.name = p.category;

-- Drop old text column
ALTER TABLE products DROP COLUMN category;
