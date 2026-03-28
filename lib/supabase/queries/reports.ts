import { createClient } from '../server'
import { 
  BalanceSheetData, ProfitLossData, CashFlowData, 
  TrialBalanceData, AgedReceivablesData, AgedPayablesData 
} from '@/lib/types'

export async function getBalanceSheet(asOfDate: string): Promise<BalanceSheetData> {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error in getBalanceSheet:", { authError, hasUser: !!user })
      throw new Error("User not authenticated")
    }

    console.log("Fetching chart of accounts for user:", user.id)

    // Fetch all accounts from chart of accounts (using actual DB column names)
    const { data: accounts, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code')

    console.log("Chart of accounts query result:", {
      accountsCount: accounts?.length || 0,
      error: error ? JSON.stringify(error, null, 2) : null,
      firstAccount: accounts?.[0]
    })

    if (error) {
      console.error("Database error in getBalanceSheet:", JSON.stringify(error, null, 2))
      throw error
    }

    if (!accounts || accounts.length === 0) {
      console.warn("No accounts found in chart_of_accounts table")
    }

    // Initialize categories
    const currentAssets: any[] = []
    const fixedAssets: any[] = []
    const currentLiabilities: any[] = []
    const longTermLiabilities: any[] = []
    const equityAccounts: any[] = []

    // Group accounts by type (using actual DB column names)
    accounts?.forEach((account) => {
      const accountData = {
        accountId: account.id,
        accountCode: account.account_code,
        accountName: account.account_name,
        balance: Number(account.balance) || 0
      }

      const accountType = account.account_type?.toLowerCase()

      // For now, categorize by account code ranges since we don't have category column
      const code = parseInt(account.account_code)

      if (accountType === 'asset') {
        if (code < 1500) {
          currentAssets.push(accountData) // 1000-1499 = Current Assets
        } else {
          fixedAssets.push(accountData) // 1500+ = Fixed Assets
        }
      } else if (accountType === 'liability') {
        if (code < 2500) {
          currentLiabilities.push(accountData) // 2000-2499 = Current Liabilities
        } else {
          longTermLiabilities.push(accountData) // 2500+ = Long-term Liabilities
        }
      } else if (accountType === 'equity') {
        equityAccounts.push(accountData)
      }
    })

    // Calculate totals
    const totalCurrentAssets = currentAssets.reduce((sum, acc) => sum + acc.balance, 0)
    const totalFixedAssets = fixedAssets.reduce((sum, acc) => sum + acc.balance, 0)
    const totalAssets = totalCurrentAssets + totalFixedAssets

    const totalCurrentLiabilities = currentLiabilities.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLongTermLiabilities = longTermLiabilities.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities

    const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.balance, 0)

    return {
      asOfDate: new Date(asOfDate),
      assets: {
        currentAssets,
        fixedAssets,
        totalAssets
      },
      liabilities: {
        currentLiabilities,
        longTermLiabilities,
        totalLiabilities
      },
      equity: {
        equityAccounts,
        totalEquity
      }
    }
  } catch (error) {
    console.error("Error in getBalanceSheet:", {
      error,
      errorString: JSON.stringify(error),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    })
    return {
      asOfDate: new Date(asOfDate),
      assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
      liabilities: { currentLiabilities: [], longTermLiabilities: [], totalLiabilities: 0 },
      equity: { equityAccounts: [], totalEquity: 0 }
    }
  }
}

