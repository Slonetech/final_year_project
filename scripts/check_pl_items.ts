import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPL() {
  const startDate = "2000-01-01";
  const endDate = "2026-12-31";

  console.log("--- P&L LINE ITEMS ---");
  const { data: invoices } = await supabase.from('invoices').select('invoice_number, total_amount, tax_amount').gte('issue_date', startDate).lte('issue_date', endDate);
  
  let totalRev = 0;
  invoices?.forEach(inv => {
    const gross = Number(inv.total_amount) || 0;
    const tax = Number(inv.tax_amount) || 0;
    const net = gross - tax;
    console.log(`Invoice ${inv.invoice_number}: Gross=${gross}, Tax=${tax}, Net=${net}`);
    totalRev += (net > 0 ? net : gross);
  });
  console.log("Total P&L Revenue Computed:", totalRev);

  const { data: accounts } = await supabase.from('chart_of_accounts').select('id, account_name, account_code').ilike('account_type', 'Expense');
  const expenseAccountIds = accounts?.map(a => a.id) || [];
  
  const { data: journalLines } = await supabase
    .from('journal_entry_lines')
    .select('debit, credit, account_id, journal_entries!inner(entry_date)')
    .in('account_id', expenseAccountIds);
  
  const expenseSummary = new Map();
  journalLines?.forEach(line => {
    const name = accounts.find(a => a.id === line.account_id).account_name;
    const bal = (Number(line.debit) || 0) - (Number(line.credit) || 0);
    expenseSummary.set(name, (expenseSummary.get(name) || 0) + bal);
  });

  console.log("Expenses by Account:", Object.fromEntries(expenseSummary));
  const totalExp = Array.from(expenseSummary.values()).reduce((a, b) => a + b, 0);
  console.log("Total P&L Expenses Computed:", totalExp);
  console.log("Computed Net Profit/Loss:", totalRev - totalExp);
}

checkPL();
