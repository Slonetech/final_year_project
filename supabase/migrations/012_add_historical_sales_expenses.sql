-- Add sample historical invoices and purchases for last 10 months
-- This will populate the Sales & Expenses Trend chart with data

DO $$
DECLARE
    user_uuid UUID;
    customer_uuid UUID;
    supplier_uuid UUID;
    month_offset INT;
    invoice_date DATE;
    purchase_date DATE;
    invoice_amount DECIMAL(15,2);
    purchase_amount DECIMAL(15,2);
BEGIN
    -- Get the first user (assuming single-user demo)
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Get first customer and supplier
    SELECT id INTO customer_uuid FROM customers LIMIT 1;
    SELECT id INTO supplier_uuid FROM suppliers LIMIT 1;
    
    -- Only proceed if we have necessary data
    IF user_uuid IS NOT NULL AND customer_uuid IS NOT NULL AND supplier_uuid IS NOT NULL THEN
        -- Generate data for last 10 months
        FOR month_offset IN 0..9 LOOP
            -- Calculate date for this month (starting from 9 months ago)
            invoice_date := CURRENT_DATE - (9 - month_offset) * INTERVAL '1 month';
            purchase_date := CURRENT_DATE - (9 - month_offset) * INTERVAL '1 month';
            
            -- Generate varying amounts with some randomness (sales generally higher than expenses)
            invoice_amount := 80000 + (month_offset * 5000) + ((month_offset % 3) * 10000);
            purchase_amount := 45000 + (month_offset * 3000) + ((month_offset % 2) * 8000);
            
            -- Insert invoice (sales)
            INSERT INTO invoices (
                customer_id,
                invoice_number,
                issue_date,
                invoice_date,
                due_date,
                status,
                total_amount,
                user_id
            ) VALUES (
                customer_uuid,
                'INV-HIST-' || TO_CHAR(invoice_date, 'YYYY-MM') || '-' || LPAD(month_offset::text, 3, '0'),
                invoice_date,
                invoice_date,
                invoice_date + INTERVAL '30 days',
                CASE WHEN month_offset < 8 THEN 'paid' ELSE 'unpaid' END,
                invoice_amount,
                user_uuid
            );
            
            -- Insert purchase (expenses)
            INSERT INTO purchases (
                supplier_id,
                order_number,
                order_date,
                expected_date,
                status,
                total,
                user_id
            ) VALUES (
                supplier_uuid,
                'PO-HIST-' || TO_CHAR(purchase_date, 'YYYY-MM') || '-' || LPAD(month_offset::text, 3, '0'),
                purchase_date,
                purchase_date + INTERVAL '7 days',
                CASE 
                    WHEN month_offset < 7 THEN 'completed'
                    WHEN month_offset < 9 THEN 'received'
                    ELSE 'approved'
                END,
                purchase_amount,
                user_uuid
            );
        END LOOP;
        
        RAISE NOTICE 'Successfully added 10 months of historical sales and expense data';
    ELSE
        RAISE NOTICE 'Skipping: Missing user, customer, or supplier data';
    END IF;
END $$;
