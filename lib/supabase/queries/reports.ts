import { createClient } from "../server";
import {
  BalanceSheetData,
  ProfitLossData,
  CashFlowData,
  TrialBalanceData,
  AgedReceivablesData,
  AgedPayablesData,
} from "@/lib/types";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  return "Unknown error";
}

async function fetchInvoicesForProfitLoss(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string,
) {
  const attempts = [
    {
      dateColumn: "issue_date",
      selectClause:
        "id, invoice_number, total_amount, tax_amount, customers(name)",
    },
    {
      dateColumn: "invoice_date",
      selectClause:
        "id, invoice_number, total_amount, tax_amount, customers(name)",
    },
    {
      dateColumn: "issue_date",
      selectClause: "id, invoice_number, total, tax_amount, customers(name)",
    },
    {
      dateColumn: "invoice_date",
      selectClause: "id, invoice_number, total, tax_amount, customers(name)",
    },
    {
      dateColumn: "issue_date",
      selectClause: "id, invoice_number, total_amount, tax_amount",
    },
    {
      dateColumn: "invoice_date",
      selectClause: "id, invoice_number, total_amount, tax_amount",
    },
    {
      dateColumn: "issue_date",
      selectClause: "id, invoice_number, total, tax_amount",
    },
    {
      dateColumn: "invoice_date",
      selectClause: "id, invoice_number, total, tax_amount",
    },
  ];

  let lastError: unknown = null;

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from("invoices")
      .select(attempt.selectClause)
      .gte(attempt.dateColumn, startDate)
      .lte(attempt.dateColumn, endDate)
      .order(attempt.dateColumn);

    if (!error) {
      return data || [];
    }

    lastError = error;
  }

  throw lastError;
}

async function fetchPurchasesForProfitLoss(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string,
) {
  const attempts = [
    {
      dateColumn: "order_date",
      selectClause: "id, order_number, total, suppliers(name)",
    },
    {
      dateColumn: "purchase_date",
      selectClause: "id, order_number, total, suppliers(name)",
    },
    {
      dateColumn: "order_date",
      selectClause: "id, order_number, total_amount, suppliers(name)",
    },
    {
      dateColumn: "purchase_date",
      selectClause: "id, order_number, total_amount, suppliers(name)",
    },
    { dateColumn: "order_date", selectClause: "id, order_number, total" },
    { dateColumn: "purchase_date", selectClause: "id, order_number, total" },
    {
      dateColumn: "order_date",
      selectClause: "id, order_number, total_amount",
    },
    {
      dateColumn: "purchase_date",
      selectClause: "id, order_number, total_amount",
    },
  ];

  let lastError: unknown = null;

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from("purchases")
      .select(attempt.selectClause)
      .gte(attempt.dateColumn, startDate)
      .lte(attempt.dateColumn, endDate)
      .order(attempt.dateColumn);

    if (!error) {
      return data || [];
    }

    lastError = error;
  }

  throw lastError;
}

