import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  const startDate = "2024-01-01"; // Wide range for diagnosis
  const endDate = "2026-12-31";

  console.log("--- P&L REVENUE DIAGNOSIS ---");
  const { data: invoices } = await supabase.from('invoices').select('id, invoice_number, total_amount, issue_date');
  console.log("Total Invoices:", invoices?.length);
  const revenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  console.log("Sum of all invoices total_amount:", revenue);
  console.log("Invoices records:", invoices);

  console.log("\n--- P&L EXPENSE DIAGNOSIS ---");
  const { data: accounts } = await supabase.from('chart_of_accounts').select('id, account_name, account_code').ilike('account_type', 'Expense');
  const expenseAccountIds = accounts?.map(a => a.id) || [];
  
  const { data: journalLines } = await supabase
    .from('journal_entry_lines')
    .select('debit, credit, account_id, journal_entries!inner(entry_date)')
    .in('account_id', expenseAccountIds);
  
  console.log("Total Expense Journal Lines:", journalLines?.length);
  const totalExpenses = journalLines?.reduce((sum, line) => sum + (Number(line.debit) || 0) - (Number(line.credit) || 0), 0);
  console.log("Sum of all expense journal lines (Debit - Credit):", totalExpenses);

  console.log("\n--- CASH FLOW DIAGNOSIS ---");
  const { data: payments } = await supabase.from('payments').select('*');
  console.log("Total Payment records:", payments?.length);
  console.log("Payment types found:", [...new Set(payments?.map(p => p.type))]);
  console.log("Payments sample:", payments?.slice(0, 5));

  console.log("\n--- AGED RECEIVABLES DIAGNOSIS ---");
  const arAccount = await supabase.from('chart_of_accounts').select('id').ilike('account_name', 'Accounts Receivable').single();
  if (arAccount.data) {
    const { data: arLines } = await supabase.from('journal_entry_lines').select('debit, credit').eq('account_id', arAccount.data.id);
    const arBalance = arLines?.reduce((sum, line) => sum + (Number(line.debit) || 0) - (Number(line.credit) || 0), 0);
    console.log("Accounts Receivable balance (Journal):", arBalance);
  }

}

diagnose();
