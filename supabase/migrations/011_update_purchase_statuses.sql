-- Update purchase order status values to match new naming

-- Update existing records with old status names
UPDATE purchases SET status = 'pending' WHERE status = 'draft';
UPDATE purchases SET status = 'approved' WHERE status = 'submitted';
UPDATE purchases SET status = 'completed' WHERE status = 'paid';
-- 'received' stays as 'received'

-- Drop old check constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'purchases' AND constraint_name LIKE '%status%'
    ) THEN
        ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
    END IF;
END $$;

-- Add new check constraint with updated status values
ALTER TABLE purchases
ADD CONSTRAINT purchases_status_check
CHECK (status IN ('pending', 'approved', 'received', 'completed'));

-- Update default value
ALTER TABLE purchases
ALTER COLUMN status SET DEFAULT 'pending';