export async function getProfitLoss(startDate: string, endDate: string): Promise<ProfitLossData> {
  try {
    const supabase = await createClient()

    // Fetch revenue and expense accounts (using actual DB column names)
    const { data: accounts, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .in('account_type', ['Revenue', 'Expense'])
      .eq('is_active', true)
      .order('account_code')

    console.log("P&L accounts query:", {
      accountsCount: accounts?.length,
      accounts: accounts?.map(a => ({ code: a.account_code, name: a.account_name, type: a.account_type, balance: a.balance })),
      error
    })

    if (error) throw error

    // Initialize categories
    const revenueItems: any[] = []
    const cogsItems: any[] = []
    const operatingExpenseItems: any[] = []
    const otherRevenueItems: any[] = []
    const otherExpenseItems: any[] = []

    // Group accounts by type and account code ranges
    accounts?.forEach((account) => {
      const accountData = {
        accountId: account.id,
        accountCode: account.account_code,
        accountName: account.account_name,
        balance: Number(account.balance) || 0
      }

      const accountType = account.account_type?.toLowerCase()
      const code = parseInt(account.account_code)

      if (accountType === 'revenue') {
        revenueItems.push(accountData)
      } else if (accountType === 'expense') {
        if (code >= 5000 && code < 5100) {
          cogsItems.push(accountData) // 5000-5099 = COGS
        } else {
          operatingExpenseItems.push(accountData) // Other expenses
        }
      }
    })

    // Calculate totals
    const totalRevenue = revenueItems.reduce((sum, acc) => sum + acc.balance, 0)
    const totalCOGS = cogsItems.reduce((sum, acc) => sum + acc.balance, 0)
    const grossProfit = totalRevenue - totalCOGS

    const totalOperatingExpenses = operatingExpenseItems.reduce((sum, acc) => sum + acc.balance, 0)
    const otherIncome = otherRevenueItems.reduce((sum, acc) => sum + acc.balance, 0)
    const otherExpenses = otherExpenseItems.reduce((sum, acc) => sum + acc.balance, 0)

    const netProfit = grossProfit - totalOperatingExpenses + otherIncome - otherExpenses

    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      revenue: {
        items: revenueItems,
        total: totalRevenue
      },
      costOfGoodsSold: {
        items: cogsItems,
        total: totalCOGS
      },
      grossProfit,
      operatingExpenses: {
        items: operatingExpenseItems,
        total: totalOperatingExpenses
      },
      otherIncome,
      otherExpenses,
      netProfit
    }
  } catch (error) {
    console.error("Error in getProfitLoss:", error)
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      revenue: { items: [], total: 0 },
      costOfGoodsSold: { items: [], total: 0 },
      grossProfit: 0,
      operatingExpenses: { items: [], total: 0 },
      otherIncome: 0,
      otherExpenses: 0,
      netProfit: 0
    }
  }
}

export async function getCashFlow(startDate: string, endDate: string): Promise<CashFlowData> {
  try {
    const supabase = await createClient()

    console.log("Fetching cash flow data for period:", { startDate, endDate })

    // Fetch cash accounts to calculate opening and closing balances
    const { data: cashAccounts, error: cashError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('account_type', 'Asset')
      .ilike('account_name', '%cash%')

    console.log("Cash accounts:", { count: cashAccounts?.length, error: cashError })

    if (cashError) {
      console.error("Cash accounts error:", cashError)
      throw cashError
    }

    const beginningCash = cashAccounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0

    // Fetch payments made and received in the period
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*, customers(name), suppliers(name)')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date')

    console.log("Payments:", { count: payments?.length, error: paymentsError })

    if (paymentsError) {
      console.error("Payments error:", paymentsError)
      throw paymentsError
    }

    // Categorize cash flows
    const operatingItems: any[] = []
    const investingItems: any[] = []
    const financingItems: any[] = []

    let operatingTotal = 0
    let investingTotal = 0
    let financingTotal = 0

    payments?.forEach((payment) => {
      const amount = Number(payment.amount) || 0
      const description = payment.type === 'received'
        ? `Payment from ${payment.customers?.name || 'Customer'}`
        : `Payment to ${payment.suppliers?.name || 'Supplier'}`

      // For now, categorize all as operating activities
      // In a full implementation, you'd categorize based on transaction type
      const item = {
        description,
        amount: payment.type === 'received' ? amount : -amount
      }

      operatingItems.push(item)
      operatingTotal += item.amount
    })

    const netCashFlow = operatingTotal + investingTotal + financingTotal
    const closingBalance = beginningCash + netCashFlow

    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      operatingActivities: {
        items: operatingItems,
        total: operatingTotal
      },
      investingActivities: {
        items: investingItems,
        total: investingTotal
      },
      financingActivities: {
        items: financingItems,
        total: financingTotal
      },
      netCashFlow,
      openingBalance: beginningCash,
      closingBalance
    }
  } catch (error) {
    console.error("Error in getCashFlow:", {
      error,
      errorString: JSON.stringify(error),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    })
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      operatingActivities: { items: [], total: 0 },
      investingActivities: { items: [], total: 0 },
      financingActivities: { items: [], total: 0 },
      netCashFlow: 0,
      openingBalance: 0,
      closingBalance: 0
    }
  }
}

