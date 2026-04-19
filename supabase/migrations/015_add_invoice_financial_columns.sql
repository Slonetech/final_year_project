-- Migration 015: Add missing financial columns to invoices table
-- Fixes F-16: amount_paid, amount_due, and tax_amount were read by the
-- application but never existed in the schema. The invoice detail view always
-- showed 0 for amount_paid regardless of actual payments recorded.
--
-- tax_amount is intentionally left at 0 for all existing rows.
-- New invoices will persist it explicitly at creation time.
-- This avoids any assumptions about VAT rates or exemptions on historical data.

-- 1. Add the three missing columns (all default to 0.00)
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS tax_amount    DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS amount_paid   DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS amount_due    DECIMAL(12,2) DEFAULT 0.00;

-- 2. Backfill amount_paid from existing payment records
--    Sums all payments linked to each invoice via invoice_id FK
UPDATE invoices i
SET amount_paid = COALESCE((
  SELECT SUM(p.amount)
  FROM payments p
  WHERE p.invoice_id = i.id
), 0.00);

-- 3. Backfill amount_due = total_amount - amount_paid (floored at 0)
UPDATE invoices i
SET amount_due = GREATEST(0, i.total_amount - i.amount_paid);

-- tax_amount remains 0.00 on all existing rows (DEFAULT handles this -- no UPDATE needed)
