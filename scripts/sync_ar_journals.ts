import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_USER_ID = "bc025931-2c9a-4215-ae8e-b4f2ac187333";
const AR_ACCOUNT_ID = "0907c75a-1bb6-4748-b024-e5ef7a21f238"; // Accounts Receivable
const SALES_ACCOUNT_ID = "6d93513b-ce5d-46f5-afae-d2be775717a8"; // Sales Revenue

async function syncARJournals() {
  console.log("Starting AR journal sync...");

  // 1. Fetch all invoices
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('*');

  if (invError) {
    console.error("Error fetching invoices:", invError.message);
    return;
  }

  console.log(`Found ${invoices?.length || 0} invoices. Checking for missing journal entries...`);

  let createdCount = 0;

  for (const invoice of invoices || []) {
    // 2. Check for existing journal entry with this reference (Idempotency)
    const { data: existing, error: checkError } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('reference', invoice.invoice_number)
      .maybeSingle();

    if (existing) {
      continue;
    }

    // 3. Create journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        entry_date: invoice.issue_date,
        description: `Invoice ${invoice.invoice_number} posting`,
        reference: invoice.invoice_number,
        user_id: TARGET_USER_ID
      })
      .select()
      .single();

    if (entryError) {
      console.error(`Error creating journal entry for ${invoice.invoice_number}:`, entryError.message);
      continue;
    }

    // 4. Create journal entry lines
    const lines = [
      {
        journal_entry_id: entry.id,
        account_id: AR_ACCOUNT_ID,
        debit: Number(invoice.total_amount) || 0,
        credit: 0,
        user_id: TARGET_USER_ID
      },
      {
        journal_entry_id: entry.id,
        account_id: SALES_ACCOUNT_ID,
        debit: 0,
        credit: Number(invoice.total_amount) || 0,
        user_id: TARGET_USER_ID
      }
    ];

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(lines);

    if (linesError) {
      console.error(`Error creating journal lines for ${invoice.invoice_number}:`, linesError.message);
    } else {
      createdCount++;
    }
  }

  console.log(`Successfully synced ${createdCount} missing journal entries.`);
  console.log("AR Journal Sync completed.");
}

syncARJournals();