export async function getTrialBalance(asOfDate?: string): Promise<TrialBalanceData> {
  try {
    const supabase = await createClient()

    // Fetch all active accounts (using actual DB column names)
    const { data: accounts, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code')

    if (error) throw error

    let totalDebit = 0
    let totalCredit = 0

    const trialBalanceAccounts = accounts?.map((account) => {
      const balance = Number(account.balance) || 0
      const accountType = account.account_type?.toLowerCase()

      // Asset and Expense accounts have debit balances
      // Liability, Equity, and Revenue accounts have credit balances
      let debit = 0
      let credit = 0

      if (accountType === 'asset' || accountType === 'expense') {
        debit = balance
        totalDebit += balance
      } else if (accountType === 'liability' || accountType === 'equity' || accountType === 'revenue') {
        credit = balance
        totalCredit += balance
      }

      return {
        accountCode: account.account_code,
        accountName: account.account_name,
        debit,
        credit
      }
    }) || []

    return {
      asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
      accounts: trialBalanceAccounts,
      totalDebits: totalDebit,
      totalCredits: totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 // Allow for small rounding differences
    }
  } catch (error) {
    console.error("Error in getTrialBalance:", error)
    return {
      asOfDate: new Date(),
      accounts: [],
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: true
    }
  }
}

export async function getAgedReceivables(): Promise<AgedReceivablesData[]> {
  try {
    const supabase = await createClient()

    // Fetch all invoices with customer information
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, customers(name), payments(amount)')
      .order('issue_date', { ascending: false })

    if (error) throw error

    // Group by customer and calculate aging
    const customerMap = new Map<string, AgedReceivablesData>()
    const today = new Date()

    invoices?.forEach((invoice) => {
      const customerId = invoice.customer_id
      const customerName = invoice.customers?.name || 'Unknown Customer'

      // Calculate amount due
      const totalAmount = Number(invoice.total_amount) || 0
      const amountPaid = invoice.payments?.reduce((sum: number, payment: any) =>
        sum + (Number(payment.amount) || 0), 0) || 0
      const amountDue = totalAmount - amountPaid

      if (amountDue <= 0) return // Skip paid invoices

      // Calculate age in days
      const invoiceDate = new Date(invoice.issue_date)
      const daysOld = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))

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
          total: 0
        })
      }

      const customerData = customerMap.get(customerId)!

      // Categorize by age
      if (daysOld <= 30) {
        customerData.current += amountDue
      } else if (daysOld <= 60) {
        customerData.days30 += amountDue
      } else if (daysOld <= 90) {
        customerData.days60 += amountDue
      } else if (daysOld <= 120) {
        customerData.days90 += amountDue
      } else {
        customerData.over90 += amountDue
      }

      customerData.total += amountDue
    })

    return Array.from(customerMap.values())
  } catch (error) {
    console.error("Error in getAgedReceivables:", error)
    return []
  }
}

export async function getAgedPayables(): Promise<AgedPayablesData[]> {
  try {
    const supabase = await createClient()

    console.log("Fetching aged payables...")

    // Fetch all purchases with supplier information and payment status
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*, suppliers(name)')
      .order('order_date', { ascending: false })

    console.log("Aged payables query result:", {
      purchasesCount: purchases?.length,
      purchases: purchases?.map(p => ({
        supplier: p.suppliers?.name,
        orderDate: p.order_date,
        total: p.total,
        amountPaid: p.amount_paid,
        due: (p.total || 0) - (p.amount_paid || 0)
      })),
      error
    })

    if (error) throw error

    // Group by supplier and calculate aging
    const supplierMap = new Map<string, AgedPayablesData>()
    const today = new Date()

    purchases?.forEach((purchase) => {
      const supplierId = purchase.supplier_id
      const supplierName = purchase.suppliers?.name || 'Unknown Supplier'

      // Calculate amount due
      const totalAmount = Number(purchase.total_amount) || 0
      const amountPaid = Number(purchase.amount_paid) || 0
      const amountDue = totalAmount - amountPaid

      if (amountDue <= 0) return // Skip paid purchases

      // Calculate age in days
      const purchaseDate = new Date(purchase.order_date)
      const daysOld = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))

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
          total: 0
        })
      }

      const supplierData = supplierMap.get(supplierId)!

      // Categorize by age
      if (daysOld <= 30) {
        supplierData.current += amountDue
      } else if (daysOld <= 60) {
        supplierData.days30 += amountDue
      } else if (daysOld <= 90) {
        supplierData.days60 += amountDue
      } else if (daysOld <= 120) {
        supplierData.days90 += amountDue
      } else {
        supplierData.over90 += amountDue
      }

      supplierData.total += amountDue
    })

    return Array.from(supplierMap.values())
  } catch (error) {
    console.error("Error in getAgedPayables:", error)
    return []
  }
}

export const reportsApi = {
  getBalanceSheet: async (asOfDate: Date | string) => getBalanceSheet(typeof asOfDate === 'string' ? asOfDate : asOfDate.toISOString().split('T')[0]),
  getProfitLoss: async (startDate: Date | string, endDate: Date | string) => getProfitLoss(
    typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
    typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0]
  ),
  getCashFlow: async (startDate: Date | string, endDate: Date | string) => getCashFlow(
    typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
    typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0]
  ),
  getTrialBalance: async (asOfDate: Date | string) => getTrialBalance(typeof asOfDate === 'string' ? asOfDate : asOfDate.toISOString().split('T')[0]),
  getAgedReceivables: async () => getAgedReceivables(),
  getAgedPayables: async () => getAgedPayables()
}
