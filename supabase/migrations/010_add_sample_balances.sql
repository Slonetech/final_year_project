-- Add sample balances to chart of accounts for testing reports
-- This will give you realistic data to see in your financial reports

-- Update balances for each account type
UPDATE chart_of_accounts SET balance = 50000.00 WHERE account_name = 'Cash on Hand';
UPDATE chart_of_accounts SET balance = 150000.00 WHERE account_name = 'KCB Bank Account';
UPDATE chart_of_accounts SET balance = 75000.00 WHERE account_name = 'M-Pesa Business';
UPDATE chart_of_accounts SET balance = 120000.00 WHERE account_name = 'Accounts Receivable';
UPDATE chart_of_accounts SET balance = 250000.00 WHERE account_name = 'Inventory';
UPDATE chart_of_accounts SET balance = 85000.00 WHERE account_name = 'Accounts Payable';
UPDATE chart_of_accounts SET balance = 12000.00 WHERE account_name = 'VAT Payable';
UPDATE chart_of_accounts SET balance = 500000.00 WHERE account_name = 'Owner''s Equity';
UPDATE chart_of_accounts SET balance = 380000.00 WHERE account_name = 'Sales Revenue';
UPDATE chart_of_accounts SET balance = 45000.00 WHERE account_name = 'Service Revenue';
UPDATE chart_of_accounts SET balance = 35000.00 WHERE account_name = 'Office Expenses';
UPDATE chart_of_accounts SET balance = 120000.00 WHERE account_name = 'Salary Expense';
UPDATE chart_of_accounts SET balance = 45000.00 WHERE account_name = 'Rent Expense';
UPDATE chart_of_accounts SET balance = 18000.00 WHERE account_name = 'Electricity & Water';
UPDATE chart_of_accounts SET balance = 22000.00 WHERE account_name = 'Marketing & Ads';

-- You can also add balances for any other accounts you have
-- UPDATE chart_of_accounts SET balance = 10000.00 WHERE account_code = 'YOUR_CODE';