export async function getBalanceSheet(
  asOfDate: string,
): Promise<BalanceSheetData> {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    // Step 1: Fetch all active accounts for metadata and classification
    const { data: accounts, error: accError } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code, account_name, account_type, account_category, category")
      .eq("is_active", true)
      .order("account_code");

    if (accError) throw accError;

    // Step 2: Fetch all journal entries up to asOfDate (strict point-in-time)
    const { data: journalEntries, error: jeError } = await supabase
      .from("journal_entries")
      .select(`
        entry_date,
        journal_entry_lines (
          debit,
          credit,
          account_id
        )
      `)
      .lte("entry_date", asOfDate);

    if (jeError) throw jeError;

    // Step 3: Aggregate SUM(debit) and SUM(credit) per account_id
    const balanceMap = new Map<string, { debit: number; credit: number }>();

    (journalEntries || []).forEach((entry: any) => {
      (entry.journal_entry_lines || []).forEach((line: any) => {
        if (!line.account_id) return;
        const existing = balanceMap.get(line.account_id) ?? { debit: 0, credit: 0 };
        existing.debit += Number(line.debit) || 0;
        existing.credit += Number(line.credit) || 0;
        balanceMap.set(line.account_id, existing);
      });
    });

    // Step 4: Classify accounts — all classification logic preserved exactly as before
    const currentAssets: any[] = [];
    const fixedAssets: any[] = [];
    const currentLiabilities: any[] = [];
    const longTermLiabilities: any[] = [];
    const equityAccounts: any[] = [];

    (accounts ?? []).forEach((account: any) => {
      // Compute balance dynamically from journal entries
      const journalTotals = balanceMap.get(account.id) ?? { debit: 0, credit: 0 };
      const accountType = account.account_type?.toLowerCase();

      let balance: number;
      if (accountType === "asset" || accountType === "expense") {
        // Debit-normal: balance = total debits - total credits
        balance = journalTotals.debit - journalTotals.credit;
      } else {
        // Credit-normal: balance = total credits - total debits
        balance = journalTotals.credit - journalTotals.debit;
      }

      const accountData = {
        accountId: account.id,
        accountCode: account.account_code,
        accountName: account.account_name,
        balance: Math.max(0, balance), // negative balances shown as zero (abnormal)
      };

      const code = parseInt(account.account_code);
      // Use explicit category column if available, otherwise derive it
      const category =
        account.account_category?.toLowerCase() ||
        account.category?.toLowerCase() ||
        "";
      const nameLower = account.account_name?.toLowerCase() || "";

      if (accountType === "asset") {
        // Priority 1: explicit DB category
        if (category.includes("fixed") || category.includes("non_current")) {
          fixedAssets.push(accountData);
        } else if (category.includes("current")) {
          currentAssets.push(accountData);
          // Priority 2: keyword match on account name
        } else if (
          nameLower.includes("equipment") ||
          nameLower.includes("vehicle") ||
          nameLower.includes("furniture") ||
          nameLower.includes("building") ||
          nameLower.includes("property") ||
          nameLower.includes("land") ||
          nameLower.includes("machinery") ||
          nameLower.includes("depreciation")
        ) {
          fixedAssets.push(accountData);
          // Priority 3: account code range (1500+ = fixed)
        } else if (code >= 1500) {
          fixedAssets.push(accountData);
        } else {
          currentAssets.push(accountData);
        }
      } else if (accountType === "liability") {
        // Priority 1: explicit DB category
        if (
          category.includes("long_term") ||
          category.includes("non_current")
        ) {
          longTermLiabilities.push(accountData);
        } else if (category.includes("current")) {
          currentLiabilities.push(accountData);
          // Priority 2: keyword match
        } else if (
          nameLower.includes("loan") ||
          nameLower.includes("mortgage") ||
          nameLower.includes("long term") ||
          nameLower.includes("long-term") ||
          nameLower.includes("deferred")
        ) {
          longTermLiabilities.push(accountData);
          // Priority 3: code range (2500+ = long-term)
        } else if (code >= 2500) {
          longTermLiabilities.push(accountData);
        } else {
          currentLiabilities.push(accountData);
        }
      } else if (accountType === "equity") {
        equityAccounts.push(accountData);
      }
    });

    // Calculate totals
    const totalCurrentAssets = currentAssets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalFixedAssets = fixedAssets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities = currentLiabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLongTermLiabilities = longTermLiabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      asOfDate: new Date(asOfDate),
      assets: { currentAssets, fixedAssets, totalAssets },
      liabilities: {
        currentLiabilities,
        longTermLiabilities,
        totalLiabilities,
      },
      equity: { equityAccounts, totalEquity },
    };
  } catch (error) {
    console.error(
      "Error in getBalanceSheet [full]:",
      JSON.stringify(error, Object.getOwnPropertyNames(error instanceof Error ? error : Object(error))),
      "\n[raw]:",
      error,
    );
    // Fallback: empty structure — same as before this fix
    return {
      asOfDate: new Date(asOfDate),
      assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
      liabilities: {
        currentLiabilities: [],
        longTermLiabilities: [],
        totalLiabilities: 0,
      },
      equity: { equityAccounts: [], totalEquity: 0 },
    };
  }
}


