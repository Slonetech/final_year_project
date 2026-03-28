-- Fix payments table to match Payment type

-- Add missing columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_number TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('received', 'made'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Rename payment_method to method for consistency
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'payment_method'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'method'
    ) THEN
        ALTER TABLE payments RENAME COLUMN payment_method TO method;
    END IF;
END $$;

-- Rename payment_date to date for consistency (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'payment_date'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'date'
    ) THEN
        ALTER TABLE payments RENAME COLUMN payment_date TO date;
    END IF;
END $$;

-- Generate payment numbers function
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL THEN
        NEW.payment_number := 'PAY-' || LPAD(nextval('payment_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for payment numbers
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1000;

-- Create trigger for auto-generating payment numbers
DROP TRIGGER IF EXISTS generate_payment_number_trigger ON payments;
CREATE TRIGGER generate_payment_number_trigger
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

-- Update existing payments with payment numbers
DO $$
DECLARE
    payment_record RECORD;
    counter INTEGER := 1000;
BEGIN
    FOR payment_record IN SELECT id FROM payments WHERE payment_number IS NULL ORDER BY created_at
    LOOP
        UPDATE payments SET payment_number = 'PAY-' || LPAD(counter::TEXT, 6, '0') WHERE id = payment_record.id;
        counter := counter + 1;
    END LOOP;
    IF counter > 1000 THEN
        PERFORM setval('payment_number_seq', counter);
    END IF;
END $$;

-- Set default type for existing records (assume 'made' if not set)
UPDATE payments SET type = 'made' WHERE type IS NULL;

-- Set created_by from user_id for existing records
UPDATE payments SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL;
