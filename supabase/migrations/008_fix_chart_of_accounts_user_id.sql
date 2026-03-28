-- Fix chart_of_accounts RLS policies to make it accessible to all authenticated users
-- In an ERP system, the chart of accounts should be company-wide, not per-user

-- Drop the restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON chart_of_accounts;
DROP POLICY IF EXISTS "Users can insert own data" ON chart_of_accounts;
DROP POLICY IF EXISTS "Users can update own data" ON chart_of_accounts;
DROP POLICY IF EXISTS "Users can delete own data" ON chart_of_accounts;

-- Create new policies that allow all authenticated users to access chart of accounts
CREATE POLICY "Authenticated users can view chart of accounts"
  ON chart_of_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chart of accounts"
  ON chart_of_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chart of accounts"
  ON chart_of_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chart of accounts"
  ON chart_of_accounts FOR DELETE
  TO authenticated
  USING (true);

-- Do the same for journal entries since they're also company-wide
DROP POLICY IF EXISTS "Users can view own data" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own data" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own data" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own data" ON journal_entries;

CREATE POLICY "Authenticated users can view journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete journal entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (true);

-- Also fix journal_entry_lines
DROP POLICY IF EXISTS "Users can view own data" ON journal_entry_lines;
DROP POLICY IF EXISTS "Users can insert own data" ON journal_entry_lines;
DROP POLICY IF EXISTS "Users can update own data" ON journal_entry_lines;
DROP POLICY IF EXISTS "Users can delete own data" ON journal_entry_lines;

CREATE POLICY "Authenticated users can view journal entry lines"
  ON journal_entry_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert journal entry lines"
  ON journal_entry_lines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update journal entry lines"
  ON journal_entry_lines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete journal entry lines"
  ON journal_entry_lines FOR DELETE
  TO authenticated
  USING (true);