export async function getProfitLoss(
  startDate: string,
  endDate: string,
): Promise<ProfitLossData> {
  try {
    const supabase = await createClient();

    // Use schema-tolerant fetchers because some environments use older/newer column names.
    const invoices = await fetchInvoicesForProfitLoss(
      supabase,
      startDate,
      endDate,
    );
    const purchases = await fetchPurchasesForProfitLoss(
      supabase,
      startDate,
      endDate,
    );

    // ── Build P&L line items ─────────────────────────────────────────────────

    // Revenue items: one line per invoice
    const revenueItems: {
      accountId: string;
      accountCode: string;
      accountName: string;
      balance: number;
    }[] = [];
    let totalRevenue = 0;

    (invoices || []).forEach((inv: any) => {
      const gross = Number(inv.total_amount ?? inv.total) || 0;
      const tax = Number(inv.tax_amount) || 0;
      const net = gross - tax; // net of VAT — this is the revenue figure
      revenueItems.push({
        accountId: inv.id,
        accountCode: inv.invoice_number || "INV",
        accountName: `Sales - ${inv.customers?.name || "Customer"}`,
        balance: net > 0 ? net : gross,
      });
      totalRevenue += net > 0 ? net : gross;
    });

    // COGS items: one line per purchase
    const cogsItems: {
      accountId: string;
      accountCode: string;
      accountName: string;
      balance: number;
    }[] = [];
    let totalCOGS = 0;

    (purchases || []).forEach((pur: any) => {
      const amount = Number(pur.total ?? pur.total_amount) || 0;
      cogsItems.push({
        accountId: pur.id,
        accountCode: pur.order_number || "PO",
        accountName: `Purchases - ${pur.suppliers?.name || "Supplier"}`,
        balance: amount,
      });
      totalCOGS += amount;
    });

    const grossProfit = totalRevenue - totalCOGS;

    // Operating expenses: try period-filtered journal entries first, fall back to static balances
    let operatingExpenseItems: {
      accountId: string;
      accountCode: string;
      accountName: string;
      balance: number;
    }[] = [];
    let totalOperatingExpenses = 0;

    try {
      // Query journal_entries as base (native date filter), embed lines + accounts
      const { data: journalEntries, error: jeError } = await supabase
        .from("journal_entries")
        .select(`
          entry_date,
          journal_entry_lines (
            debit,
            credit,
            chart_of_accounts (
              id,
              account_code,
              account_name,
              account_type
            )
          )
        `)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);

      if (jeError) throw jeError;

      // Aggregate expense debits/credits across all entries in the period
      const expenseMap = new Map<
        string,
        { accountId: string; accountCode: string; accountName: string; balance: number }
      >();

      (journalEntries || []).forEach((entry: any) => {
        (entry.journal_entry_lines || []).forEach((line: any) => {
          const account = line.chart_of_accounts;
          if (!account || account.account_type?.toLowerCase() !== "expense") return;

          const existing = expenseMap.get(account.id) || {
            accountId: account.id,
            accountCode: account.account_code,
            accountName: account.account_name,
            balance: 0,
          };
          // Debit increases expense balance; credit decreases it
          existing.balance += (Number(line.debit) || 0) - (Number(line.credit) || 0);
          expenseMap.set(account.id, existing);
        });
      });

      const journalExpenseItems = Array.from(expenseMap.values())
        .filter((item) => item.balance !== 0)
        .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

      // Only use journal data if it actually contains expense entries
      if (journalExpenseItems.length > 0) {
        operatingExpenseItems = journalExpenseItems;
        totalOperatingExpenses = journalExpenseItems.reduce((s, a) => s + a.balance, 0);
      } else {
        throw new Error("No expense journal entries in period — using static fallback");
      }
    } catch {
      // Fallback: static chart_of_accounts balances (same as before this fix)
      const { data: expenseAccounts } = await supabase
        .from("chart_of_accounts")
        .select("id, account_code, account_name, balance")
        .ilike("account_type", "Expense")
        .eq("is_active", true)
        .order("account_code");

      operatingExpenseItems = (expenseAccounts || []).map((acc: any) => ({
        accountId: acc.id,
        accountCode: acc.account_code,
        accountName: acc.account_name,
        balance: Number(acc.balance) || 0,
      }));
      totalOperatingExpenses = operatingExpenseItems.reduce((s, a) => s + a.balance, 0);
    }

    const netProfit = grossProfit - totalOperatingExpenses;

    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      revenue: {
        items: revenueItems,
        total: totalRevenue,
      },
      costOfGoodsSold: {
        items: cogsItems,
        total: totalCOGS,
      },
      grossProfit,
      operatingExpenses: {
        items: operatingExpenseItems,
        total: totalOperatingExpenses,
      },
      otherIncome: 0,
      otherExpenses: 0,
      netProfit,
    };
  } catch (error) {
    console.error("Error in getProfitLoss:", extractErrorMessage(error));
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      revenue: { items: [], total: 0 },
      costOfGoodsSold: { items: [], total: 0 },
      grossProfit: 0,
      operatingExpenses: { items: [], total: 0 },
      otherIncome: 0,
      otherExpenses: 0,
      netProfit: 0,
    };
  }
}

