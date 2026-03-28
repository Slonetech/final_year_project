-- Update existing payment records to have varied payment methods
-- This will allow testing the payment method filter dropdown

DO $$
DECLARE
    payment_record RECORD;
    methods TEXT[] := ARRAY['cash', 'mpesa', 'bank_transfer', 'cheque'];
    method_index INT := 0;
BEGIN
    -- Update each payment record with a different method in rotation
    FOR payment_record IN 
        SELECT id FROM payments ORDER BY created_at
    LOOP
        method_index := method_index + 1;
        
        UPDATE payments 
        SET method = methods[(method_index % 4) + 1]
        WHERE id = payment_record.id;
    END LOOP;
    
    RAISE NOTICE 'Successfully updated payment methods with variations';
END $$;

-- Also ensure the method column exists and has proper constraint
DO $$
BEGIN
    -- Add check constraint for valid payment methods if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'payments' AND constraint_name = 'payments_method_check'
    ) THEN
        ALTER TABLE payments
        ADD CONSTRAINT payments_method_check
        CHECK (method IN ('cash', 'mpesa', 'bank_transfer', 'cheque'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint already exists, skipping';
END $$;
