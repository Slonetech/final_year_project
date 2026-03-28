/**
 * FinPal ERP - Seed Script (TypeScript)
 * Converted from supabase/seed.sql
 *
 * Run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires a .env.local (or .env) file with:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

// ---------------------------------------------------------------------------
// Load env vars (Next.js style — no dotenv dependency needed if you use tsx)
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
  process.exit(1);
}

// Use the service-role key so RLS does not block the seed inserts
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const uuid = () => crypto.randomUUID();

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function deleteAll() {
  // Children first, parents last (mirrors the SQL FOREACH loop)
  const tables = [
    "journal_entry_lines",
    "journal_entries",
    "payments",
    "invoices",
    "sale_items",
    "sales",
    "purchase_items",
    "purchases",
    "inventory",
    "customers",
    "suppliers",
    "chart_of_accounts",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`⚠️  Could not clean "${table}": ${error.message}`);
    } else {
      console.log(`🗑️  Cleared "${table}"`);
    }
  }
}

async function seed() {
  const TARGET_USER_ID = "bc025931-2c9a-4215-ae8e-b4f2ac187333";

  // Pre-generate UUIDs that are referenced across multiple tables
  const saf_id    = uuid(); // Safaricom customer
  const eqty_id   = uuid(); // Equity Bank customer
  const kplc_id   = uuid(); // Kenya Power supplier
  const safst_id  = uuid(); // Safari Stationery supplier
  const acc_bank_id = uuid(); // KCB Bank account
  const acc_rev_id  = uuid(); // Sales Revenue account
  const acc_exp_id  = uuid(); // Office Expenses account

  // -------------------------------------------------------------------------
  // 1. Suppliers
  // -------------------------------------------------------------------------
  const { error: suppErr } = await supabase.from("suppliers").insert([
    {
      id: kplc_id,
      name: "Kenya Power & Lighting",
      email: "service@kplc.co.ke",
      phone: "+254711031000",
      address: "Stima Plaza",
      city: "Nairobi",
      user_id: TARGET_USER_ID,
    },
    {
      id: safst_id,
      name: "Safari Stationery Ltd",
      email: "sales@safaristationery.co.ke",
      phone: "+254722000111",
      address: "Moi Avenue",
      city: "Nairobi",
      user_id: TARGET_USER_ID,
    },
  ]);
  if (suppErr) throw new Error(`suppliers: ${suppErr.message}`);
  console.log("✅  Inserted suppliers");

  // -------------------------------------------------------------------------
  // 2. Customers
  // -------------------------------------------------------------------------
  const { error: custErr } = await supabase.from("customers").insert([
    {
      id: saf_id,
      name: "Safaricom PLC",
      email: "procurement@safaricom.co.ke",
      phone: "+254700000000",
      city: "Nairobi",
      balance: 116000.0,
      user_id: TARGET_USER_ID,
    },
    {
      id: eqty_id,
      name: "Equity Bank Kenya",
      email: "finance@equitybank.co.ke",
      phone: "+254711111111",
      city: "Nairobi",
      balance: 232000.0,
      user_id: TARGET_USER_ID,
    },
  ]);
  if (custErr) throw new Error(`customers: ${custErr.message}`);
  console.log("✅  Inserted customers");

  // -------------------------------------------------------------------------
  // 3. Chart of Accounts
  // -------------------------------------------------------------------------
  const { error: coaErr } = await supabase.from("chart_of_accounts").insert([
    {
      id: uuid(),
      account_code: "1010",
      account_name: "Cash on Hand",
      account_type: "Asset",
      user_id: TARGET_USER_ID,
    },
    {
      id: acc_bank_id,
      account_code: "1020",
      account_name: "KCB Bank Account",
      account_type: "Asset",
      user_id: TARGET_USER_ID,
    },
    {
      id: acc_rev_id,
      account_code: "4010",
      account_name: "Sales Revenue",
      account_type: "Revenue",
      user_id: TARGET_USER_ID,
    },
    {
      id: acc_exp_id,
      account_code: "5010",
      account_name: "Office Expenses",
      account_type: "Expense",
      user_id: TARGET_USER_ID,
    },
  ]);
  if (coaErr) throw new Error(`chart_of_accounts: ${coaErr.message}`);
  console.log("✅  Inserted chart of accounts");

  // -------------------------------------------------------------------------
  // 4. Inventory
  // -------------------------------------------------------------------------
  const { error: invErr } = await supabase.from("inventory").insert([
    {
      id: uuid(),
      name: "Laptop Computer",
      sku: "LP-001",
      category: "Electronics",
      quantity: 15,
      cost_price: 65000.0,
      selling_price: 85000.0,
      reorder_level: 5,
      user_id: TARGET_USER_ID,
    },
  ]);
  if (invErr) throw new Error(`inventory: ${invErr.message}`);
  console.log("✅  Inserted inventory");

  // -------------------------------------------------------------------------
  // 5. Invoices
  // -------------------------------------------------------------------------
  const { error: invErr2 } = await supabase.from("invoices").insert([
    {
      id: uuid(),
      customer_id: saf_id,
      invoice_number: "INV-2024-001",
      issue_date: daysAgo(10),
      status: "paid",
      total_amount: 116000.0,
      user_id: TARGET_USER_ID,
    },
    {
      id: uuid(),
      customer_id: eqty_id,
      invoice_number: "INV-2024-002",
      issue_date: daysAgo(5),
      status: "unpaid",
      total_amount: 232000.0,
      user_id: TARGET_USER_ID,
    },
  ]);
  if (invErr2) throw new Error(`invoices: ${invErr2.message}`);
  console.log("✅  Inserted invoices");

  // -------------------------------------------------------------------------
  // 6. Journal Entries — Revenue
  // -------------------------------------------------------------------------
  const je1_id = uuid();
  const { error: je1Err } = await supabase.from("journal_entries").insert({
    id: je1_id,
    entry_date: daysAgo(30),
    description: "Jan Revenue capture",
    total_debit: 348000,
    total_credit: 348000,
    user_id: TARGET_USER_ID,
  });
  if (je1Err) throw new Error(`journal_entries (revenue): ${je1Err.message}`);

  const { error: jel1Err } = await supabase.from("journal_entry_lines").insert([
    { journal_entry_id: je1_id, account_id: acc_bank_id, debit: 348000, credit: 0, user_id: TARGET_USER_ID },
    { journal_entry_id: je1_id, account_id: acc_rev_id,  debit: 0, credit: 348000, user_id: TARGET_USER_ID },
  ]);
  if (jel1Err) throw new Error(`journal_entry_lines (revenue): ${jel1Err.message}`);
  console.log("✅  Inserted revenue journal entry");

  // -------------------------------------------------------------------------
  // 7. Journal Entries — Expenses
  // -------------------------------------------------------------------------
  const je2_id = uuid();
  const { error: je2Err } = await supabase.from("journal_entries").insert({
    id: je2_id,
    entry_date: daysAgo(30),
    description: "Jan Expense capture",
    total_debit: 150000,
    total_credit: 150000,
    user_id: TARGET_USER_ID,
  });
  if (je2Err) throw new Error(`journal_entries (expenses): ${je2Err.message}`);

  const { error: jel2Err } = await supabase.from("journal_entry_lines").insert([
    { journal_entry_id: je2_id, account_id: acc_exp_id,  debit: 150000, credit: 0, user_id: TARGET_USER_ID },
    { journal_entry_id: je2_id, account_id: acc_bank_id, debit: 0, credit: 150000, user_id: TARGET_USER_ID },
  ]);
  if (jel2Err) throw new Error(`journal_entry_lines (expenses): ${jel2Err.message}`);
  console.log("✅  Inserted expense journal entry");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log("🌱  Starting FinPal seed…\n");

  console.log("🧹  Cleaning existing data…");
  await deleteAll();

  console.log("\n📥  Inserting seed data…");
  await seed();

  console.log("\n🎉  Seed complete!");
})();