export async function getCashFlow(
  startDate: string,
  endDate: string,
): Promise<CashFlowData> {
  try {
    const supabase = await createClient();

    // ── Opening balance: sum of all cash/bank accounts ──────────────────────
    const { data: cashAccounts, error: cashError } = await supabase
      .from("chart_of_accounts")
      .select("balance")
      .eq("account_type", "Asset")
      .ilike("account_name", "%cash%");

    if (cashError) throw cashError;

    const openingBalance = (cashAccounts || []).reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0,
    );

    // ── Payments received from customers in the period ────────────────────────
    const { data: receipts, error: receiptsError } = await supabase
      .from("payments")
      .select("amount, customers(name)")
      .eq("type", "received")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);

    if (receiptsError) throw receiptsError;

    const totalReceipts = (receipts || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0,
    );
    const receiptCount = receipts?.length || 0;

    // ── Payments made to suppliers in the period ──────────────────────────────
    const { data: disbursements, error: disbError } = await supabase
      .from("payments")
      .select("amount, suppliers(name)")
      .eq("type", "made")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);

    if (disbError) throw disbError;

    const totalDisbursements = (disbursements || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0,
    );
    const disbCount = disbursements?.length || 0;

    // ── Build operating activities summary ────────────────────────────────────
    const operatingItems: { description: string; amount: number }[] = [];

    if (receiptCount > 0 || totalReceipts > 0) {
      operatingItems.push({
        description: `Cash receipts from customers (${receiptCount} payment${receiptCount !== 1 ? "s" : ""})`,
        amount: totalReceipts,
      });
    }

    if (disbCount > 0 || totalDisbursements > 0) {
      operatingItems.push({
        description: `Cash payments to suppliers (${disbCount} payment${disbCount !== 1 ? "s" : ""})`,
        amount: -totalDisbursements,
      });
    }

    const operatingTotal = totalReceipts - totalDisbursements;
    const netCashFlow = operatingTotal; // Investing & financing not tracked — see UI note
    const closingBalance = openingBalance + netCashFlow;

    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      operatingActivities: {
        items: operatingItems,
        total: operatingTotal,
      },
      investingActivities: { items: [], total: 0 },
      financingActivities: { items: [], total: 0 },
      netCashFlow,
      openingBalance,
      closingBalance,
    };
  } catch (error) {
    console.error(
      "Error in getCashFlow:",
      error instanceof Error ? error.message : error,
    );
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      operatingActivities: { items: [], total: 0 },
      investingActivities: { items: [], total: 0 },
      financingActivities: { items: [], total: 0 },
      netCashFlow: 0,
      openingBalance: 0,
      closingBalance: 0,
    };
  }
}

