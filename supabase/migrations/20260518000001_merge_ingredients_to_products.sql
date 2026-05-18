-- Migration: Fusion des ingrédients dans les produits
-- =====================================================
-- Cette migration ajoute les colonnes de stock à la table products
-- et modifie les tables liées pour utiliser product_id au lieu de ingredient_id

-- =====================================================
-- Étape 2: Ajout des colonnes de stock à la table products
-- =====================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS avg_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- =====================================================
-- Étape 3: Modification de recipe_items (remplacer ingredient_id par product_id)
-- =====================================================
ALTER TABLE recipe_items
  DROP CONSTRAINT IF EXISTS unique_recipe_ingredient;

ALTER TABLE recipe_items
  DROP CONSTRAINT IF EXISTS recipe_items_ingredient_id_fkey;

ALTER TABLE recipe_items
  RENAME COLUMN ingredient_id TO product_id;

ALTER TABLE recipe_items
  ADD CONSTRAINT recipe_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE recipe_items
  ADD CONSTRAINT unique_recipe_product UNIQUE (recipe_id, product_id);

-- =====================================================
-- Étape 4: Modification de purchase_items (remplacer ingredient_id par product_id)
-- =====================================================
ALTER TABLE purchase_items
  DROP CONSTRAINT IF EXISTS purchase_items_ingredient_id_fkey;

ALTER TABLE purchase_items
  RENAME COLUMN ingredient_id TO product_id;

ALTER TABLE purchase_items
  ADD CONSTRAINT purchase_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- =====================================================
-- Étape 5: Modification de stock_movements (remplacer ingredient_id par product_id)
-- =====================================================
ALTER TABLE stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_ingredient_id_fkey;

ALTER TABLE stock_movements
  RENAME COLUMN ingredient_id TO product_id;

ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- =====================================================
-- Étape 6: Suppression de la table ingredients et ses liens
-- =====================================================
DROP INDEX IF EXISTS idx_ingredients_user;
DROP INDEX IF EXISTS idx_ingredients_supplier;

DROP TABLE IF EXISTS ingredients CASCADE;

-- =====================================================
-- Étape 7: Mise à jour des index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

-- =====================================================
-- Étape 8: Mise à jour de la contrainte unique
-- =====================================================
-- Déjà géré plus haut avec unique_product_name_per_user dans schema.sql

-- =====================================================
-- Étape 9: Mise à jour des triggers pour utiliser product_id
-- =====================================================
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  recipe_record RECORD;
BEGIN
  FOR recipe_record IN
    SELECT ri.product_id, ri.quantity * NEW.quantity as total_quantity
    FROM recipe_items ri
    JOIN recipes r ON ri.recipe_id = r.id
    WHERE r.product_id = NEW.product_id
  LOOP
    UPDATE products
    SET current_stock = GREATEST(current_stock - recipe_record.total_quantity, 0)
    WHERE id = recipe_record.product_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <> OLD.current_stock THEN
    INSERT INTO stock_movements (user_id, product_id, quantity_change, reason, reference_id)
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

-- =====================================================
-- Étape 10: Mise à jour des politiques RLS
-- =====================================================
-- Supprimer les anciennes politiques liées à ingredients
DROP POLICY IF EXISTS "Users can only see their own ingredients" ON ingredients;

-- Les politiques sont déjà bien configurées via schema.sql
