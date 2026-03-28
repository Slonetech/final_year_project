-- Add balance column to chart_of_accounts and other missing columns

ALTER TABLE chart_of_accounts
  ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON chart_of_accounts;
CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set default categories based on account type and code
UPDATE chart_of_accounts
SET category = CASE
    WHEN account_type = 'Asset' AND account_code::integer < 1500 THEN 'current_asset'
    WHEN account_type = 'Asset' AND account_code::integer >= 1500 THEN 'fixed_asset'
    WHEN account_type = 'Liability' AND account_code::integer < 2500 THEN 'current_liability'
    WHEN account_type = 'Liability' AND account_code::integer >= 2500 THEN 'long_term_liability'
    WHEN account_type = 'Equity' THEN 'equity'
    WHEN account_type = 'Revenue' THEN 'operating_revenue'
    WHEN account_type = 'Expense' AND account_code::integer < 5100 THEN 'cost_of_goods_sold'
    WHEN account_type = 'Expense' THEN 'operating_expense'
    ELSE 'other'
END
WHERE category IS NULL;
