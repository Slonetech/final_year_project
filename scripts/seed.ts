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

  // -------------------------------------------------------------------------
  // 1. Chart of Accounts
  // -------------------------------------------------------------------------
  const accounts = [
    { id: uuid(), account_code: "1010", account_name: "Cash on Hand", account_type: "Asset" },
    { id: uuid(), account_code: "1020", account_name: "KCB Bank Account", account_type: "Asset" },
    { id: uuid(), account_code: "1030", account_name: "M-Pesa Business", account_type: "Asset" },
    { id: uuid(), account_code: "1040", account_name: "Accounts Receivable", account_type: "Asset" },
    { id: uuid(), account_code: "1050", account_name: "Inventory", account_type: "Asset" },
    { id: uuid(), account_code: "2010", account_name: "Accounts Payable", account_type: "Liability" },
    { id: uuid(), account_code: "2020", account_name: "VAT Payable", account_type: "Liability" },
    { id: uuid(), account_code: "3010", account_name: "Owner's Equity", account_type: "Equity" },
    { id: uuid(), account_code: "4010", account_name: "Sales Revenue", account_type: "Revenue" },
    { id: uuid(), account_code: "4020", account_name: "Service Revenue", account_type: "Revenue" },
    { id: uuid(), account_code: "5010", account_name: "Office Expenses", account_type: "Expense" },
    { id: uuid(), account_code: "5020", account_name: "Salary Expense", account_type: "Expense" },
    { id: uuid(), account_code: "5030", account_name: "Rent Expense", account_type: "Expense" },
    { id: uuid(), account_code: "5040", account_name: "Electricity & Water", account_type: "Expense" },
    { id: uuid(), account_code: "5050", account_name: "Marketing & Ads", account_type: "Expense" },
  ].map(a => ({ ...a, user_id: TARGET_USER_ID }));

  const { error: coaErr } = await supabase.from("chart_of_accounts").insert(accounts);
  if (coaErr) throw new Error(`chart_of_accounts: ${coaErr.message}`);
  console.log("✅  Inserted chat of accounts");

  const accMap = Object.fromEntries(accounts.map(a => [a.account_name, a.id]));

  // -------------------------------------------------------------------------
  // 2. Suppliers
  // -------------------------------------------------------------------------
  const suppliers = [
    { name: "Kenya Power & Lighting", email: "service@kplc.co.ke", phone: "+254711031000", address: "Stima Plaza", city: "Nairobi" },
    { name: "Safari Stationery Ltd", email: "sales@safaristationery.co.ke", phone: "+254722000111", address: "Moi Avenue", city: "Nairobi" },
    { name: "TotalEnergies Kenya", email: "info@totalenergies.ke", phone: "+254703033000", address: "Regal Plaza", city: "Nairobi" },
    { name: "Crown Paints PLC", email: "sales@crownpaints.co.ke", phone: "+254709887000", address: "Lunga Lunga Rd", city: "Nairobi" },
    { name: "East African Breweries", email: "info@eabl.com", phone: "+254711010000", address: "Garden City", city: "Nairobi" },
    { name: "Unga Group", email: "contact@unga.com", phone: "+254722204744", address: "Commercial St", city: "Nairobi" },
    { name: "Bidco Africa", email: "info@bidcoafrica.com", phone: "+254722203000", address: "Thika", city: "Thika" },
    { name: "Twiga Foods", email: "sales@twiga.com", phone: "+254709339000", address: "Riverside", city: "Nairobi" },
  ].map(s => ({ ...s, id: uuid(), user_id: TARGET_USER_ID }));

  const { error: suppErr } = await supabase.from("suppliers").insert(suppliers);
  if (suppErr) throw new Error(`suppliers: ${suppErr.message}`);
  console.log("✅  Inserted suppliers");

  // -------------------------------------------------------------------------
  // 3. Customers
  // -------------------------------------------------------------------------
  const customers = [
    { name: "Safaricom PLC", email: "procurement@safaricom.co.ke", phone: "+254700000000", city: "Nairobi", balance: 116000.0 },
    { name: "Equity Bank Kenya", email: "finance@equitybank.co.ke", phone: "+254711111111", city: "Nairobi", balance: 232000.0 },
    { name: "KCB Bank Group", email: "procurement@kcbgroup.com", phone: "+254711087000", city: "Nairobi", balance: 0 },
    { name: "Airtel Kenya", email: "billing@ke.airtel.com", phone: "+254733100100", city: "Nairobi", balance: 45000 },
    { name: "Chandarana Foodplus", email: "accounts@chandarana.co.ke", phone: "+254722201010", city: "Nairobi", balance: 89000 },
    { name: "Naivas Supermarket", email: "info@naivas.co.ke", phone: "+254711000111", city: "Nairobi", balance: 156000 },
    { name: "Zuku Fiber", email: "support@zuku.co.ke", phone: "+254709888000", city: "Nairobi", balance: 12000 },
    { name: "Jumia Kenya", email: "vendor@jumia.co.ke", phone: "+254711011011", city: "Nairobi", balance: 0 },
  ].map(c => ({ ...c, id: uuid(), user_id: TARGET_USER_ID }));

  const { error: custErr } = await supabase.from("customers").insert(customers);
  if (custErr) throw new Error(`customers: ${custErr.message}`);
  console.log("✅  Inserted customers");

  // -------------------------------------------------------------------------
  // 4. Inventory
  // -------------------------------------------------------------------------
  const inventory = [
    { name: "Laptop Computer", sku: "LP-001", category: "Electronics", quantity: 15, cost_price: 65000.0, selling_price: 85000.0, reorder_level: 5 },
    { name: "Office Chair", sku: "FUR-001", category: "Furniture", quantity: 20, cost_price: 12000.0, selling_price: 18500.0, reorder_level: 3 },
    { name: "Desktop Monitor 24\"", sku: "MON-001", category: "Electronics", quantity: 10, cost_price: 15000.0, selling_price: 22000.0, reorder_level: 2 },
    { name: "Wireless Mouse", sku: "ACC-001", category: "Accessories", quantity: 50, cost_price: 1500.0, selling_price: 3500.0, reorder_level: 10 },
    { name: "HP Laserjet Printer", sku: "PRN-001", category: "Electronics", quantity: 5, cost_price: 35000.0, selling_price: 48000.0, reorder_level: 2 },
    { name: "Stationery Pack (A4)", sku: "ST-001", category: "Stationery", quantity: 100, cost_price: 450.0, selling_price: 850.0, reorder_level: 20 },
  ].map(i => ({ ...i, id: uuid(), user_id: TARGET_USER_ID }));

  const { error: invErr } = await supabase.from("inventory").insert(inventory);
  if (invErr) throw new Error(`inventory: ${invErr.message}`);
  console.log("✅  Inserted inventory");

  // -------------------------------------------------------------------------
  // 5. Invoices
  // -------------------------------------------------------------------------
  const invoiceData = [];
  for (let i = 0; i < 30; i++) {
    const customer = customers[i % customers.length];
    const amount = Math.floor(Math.random() * 50000) + 5000;
    invoiceData.push({
      id: uuid(),
      customer_id: customer.id,
      invoice_number: `INV-2024-${(i + 1).toString().padStart(3, '0')}`,
      issue_date: daysAgo(Math.floor(Math.random() * 60) + 1),
      status: i % 3 === 0 ? "paid" : i % 3 === 1 ? "unpaid" : "overdue",
      total_amount: amount,
      user_id: TARGET_USER_ID,
    });
  }

  const { error: invErr2 } = await supabase.from("invoices").insert(invoiceData);
  if (invErr2) throw new Error(`invoices: ${invErr2.message}`);
  console.log("✅  Inserted 30 invoices");

  // -------------------------------------------------------------------------
  // 6. Payments
  // -------------------------------------------------------------------------
  const paidInvoices = invoiceData.filter(inv => inv.status === "paid");
  const payments = paidInvoices.map(inv => ({
    id: uuid(),
    invoice_id: inv.id,
    amount: inv.total_amount,
    payment_date: daysAgo(Math.floor(Math.random() * 5)),
    payment_method: Math.random() > 0.5 ? "MPESA" : "Bank Transfer",
    reference: `REF-${uuid().slice(0, 8).toUpperCase()}`,
    user_id: TARGET_USER_ID,
  }));

  const { error: payErr } = await supabase.from("payments").insert(payments);
  if (payErr) throw new Error(`payments: ${payErr.message}`);
  console.log(`✅  Inserted ${payments.length} payments`);

  // -------------------------------------------------------------------------
  // 7. Journal Entries — Mix of Revenue, Expenses, and Transfers
  // -------------------------------------------------------------------------
  const journalEntries = [
    { desc: "Monthly Rent - Office", amt: 85000, debitAcc: "Rent Expense", creditAcc: "KCB Bank Account" },
    { desc: "Staff Salaries Jan", amt: 450000, debitAcc: "Salary Expense", creditAcc: "KCB Bank Account" },
    { desc: "Electricity Bill March", amt: 12500, debitAcc: "Electricity & Water", creditAcc: "M-Pesa Business" },
    { desc: "Google Ads Payment", amt: 25000, debitAcc: "Marketing & Ads", creditAcc: "KCB Bank Account" },
    { desc: "Sales Receipt Deposit", amt: 156000, debitAcc: "KCB Bank Account", creditAcc: "Sales Revenue" },
    { desc: "M-Pesa to Bank Transfer", amt: 50000, debitAcc: "KCB Bank Account", creditAcc: "M-Pesa Business" },
    { desc: "Cash to M-Pesa", amt: 10000, debitAcc: "M-Pesa Business", creditAcc: "Cash on Hand" },
  ];

  for (const entry of journalEntries) {
    const je_id = uuid();
    const { error: jeErr } = await supabase.from("journal_entries").insert({
      id: je_id,
      entry_date: daysAgo(Math.floor(Math.random() * 45)),
      description: entry.desc,
      total_debit: entry.amt,
      total_credit: entry.amt,
      user_id: TARGET_USER_ID,
    });
    if (jeErr) throw new Error(`journal_entries (${entry.desc}): ${jeErr.message}`);

    const { error: jelErr } = await supabase.from("journal_entry_lines").insert([
      { journal_entry_id: je_id, account_id: accMap[entry.debitAcc], debit: entry.amt, credit: 0, user_id: TARGET_USER_ID },
      { journal_entry_id: je_id, account_id: accMap[entry.creditAcc], debit: 0, credit: entry.amt, user_id: TARGET_USER_ID },
    ]);
    if (jelErr) throw new Error(`journal_entry_lines (${entry.desc}): ${jelErr.message}`);
  }
  console.log("✅  Inserted varied journal entries");

  // -------------------------------------------------------------------------
  // 8. Purchases
  // -------------------------------------------------------------------------
  const purchases = suppliers.slice(0, 5).map((supp, idx) => ({
    id: uuid(),
    supplier_id: supp.id,
    purchase_date: daysAgo(Math.floor(Math.random() * 30) + 10),
    status: idx % 2 === 0 ? "completed" : "pending",
    total_amount: Math.floor(Math.random() * 100000) + 20000,
    user_id: TARGET_USER_ID,
  }));

  const { error: purErr } = await supabase.from("purchases").insert(purchases);
  if (purErr) throw new Error(`purchases: ${purErr.message}`);
  console.log(`✅  Inserted ${purchases.length} purchases`);
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