export async function getTrialBalance(
  asOfDate?: string,
): Promise<TrialBalanceData> {
  const effectiveDate = asOfDate ?? new Date().toISOString().split("T")[0];

  try {
    const supabase = await createClient();

    // Step 1: Fetch all active accounts for metadata (code, name, type)
    const { data: accounts, error: accError } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code, account_name, account_type")
      .eq("is_active", true)
      .order("account_code");

    if (accError) throw accError;

    // Step 2: Fetch all journal entries up to asOfDate, embedding their lines and account info
    const { data: journalEntries, error: jeError } = await supabase
      .from("journal_entries")
      .select(`
        entry_date,
        journal_entry_lines (
          debit,
          credit,
          account_id
        )
      `)
      .lte("entry_date", effectiveDate);

    if (jeError) throw jeError;

    // Step 3: Aggregate SUM(debit) and SUM(credit) per account_id from journal entries
    const balanceMap = new Map<string, { debit: number; credit: number }>();

    (journalEntries || []).forEach((entry: any) => {
      (entry.journal_entry_lines || []).forEach((line: any) => {
        if (!line.account_id) return;
        const existing = balanceMap.get(line.account_id) ?? { debit: 0, credit: 0 };
        existing.debit += Number(line.debit) || 0;
        existing.credit += Number(line.credit) || 0;
        balanceMap.set(line.account_id, existing);
      });
    });

    // Step 4: Build trial balance rows — all accounts shown, zero if no journal activity
    let totalDebit = 0;
    let totalCredit = 0;

    const trialBalanceAccounts = (accounts ?? []).map((account: any) => {
      const journalTotals = balanceMap.get(account.id) ?? { debit: 0, credit: 0 };
      // Net balance = total debits posted minus total credits posted for this account
      const netBalance = journalTotals.debit - journalTotals.credit;
      const accountType = account.account_type?.toLowerCase();

      let debit = 0;
      let credit = 0;

      // Normal balance rules:
      // Debit-normal: Asset, Expense → positive net balance shows in Debit column
      // Credit-normal: Liability, Equity, Revenue → positive net balance shows in Credit column
      if (accountType === "asset" || accountType === "expense") {
        debit = netBalance > 0 ? netBalance : 0;
        credit = netBalance < 0 ? Math.abs(netBalance) : 0; // abnormal credit balance
      } else if (
        accountType === "liability" ||
        accountType === "equity" ||
        accountType === "revenue"
      ) {
        credit = netBalance < 0 ? Math.abs(netBalance) : 0; // net credit balance
        // For credit-normal accounts: SUM(credit) - SUM(debit) gives the normal balance
        const creditNormalBalance = journalTotals.credit - journalTotals.debit;
        credit = creditNormalBalance > 0 ? creditNormalBalance : 0;
        debit = creditNormalBalance < 0 ? Math.abs(creditNormalBalance) : 0; // abnormal debit
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountCode: account.account_code,
        accountName: account.account_name,
        debit,
        credit,
      };
    });

    return {
      asOfDate: new Date(effectiveDate),
      accounts: trialBalanceAccounts,
      totalDebits: totalDebit,
      totalCredits: totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  } catch (error) {
    console.error("Error in getTrialBalance:", error);
    // Fallback: return all accounts with zero balances (same as before this fix)
    try {
      const supabase = await createClient();
      const { data: accounts } = await supabase
        .from("chart_of_accounts")
        .select("id, account_code, account_name, account_type")
        .eq("is_active", true)
        .order("account_code");

      return {
        asOfDate: new Date(effectiveDate),
        accounts: (accounts ?? []).map((account: any) => ({
          accountCode: account.account_code,
          accountName: account.account_name,
          debit: 0,
          credit: 0,
        })),
        totalDebits: 0,
        totalCredits: 0,
        isBalanced: true,
      };
    } catch {
      return {
        asOfDate: new Date(effectiveDate),
        accounts: [],
        totalDebits: 0,
        totalCredits: 0,
        isBalanced: true,
      };
    }
  }
}


export async function getAgedReceivables(): Promise<AgedReceivablesData[]> {
  try {
    const supabase = await createClient();

    // Fetch all invoices with customer information
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*, customers(name), payments(amount)")
      .order("issue_date", { ascending: false });

    if (error) throw error;

    // Group by customer and calculate aging
    const customerMap = new Map<string, AgedReceivablesData>();
    const today = new Date();

    invoices?.forEach((invoice) => {
      const customerId = invoice.customer_id;
      const customerName = invoice.customers?.name || "Unknown Customer";

      // Calculate amount due
      const totalAmount = Number(invoice.total_amount) || 0;
      const amountPaid =
        invoice.payments?.reduce(
          (sum: number, payment: any) => sum + (Number(payment.amount) || 0),
          0,
        ) || 0;
      const amountDue = totalAmount - amountPaid;

      if (amountDue <= 0) return; // Skip paid invoices

      // Use due_date for aging (correct: aged receivables measure days PAST DUE)
      const dueDate = invoice.due_date
        ? new Date(invoice.due_date)
        : new Date(invoice.issue_date);
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Get or create customer entry
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0,
        });
      }

      const customerData = customerMap.get(customerId)!;

      // Align with UI columns: Current | 1-30 Days | 31-60 Days | 61-90 Days | Over 90 Days
      if (daysOverdue <= 0) {
        customerData.current += amountDue; // Not yet due
      } else if (daysOverdue <= 30) {
        customerData.days30 += amountDue; // 1-30 days overdue
      } else if (daysOverdue <= 60) {
        customerData.days60 += amountDue; // 31-60 days overdue
      } else if (daysOverdue <= 90) {
        customerData.days90 += amountDue; // 61-90 days overdue
      } else {
        customerData.over90 += amountDue; // Over 90 days overdue
      }

      customerData.total += amountDue;
    });

    return Array.from(customerMap.values());
  } catch (error) {
    console.error("Error in getAgedReceivables:", error);
    return [];
  }
}

