-- Add cost_price to sale_items to track purchase price at time of sale for profit calculation
ALTER TABLE sale_items ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0;
