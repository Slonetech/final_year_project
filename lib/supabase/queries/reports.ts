import { createClient } from '../server';
import { 
  TrialBalanceData, 
  AgedReceivablesData, 
  AgedPayablesData, 
  BalanceSheetData, 
  ProfitLossData, 
  CashFlowData 
} from '@/lib/types';

export const reportsApi = {
  getTrialBalance: async (asOfDate: Date): Promise<TrialBalanceData> => {
    const supabase = await createClient();
    
    // Fetch all accounts
    const { data: accountsData } = await supabase.from('chart_of_accounts').select('*');
    // Fetch journal entry lines up to date
    const { data: lines } = await supabase.from('journal_entry_lines').select(`
      account_id, debit, credit,
      journal_entries!inner(entry_date)
    `).lte('journal_entries.entry_date', asOfDate.toISOString());

    const balances = new Map<string, { debit: number; credit: number }>();
    if (lines) {
      for (const line of lines) {
        const current = balances.get(line.account_id) || { debit: 0, credit: 0 };
        current.debit += Number(line.debit) || 0;
        current.credit += Number(line.credit) || 0;
        balances.set(line.account_id, current);
      }
    }

    const accounts = (accountsData || []).map(acc => {
      const bal = balances.get(acc.id) || { debit: 0, credit: 0 };
      const net = bal.debit - bal.credit;
      
      let debit = 0;
      let credit = 0;
      
      if (acc.account_type === 'asset' || acc.account_type === 'expense') {
        if (net > 0) debit = net;
        else credit = -net;
      } else {
        if (net < 0) credit = -net;
        else debit = net;
      }

      return {
        accountCode: acc.account_code,
        accountName: acc.account_name,
        debit,
        credit,
      };
    }).filter(a => a.debit > 0 || a.credit > 0);

    const totalDebits = accounts.reduce((sum, a) => sum + a.debit, 0);
    const totalCredits = accounts.reduce((sum, a) => sum + a.credit, 0);

    return {
      asOfDate,
      accounts,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  },

  getAgedReceivables: async (): Promise<AgedReceivablesData[]> => {
    const supabase = await createClient();
    const { data: invoices } = await supabase.from('invoices').select('*, customers(name)').eq('status', 'sent');
    
    const now = new Date().getTime();
    const customerMap = new Map<string, AgedReceivablesData>();

    if (invoices) {
      for (const inv of invoices) {
        const due = new Date(inv.due_date).getTime();
        const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        const amount = Number(inv.total_amount) || 0; // Assuming no partial payments for simplicity

        let existing = customerMap.get(inv.customer_id) || {
          customerId: inv.customer_id,
          customerName: inv.customers?.name || 'Unknown',
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0,
        };

        if (diffDays <= 0) existing.current += amount;
        else if (diffDays <= 30) existing.days30 += amount;
        else if (diffDays <= 60) existing.days60 += amount;
        else if (diffDays <= 90) existing.days90 += amount;
        else existing.over90 += amount;

        existing.total += amount;
        customerMap.set(inv.customer_id, existing);
      }
    }

    return Array.from(customerMap.values());
  },

  getAgedPayables: async (): Promise<AgedPayablesData[]> => {
    // Currently no suppliers payments modeled in DB. Return empty for now to not break the UI.
    return [];
  },

  getBalanceSheet: async (asOfDate: Date): Promise<BalanceSheetData> => {
    const supabase = await createClient();
    const { data: accountsData } = await supabase.from('chart_of_accounts').select('*');
    const { data: lines } = await supabase.from('journal_entry_lines').select(`
      account_id, debit, credit,
      journal_entries!inner(entry_date)
    `).lte('journal_entries.entry_date', asOfDate.toISOString());

    const balances = new Map<string, number>();
    if (lines) {
      for (const line of lines) {
        const bal = balances.get(line.account_id) || 0;
        // Asset/Expense: debit is +, credit is -
        // Liab/Equity/Rev: credit is +, debit is -
        const isDebitNormal = ['asset', 'expense'].includes(accountsData?.find(a=>a.id === line.account_id)?.account_type || '');
        const net = (Number(line.debit) || 0) - (Number(line.credit) || 0);
        balances.set(line.account_id, bal + (isDebitNormal ? net : -net));
      }
    }

    const currentAssets: any[] = [];
    const fixedAssets: any[] = [];
    const currentLiabilities: any[] = [];
    const longTermLiabilities: any[] = [];
    const equityAccounts: any[] = [];

    (accountsData || []).forEach(acc => {
      const balance = balances.get(acc.id) || 0;
      if (balance === 0) return;

      const accItem = { accountId: acc.id, accountCode: acc.account_code, accountName: acc.account_name, balance };
      
      // Rough categorization based on account type
      if (acc.account_type === 'asset') {
        currentAssets.push(accItem);
      } else if (acc.account_type === 'liability') {
        currentLiabilities.push(accItem);
      } else if (acc.account_type === 'equity') {
        equityAccounts.push(accItem);
      }
    });

    const sum = (arr: any[]) => arr.reduce((acc, curr) => acc + curr.balance, 0);

    return {
      asOfDate,
      assets: {
        currentAssets,
        fixedAssets,
        totalAssets: sum(currentAssets) + sum(fixedAssets)
      },
      liabilities: {
        currentLiabilities,
        longTermLiabilities,
        totalLiabilities: sum(currentLiabilities) + sum(longTermLiabilities)
      },
      equity: {
        equityAccounts,
        totalEquity: sum(equityAccounts)
      }
    };
  },

  getProfitLoss: async (startDate: Date, endDate: Date): Promise<ProfitLossData> => {
    const supabase = await createClient();
    const { data: accountsData } = await supabase.from('chart_of_accounts').select('*');
    const { data: lines } = await supabase.from('journal_entry_lines').select(`
      account_id, debit, credit,
      journal_entries!inner(entry_date)
    `).gte('journal_entries.entry_date', startDate.toISOString()).lte('journal_entries.entry_date', endDate.toISOString());

    const balances = new Map<string, number>();
    if (lines) {
      for (const line of lines) {
        const bal = balances.get(line.account_id) || 0;
        const isDebitNormal = ['asset', 'expense'].includes(accountsData?.find(a=>a.id === line.account_id)?.account_type || '');
        const net = (Number(line.debit) || 0) - (Number(line.credit) || 0);
        balances.set(line.account_id, bal + (isDebitNormal ? net : -net));
      }
    }

    const revenueItems: any[] = [];
    const cogsItems: any[] = [];
    const opexItems: any[] = [];
    let otherIncome = 0;
    let otherExpenses = 0;

    (accountsData || []).forEach(acc => {
      const balance = balances.get(acc.id) || 0;
      if (balance === 0) return;

      const accItem = { accountId: acc.id, accountCode: acc.account_code, accountName: acc.account_name, balance };
      
      if (acc.account_type === 'revenue') {
        revenueItems.push(accItem);
      } else if (acc.account_type === 'expense') {
        opexItems.push(accItem);
      }
    });

    const sum = (arr: any[]) => arr.reduce((acc, curr) => acc + curr.balance, 0);
    const totalRev = sum(revenueItems);
    const totalCogs = sum(cogsItems);
    const grossProfit = totalRev - totalCogs;
    const totalOpex = sum(opexItems);
    const netProfit = grossProfit - totalOpex + otherIncome - otherExpenses;

    return {
      startDate,
      endDate,
      revenue: { items: revenueItems, total: totalRev },
      costOfGoodsSold: { items: cogsItems, total: totalCogs },
      grossProfit,
      operatingExpenses: { items: opexItems, total: totalOpex },
      otherIncome,
      otherExpenses,
      netProfit,
    };
  },

  getCashFlow: async (startDate: Date, endDate: Date): Promise<CashFlowData> => {
    return {
      startDate,
      endDate,
      operatingActivities: { items: [], total: 0 },
      investingActivities: { items: [], total: 0 },
      financingActivities: { items: [], total: 0 },
      netCashFlow: 0,
      openingBalance: 0,
      closingBalance: 0,
    };
  }
};
