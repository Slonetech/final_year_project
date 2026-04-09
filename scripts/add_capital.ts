import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing env vars in .env.local: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const uuid = () => crypto.randomUUID();

// Date for opening entries (50 days ago)
const openingDate = new Date();
openingDate.setDate(openingDate.getDate() - 50); 
const dateStr = openingDate.toISOString().split("T")[0];

const newEntries = [
  { desc: "Owner's Initial Capital - Bank", amt: 1000000, debitAcc: "KCB Bank Account", creditAcc: "Owner's Equity" },
  { desc: "Owner's Initial Capital - MPesa", amt: 150000, debitAcc: "M-Pesa Business", creditAcc: "Owner's Equity" },
  { desc: "Petty Cash Funding", amt: 50000, debitAcc: "Cash on Hand", creditAcc: "KCB Bank Account" },
];

const TARGET_USER_ID = "bc025931-2c9a-4215-ae8e-b4f2ac187333";

async function run() {
  console.log("🔍 Fetching accounts...");
  const { data: accounts, error: accErr } = await supabase.from("chart_of_accounts").select("id, account_name");
  if (accErr || !accounts) throw new Error("Failed to fetch accounts: " + accErr?.message);
  const accMap = Object.fromEntries(accounts.map(a => [a.account_name, a.id]));

  console.log("✔️ Checking for existing entries...");
  const { data: existing } = await supabase
    .from("journal_entries")
    .select("description")
    .in("description", newEntries.map(e => e.desc))
    .eq("user_id", TARGET_USER_ID);
    
  if (existing && existing.length > 0) {
    console.log("⏩ Capital entries already exist. Aborting to prevent duplicates.");
    return;
  }

  console.log("🚀 Injecting capital...");
  for (const entry of newEntries) {
    const je_id = uuid();
    const { error: jeErr } = await supabase.from("journal_entries").insert({
      id: je_id,
      entry_date: dateStr,
      description: entry.desc,
      total_debit: entry.amt,
      total_credit: entry.amt,
      user_id: TARGET_USER_ID,
    });
    if (jeErr) throw new Error(`Failed to insert journal entry (${entry.desc}): ${jeErr.message}`);

    const { error: jelErr } = await supabase.from("journal_entry_lines").insert([
      { journal_entry_id: je_id, account_id: accMap[entry.debitAcc], debit: entry.amt, credit: 0, user_id: TARGET_USER_ID },
      { journal_entry_id: je_id, account_id: accMap[entry.creditAcc], debit: 0, credit: entry.amt, user_id: TARGET_USER_ID },
    ]);
    if (jelErr) throw new Error(`Failed to insert journal lines (${entry.desc}): ${jelErr.message}`);

    console.log(`  ✅ Posted: ${entry.desc} (Ksh ${entry.amt.toLocaleString()})`);
  }
  
  console.log("\n🎉 Done! Your cash accounts should now show positive balances.");
}

run().catch(console.error);
