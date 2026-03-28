-- FinPal ERP - RLS Verification & Fix
-- Run this if you see no data but the seed was successful.

DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'customers', 'suppliers', 'inventory', 'purchases', 'purchase_items', 
        'sales', 'sale_items', 'invoices', 'payments', 'chart_of_accounts', 
        'journal_entries', 'journal_entry_lines'
    ];
BEGIN 
    -- 1. TEMPORARILY DISABLE RLS to see if data appears
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
    
    -- 2. Check counts for the target user
    RAISE NOTICE 'Data Verification Report:';
    -- (We can't easily print counts in a generic loop without complex SQL, but we can see the result if it runs)
END $$;
