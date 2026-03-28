-- Migration to add user_id and RLS policies

-- List of tables to update
-- customers, suppliers, inventory, purchases, purchase_items, sales, sale_items, invoices, payments, chart_of_accounts, journal_entries, journal_entry_lines

DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'customers', 'suppliers', 'inventory', 'purchases', 'purchase_items', 
        'sales', 'sale_items', 'invoices', 'payments', 'chart_of_accounts', 
        'journal_entries', 'journal_entry_lines'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP
        -- Add user_id column if it doesn't exist
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()', t);
        
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- Dropping existing policies if any to avoid errors on re-run
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON %I', t);
        
        -- Create policies
        EXECUTE format('CREATE POLICY "Users can view own data" ON %I FOR SELECT USING (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Users can insert own data" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Users can update own data" ON %I FOR UPDATE USING (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Users can delete own data" ON %I FOR DELETE USING (auth.uid() = user_id)', t);
    END LOOP;
END $$;
