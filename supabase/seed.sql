-- FinPal ERP - THE FINAL FIXED SEED SCRIPT (V5 - Deletion Order Fixed)
-- Correct User ID: bc025931-2c9a-4215-ae8e-b4f2ac187333

DO $$ 
DECLARE 
    target_user_id UUID := 'bc025931-2c9a-4215-ae8e-b4f2ac187333';
    saf_id UUID := uuid_generate_v4();
    eqty_id UUID := uuid_generate_v4();
    kplc_id UUID := uuid_generate_v4();
    safst_id UUID := uuid_generate_v4();
    acc_bank_id UUID := uuid_generate_v4();
    acc_rev_id UUID := uuid_generate_v4();
    acc_exp_id UUID := uuid_generate_v4();
    t text;
    -- ENFORCED DELETE ORDER (Children first, Parents last)
    tables text[] := ARRAY[
        'journal_entry_lines',
        'journal_entries',
        'payments',
        'invoices',
        'sale_items',
        'sales',
        'purchase_items',
        'purchases',
        'inventory',
        'customers',
        'suppliers',
        'chart_of_accounts'
    ];
BEGIN 
    -- 1. FIX SCHEMA (Per-user unique codes)
    BEGIN
        ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_account_code_key;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chart_of_accounts_code_user_unique') THEN
            ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_code_user_unique UNIQUE (account_code, user_id);
        END IF;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping constraint update'; END;

    -- 2. ENFORCED CLEAN (Correct Dependency Order)
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DELETE FROM %I', t);
    END LOOP;

    -- 3. SEED REAL KENYAN DATA
    -- Suppliers & Customers
    INSERT INTO suppliers (id, name, email, phone, address, city, user_id)
    VALUES 
        (kplc_id, 'Kenya Power & Lighting', 'service@kplc.co.ke', '+254711031000', 'Stima Plaza', 'Nairobi', target_user_id),
        (safst_id, 'Safari Stationery Ltd', 'sales@safaristationery.co.ke', '+254722000111', 'Moi Avenue', 'Nairobi', target_user_id);

    INSERT INTO customers (id, name, email, phone, city, balance, user_id)
    VALUES 
        (saf_id, 'Safaricom PLC', 'procurement@safaricom.co.ke', '+254700000000', 'Nairobi', 116000.00, target_user_id),
        (eqty_id, 'Equity Bank Kenya', 'finance@equitybank.co.ke', '+254711111111', 'Nairobi', 232000.00, target_user_id);

    -- Chart of Accounts
    INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, user_id)
    VALUES 
        (uuid_generate_v4(), '1010', 'Cash on Hand', 'Asset', target_user_id),
        (acc_bank_id, '1020', 'KCB Bank Account', 'Asset', target_user_id),
        (acc_rev_id, '4010', 'Sales Revenue', 'Revenue', target_user_id),
        (acc_exp_id, '5010', 'Office Expenses', 'Expense', target_user_id);

    -- Inventory
    INSERT INTO inventory (id, name, sku, category, quantity, cost_price, selling_price, reorder_level, user_id)
    VALUES (uuid_generate_v4(), 'Laptop Computer', 'LP-001', 'Electronics', 15, 65000.00, 85000.00, 5, target_user_id);

    -- Invoices
    INSERT INTO invoices (id, customer_id, invoice_number, issue_date, status, total_amount, user_id)
    VALUES 
        (uuid_generate_v4(), saf_id, 'INV-2024-001', CURRENT_DATE - 10, 'paid', 116000.00, target_user_id),
        (uuid_generate_v4(), eqty_id, 'INV-2024-002', CURRENT_DATE - 5, 'unpaid', 232000.00, target_user_id);

    -- Journal Entries for P&L
    DECLARE 
        je1_id UUID := uuid_generate_v4();
        je2_id UUID := uuid_generate_v4();
    BEGIN
        -- Revenue
        INSERT INTO journal_entries (id, entry_date, description, total_debit, total_credit, user_id)
        VALUES (je1_id, CURRENT_DATE - 30, 'Jan Revenue capture', 348000, 348000, target_user_id);
        
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, user_id)
        VALUES 
            (je1_id, acc_bank_id, 348000, 0, target_user_id),
            (je1_id, acc_rev_id, 0, 348000, target_user_id);

        -- Expenses
        INSERT INTO journal_entries (id, entry_date, description, total_debit, total_credit, user_id)
        VALUES (je2_id, CURRENT_DATE - 30, 'Jan Expense capture', 150000, 150000, target_user_id);
        
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, user_id)
        VALUES 
            (je2_id, acc_exp_id, 150000, 0, target_user_id),
            (je2_id, acc_bank_id, 0, 150000, target_user_id);
    END;

END $$;
