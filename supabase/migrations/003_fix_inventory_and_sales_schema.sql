-- Fix inventory table to match expected schema

-- Rename quantity to stock_level
ALTER TABLE inventory RENAME COLUMN quantity TO stock_level;

-- Rename reorder_level to reorder_point
ALTER TABLE inventory RENAME COLUMN reorder_level TO reorder_point;

-- Add reorder_quantity column
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 50;

-- Update sales table to match SalesOrder type
ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 16.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Rename total_amount to total for consistency
ALTER TABLE sales RENAME COLUMN total_amount TO total;

-- Rename sale_date to order_date for consistency
ALTER TABLE sales RENAME COLUMN sale_date TO order_date;

-- Generate order numbers for existing sales records
CREATE OR REPLACE FUNCTION generate_sale_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'SO-' || LPAD(nextval('sales_order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS sales_order_number_seq START 1000;

-- Create trigger for auto-generating order numbers
DROP TRIGGER IF EXISTS generate_sale_order_number_trigger ON sales;
CREATE TRIGGER generate_sale_order_number_trigger
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION generate_sale_order_number();

-- Update existing sales records with order numbers (if any exist)
DO $$
DECLARE
    sale_record RECORD;
    counter INTEGER := 1000;
BEGIN
    FOR sale_record IN SELECT id FROM sales WHERE order_number IS NULL ORDER BY created_at
    LOOP
        UPDATE sales SET order_number = 'SO-' || LPAD(counter::TEXT, 6, '0') WHERE id = sale_record.id;
        counter := counter + 1;
    END LOOP;

    -- Update sequence to continue from last number
    IF counter > 1000 THEN
        PERFORM setval('sales_order_number_seq', counter);
    END IF;
END $$;

-- Set created_by to user_id for existing records
UPDATE sales SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Make order_number NOT NULL after populating
ALTER TABLE sales ALTER COLUMN order_number SET NOT NULL;
