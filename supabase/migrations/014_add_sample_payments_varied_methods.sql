-- Add sample payment records with varied methods for testing the dropdown filter

DO $$
DECLARE
    user_uuid UUID;
    customer_uuid UUID;
    supplier_uuid UUID;
    payment_methods TEXT[] := ARRAY['cash', 'mpesa', 'bank_transfer', 'cheque'];
    payment_types TEXT[] := ARRAY['received', 'made'];
    i INT;
    selected_method TEXT;
    selected_type TEXT;
    selected_customer UUID;
    selected_supplier UUID;
    payment_amount DECIMAL(15,2);
    payment_ref TEXT;
BEGIN
    -- Get the first user
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    -- Get first customer and supplier
    SELECT id INTO customer_uuid FROM customers ORDER BY created_at LIMIT 1;
    SELECT id INTO supplier_uuid FROM suppliers ORDER BY created_at LIMIT 1;
    
    IF user_uuid IS NOT NULL AND customer_uuid IS NOT NULL AND supplier_uuid IS NOT NULL THEN
        -- Generate 12 sample payments with varied methods and types
        FOR i IN 1..12 LOOP
            -- Rotate through payment methods
            selected_method := payment_methods[(i % 4) + 1];
            
            -- Alternate between received and made
            selected_type := payment_types[(i % 2) + 1];
            
            -- Generate varying amounts
            payment_amount := 10000 + (i * 2500) + ((i % 3) * 5000);
            
            -- Generate reference number
            payment_ref := 'REF-' || TO_CHAR(CURRENT_DATE - (i * INTERVAL '5 days'), 'YYYY-MM-DD') || '-' || LPAD(i::text, 3, '0');
            
            -- Insert payment record
            INSERT INTO payments (
                customer_id,
                supplier_id,
                payment_number,
                amount,
                payment_date,
                method,
                type,
                reference,
                notes,
                user_id
            ) VALUES (
                CASE WHEN selected_type = 'received' THEN customer_uuid ELSE NULL END,
                CASE WHEN selected_type = 'made' THEN supplier_uuid ELSE NULL END,
                'PAY-2025-' || LPAD(i::text, 4, '0'),
                payment_amount,
                CURRENT_DATE - (i * INTERVAL '5 days'),
                selected_method,
                selected_type,
                payment_ref,
                CASE 
                    WHEN selected_type = 'received' THEN 'Payment received via ' || 
                        CASE selected_method
                            WHEN 'cash' THEN 'Cash'
                            WHEN 'mpesa' THEN 'M-Pesa'
                            WHEN 'bank_transfer' THEN 'Bank Transfer'
                            WHEN 'cheque' THEN 'Cheque'
                        END
                    ELSE 'Payment made via ' || 
                        CASE selected_method
                            WHEN 'cash' THEN 'Cash'
                            WHEN 'mpesa' THEN 'M-Pesa'
                            WHEN 'bank_transfer' THEN 'Bank Transfer'
                            WHEN 'cheque' THEN 'Cheque'
                        END
                END,
                user_uuid
            );
        END LOOP;
        
        RAISE NOTICE 'Successfully added 12 sample payments with varied methods';
    ELSE
        RAISE NOTICE 'Skipping: Missing user, customer, or supplier data';
    END IF;
END $$;
