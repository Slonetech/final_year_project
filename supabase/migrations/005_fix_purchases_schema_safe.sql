-- Safe migration for purchases table that checks column existence

-- Add new columns (IF NOT EXISTS makes this safe to run multiple times)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS expected_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 16.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Safely add 'total' column if it doesn't exist
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) DEFAULT 0.00;

-- Safely add 'order_date' column if it doesn't exist
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename columns only if old ones exist and new ones don't
DO $$
BEGIN
    -- Check if we need to rename total_amount to total
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchases' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE purchases RENAME COLUMN total_amount TO total;
    END IF;

    -- Check if we need to rename purchase_date to order_date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchases' AND column_name = 'purchase_date'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchases' AND column_name = 'order_date'
    ) THEN
        ALTER TABLE purchases RENAME COLUMN purchase_date TO order_date;
    END IF;
END $$;

-- Generate order numbers function
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

-- Update existing purchases records with order numbers
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
    IF counter > 1000 THEN
        PERFORM setval('purchase_order_number_seq', counter);
    END IF;
END $$;

-- Set created_by to user_id for existing records
UPDATE purchases SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Make order_number NOT NULL and UNIQUE after populating (only if column exists and has data)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchases' AND column_name = 'order_number'
    ) THEN
        -- Add UNIQUE constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'purchases' AND constraint_type = 'UNIQUE'
            AND constraint_name = 'purchases_order_number_key'
        ) THEN
            ALTER TABLE purchases ADD CONSTRAINT purchases_order_number_key UNIQUE (order_number);
        END IF;

        -- Make NOT NULL only if all records have order_number
        IF NOT EXISTS (SELECT 1 FROM purchases WHERE order_number IS NULL) THEN
            ALTER TABLE purchases ALTER COLUMN order_number SET NOT NULL;
        END IF;
    END IF;
END $$;