export async function getAgedPayables(): Promise<AgedPayablesData[]> {
  try {
    const supabase = await createClient();

    console.log("Fetching aged payables...");

    // Fetch all purchases with supplier info including payment_terms for due date calculation
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("*, suppliers(name, payment_terms)")
      .order("order_date", { ascending: false });

    console.log("Aged payables query result:", {
      purchasesCount: purchases?.length,
      purchases: purchases?.map((p) => ({
        supplier: p.suppliers?.name,
        orderDate: p.order_date,
        total: p.total,
        amountPaid: p.amount_paid,
        due: (p.total || 0) - (p.amount_paid || 0),
      })),
      error,
    });

    if (error) throw error;

    // Group by supplier and calculate aging
    const supplierMap = new Map<string, AgedPayablesData>();
    const today = new Date();

    purchases?.forEach((purchase) => {
      const supplierId = purchase.supplier_id;
      const supplierName = purchase.suppliers?.name || "Unknown Supplier";

      // Calculate amount due
      const totalAmount = Number(purchase.total_amount) || 0;
      const amountPaid = Number(purchase.amount_paid) || 0;
      const amountDue = totalAmount - amountPaid;

      if (amountDue <= 0) return; // Skip paid purchases

      // Use payment due date for aging: order_date + supplier payment terms (days)
      // This correctly measures how long PAST DUE the obligation is, not just how old the PO is.
      const paymentTermsDays = purchase.suppliers?.payment_terms ?? 30;
      const orderDate = new Date(purchase.order_date);
      const dueDate = new Date(
        orderDate.getTime() + paymentTermsDays * 24 * 60 * 60 * 1000,
      );
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Get or create supplier entry
      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0,
        });
      }

      const supplierData = supplierMap.get(supplierId)!;

      // Align with UI columns: Current | 1-30 Days | 31-60 Days | 61-90 Days | Over 90 Days
      if (daysOverdue <= 0) {
        supplierData.current += amountDue; // Not yet due
      } else if (daysOverdue <= 30) {
        supplierData.days30 += amountDue; // 1-30 days
      } else if (daysOverdue <= 60) {
        supplierData.days60 += amountDue; // 31-60 days
      } else if (daysOverdue <= 90) {
        supplierData.days90 += amountDue; // 61-90 days
      } else {
        supplierData.over90 += amountDue; // Over 90 days
      }

      supplierData.total += amountDue;
    });

    return Array.from(supplierMap.values());
  } catch (error) {
    console.error("Error in getAgedPayables:", error);
    return [];
  }
}

export const reportsApi = {
  getBalanceSheet: async (asOfDate: Date | string) =>
    getBalanceSheet(
      typeof asOfDate === "string"
        ? asOfDate
        : asOfDate.toISOString().split("T")[0],
    ),
  getProfitLoss: async (startDate: Date | string, endDate: Date | string) =>
    getProfitLoss(
      typeof startDate === "string"
        ? startDate
        : startDate.toISOString().split("T")[0],
      typeof endDate === "string"
        ? endDate
        : endDate.toISOString().split("T")[0],
    ),
  getCashFlow: async (startDate: Date | string, endDate: Date | string) =>
    getCashFlow(
      typeof startDate === "string"
        ? startDate
        : startDate.toISOString().split("T")[0],
      typeof endDate === "string"
        ? endDate
        : endDate.toISOString().split("T")[0],
    ),
  getTrialBalance: async (asOfDate: Date | string) =>
    getTrialBalance(
      typeof asOfDate === "string"
        ? asOfDate
        : asOfDate.toISOString().split("T")[0],
    ),
  getAgedReceivables: async () => getAgedReceivables(),
  getAgedPayables: async () => getAgedPayables(),
};
