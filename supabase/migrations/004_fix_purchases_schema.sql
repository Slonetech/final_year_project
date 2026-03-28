-- Fix purchases table to match PurchaseOrder type

-- Add new columns
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS expected_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 16.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Rename columns
ALTER TABLE purchases RENAME COLUMN total_amount TO total;
ALTER TABLE purchases RENAME COLUMN purchase_date TO order_date;

-- Generate order numbers for existing purchases records
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'PO-' || LPAD(nextval('purchase_order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS purchase_order_number_seq START 1000;

-- Create trigger for auto-generating order numbers
DROP TRIGGER IF EXISTS generate_purchase_order_number_trigger ON purchases;
CREATE TRIGGER generate_purchase_order_number_trigger
    BEFORE INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION generate_purchase_order_number();

-- Update existing purchases records with order numbers (if any exist)
DO $$
DECLARE
    purchase_record RECORD;
    counter INTEGER := 1000;
BEGIN
    FOR purchase_record IN SELECT id FROM purchases WHERE order_number IS NULL ORDER BY created_at
    LOOP
        UPDATE purchases SET order_number = 'PO-' || LPAD(counter::TEXT, 6, '0') WHERE id = purchase_record.id;
        counter := counter + 1;
    END LOOP;

    -- Update sequence to continue from last number
    IF counter > 1000 THEN
        PERFORM setval('purchase_order_number_seq', counter);
    END IF;
END $$;

-- Set created_by to user_id for existing records
UPDATE purchases SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Make order_number NOT NULL after populating
ALTER TABLE purchases ALTER COLUMN order_number SET NOT NULL;
