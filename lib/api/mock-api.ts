import {
  Supplier, Customer, Product, Invoice, Payment, Account, User,
  CreateSupplierDto, UpdateSupplierDto, CreateCustomerDto, UpdateCustomerDto,
  CreateProductDto, UpdateProductDto, CreateInvoiceDto, CreatePaymentDto,
  CreateAccountDto, DashboardKPIs, RecentTransaction, TopCustomer, TopProduct,
  SalesChartData, LowStockAlert, BalanceSheetData, ProfitLossData,
  TrialBalanceData, AgedReceivablesData, AgedPayablesData, CashFlowData,
  PurchaseOrder, CreatePurchaseOrderDto, SalesOrder, CreateSalesOrderDto,
  JournalEntry, CreateJournalEntryDto,
} from "@/lib/types";
import { mockDataStore } from "./mock-data";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// AUTHENTICATION
// ============================================

export const mockAuthApi = {
  login: async (email: string, password: string) => {
    await delay(800);
    // Mock authentication - accepts any credentials
    const user = mockDataStore.users.find(u => u.email === email) || mockDataStore.users[0];
    return {
      user,
      token: "mock-jwt-token-" + Math.random().toString(36).substr(2, 9),
    };
  },

  getCurrentUser: async () => {
    await delay(200);
    return mockDataStore.users[0]; // Return default admin user
  },
};

// ============================================
// SUPPLIERS API
// ============================================

export const mockSuppliersApi = {
  getAll: async (filters?: { query?: string; status?: string }) => {
    await delay(300);
    let suppliers = [...mockDataStore.suppliers];

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      suppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query)
      );
    }

    if (filters?.status) {
      suppliers = suppliers.filter(s => s.status === filters.status);
    }

    return suppliers;
  },

  getById: async (id: string) => {
    await delay(200);
    const supplier = mockDataStore.suppliers.find(s => s.id === id);
    if (!supplier) throw new Error("Supplier not found");
    return supplier;
  },

  create: async (data: CreateSupplierDto) => {
    await delay(500);
    const newSupplier: Supplier = {
      ...data,
      id: `supplier-${Date.now()}`,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.suppliers.push(newSupplier);
    return newSupplier;
  },

  update: async (id: string, data: UpdateSupplierDto) => {
    await delay(400);
    const index = mockDataStore.suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Supplier not found");

    mockDataStore.suppliers[index] = {
      ...mockDataStore.suppliers[index],
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.suppliers[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Supplier not found");
    mockDataStore.suppliers.splice(index, 1);
    return { success: true };
  },
};

// ============================================
// CUSTOMERS API
// ============================================

export const mockCustomersApi = {
  getAll: async (filters?: { query?: string; status?: string }) => {
    await delay(300);
    let customers = [...mockDataStore.customers];

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.contactPerson.toLowerCase().includes(query)
      );
    }

    if (filters?.status) {
      customers = customers.filter(c => c.status === filters.status);
    }

    return customers;
  },

  getById: async (id: string) => {
    await delay(200);
    const customer = mockDataStore.customers.find(c => c.id === id);
    if (!customer) throw new Error("Customer not found");
    return customer;
  },

  create: async (data: CreateCustomerDto) => {
    await delay(500);
    const newCustomer: Customer = {
      ...data,
      id: `customer-${Date.now()}`,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.customers.push(newCustomer);
    return newCustomer;
  },

  update: async (id: string, data: UpdateCustomerDto) => {
    await delay(400);
    const index = mockDataStore.customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Customer not found");

    mockDataStore.customers[index] = {
      ...mockDataStore.customers[index],
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.customers[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Customer not found");
    mockDataStore.customers.splice(index, 1);
    return { success: true };
  },
};

// ============================================
// PRODUCTS API
// ============================================

export const mockProductsApi = {
  getAll: async (filters?: { query?: string; category?: string }) => {
    await delay(300);
    let products = [...mockDataStore.products];

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }

    return products;
  },

  getById: async (id: string) => {
    await delay(200);
    const product = mockDataStore.products.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  },

  create: async (data: CreateProductDto) => {
    await delay(500);
    const newProduct: Product = {
      ...data,
      id: `product-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.products.push(newProduct);
    return newProduct;
  },

  update: async (id: string, data: UpdateProductDto) => {
    await delay(400);
    const index = mockDataStore.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");

    mockDataStore.products[index] = {
      ...mockDataStore.products[index],
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.products[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    mockDataStore.products.splice(index, 1);
    return { success: true };
  },

  getLowStock: async () => {
    await delay(200);
    return mockDataStore.products
      .filter(p => p.stockLevel <= p.reorderPoint)
      .map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.stockLevel,
        reorderPoint: p.reorderPoint,
      }));
  },
};

// ============================================
// INVOICES API
// ============================================

export const mockInvoicesApi = {
  getAll: async (filters?: { status?: string; customerId?: string }) => {
    await delay(300);
    let invoices = [...mockDataStore.invoices];

    if (filters?.status) {
      invoices = invoices.filter(i => i.status === filters.status);
    }

    if (filters?.customerId) {
      invoices = invoices.filter(i => i.customerId === filters.customerId);
    }

    return invoices.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  },

  getById: async (id: string) => {
    await delay(200);
    const invoice = mockDataStore.invoices.find(i => i.id === id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  create: async (data: CreateInvoiceDto) => {
    await delay(500);
    const newInvoice: Invoice = {
      ...data,
      id: `invoice-${Date.now()}`,
      invoiceNumber: `INV-${String(mockDataStore.invoices.length + 1001).padStart(4, "0")}`,
      amountPaid: 0,
      amountDue: data.total,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.invoices.push(newInvoice);
    return newInvoice;
  },

  update: async (id: string, data: Partial<Invoice>) => {
    await delay(400);
    const index = mockDataStore.invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Invoice not found");

    mockDataStore.invoices[index] = {
      ...mockDataStore.invoices[index],
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.invoices[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Invoice not found");
    mockDataStore.invoices.splice(index, 1);
    return { success: true };
  },
};

// ============================================
// PAYMENTS API
// ============================================

export const mockPaymentsApi = {
  getAll: async (filters?: { type?: string; customerId?: string; supplierId?: string }) => {
    await delay(300);
    let payments = [...mockDataStore.payments];

    if (filters?.type) {
      payments = payments.filter(p => p.type === filters.type);
    }

    if (filters?.customerId) {
      payments = payments.filter(p => p.customerId === filters.customerId);
    }

    if (filters?.supplierId) {
      payments = payments.filter(p => p.supplierId === filters.supplierId);
    }

    return payments.sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  getById: async (id: string) => {
    await delay(200);
    const payment = mockDataStore.payments.find(p => p.id === id);
    if (!payment) throw new Error("Payment not found");
    return payment;
  },

  create: async (data: CreatePaymentDto) => {
    await delay(500);
    const newPayment: Payment = {
      ...data,
      id: `payment-${Date.now()}`,
      paymentNumber: `PAY-${String(mockDataStore.payments.length + 1001).padStart(4, "0")}`,
      createdAt: new Date(),
    };
    mockDataStore.payments.push(newPayment);
    return newPayment;
  },
};

// ============================================
// ACCOUNTS API
// ============================================

export const mockAccountsApi = {
  getAll: async () => {
    await delay(300);
    return [...mockDataStore.accounts];
  },

  getById: async (id: string) => {
    await delay(200);
    const account = mockDataStore.accounts.find(a => a.id === id);
    if (!account) throw new Error("Account not found");
    return account;
  },

  getByType: async (type: string) => {
    await delay(200);
    return mockDataStore.accounts.filter(a => a.type === type);
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const mockDashboardApi = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    await delay(400);

    const totalRevenue = mockDataStore.invoices
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = mockDataStore.accounts
      .filter(a => a.type === "expense")
      .reduce((sum, a) => sum + a.balance, 0);

    const netProfit = totalRevenue - totalExpenses;

    const cashBalance = mockDataStore.accounts
      .filter(a => a.code === "1010" || a.code === "1020")
      .reduce((sum, a) => sum + a.balance, 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashBalance,
      revenueChange: 12.5,
      expensesChange: 8.3,
      profitChange: 15.7,
      cashChange: -3.2,
    };
  },

  getRecentTransactions: async (): Promise<RecentTransaction[]> => {
    await delay(300);

    const invoiceTransactions = mockDataStore.invoices
      .slice(0, 5)
      .map(i => ({
        id: i.id,
        date: i.invoiceDate,
        type: "Invoice",
        reference: i.invoiceNumber,
        description: `Invoice to ${i.customerName}`,
        amount: i.total,
        status: i.status,
      }));

    const paymentTransactions = mockDataStore.payments
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: "Payment",
        reference: p.paymentNumber,
        description: p.type === "received"
          ? `Payment from ${p.customerName}`
          : `Payment to ${p.supplierName}`,
        amount: p.amount,
      }));

    return [...invoiceTransactions, ...paymentTransactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  },

  getTopCustomers: async (): Promise<TopCustomer[]> => {
    await delay(300);

    const customerRevenue = mockDataStore.invoices
      .filter(i => i.status === "paid")
      .reduce((acc, invoice) => {
        if (!acc[invoice.customerId]) {
          acc[invoice.customerId] = {
            id: invoice.customerId,
            name: invoice.customerName,
            revenue: 0,
            invoiceCount: 0,
          };
        }
        acc[invoice.customerId].revenue += invoice.total;
        acc[invoice.customerId].invoiceCount += 1;
        return acc;
      }, {} as Record<string, TopCustomer>);

    return Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    await delay(300);

    const productSales = mockDataStore.invoices
      .filter(i => i.status === "paid")
      .flatMap(i => i.lines)
      .reduce((acc, line) => {
        if (line.productId) {
          if (!acc[line.productId]) {
            acc[line.productId] = {
              id: line.productId,
              name: line.description,
              quantitySold: 0,
              revenue: 0,
            };
          }
          acc[line.productId].quantitySold += line.quantity;
          acc[line.productId].revenue += line.total;
        }
        return acc;
      }, {} as Record<string, TopProduct>);

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  },

  getSalesChartData: async (): Promise<SalesChartData[]> => {
    await delay(300);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

    return months.map(month => ({
      month,
      sales: Math.floor(Math.random() * 3000000) + 1000000,
      expenses: Math.floor(Math.random() * 2000000) + 500000,
    }));
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    await delay(200);
    return mockProductsApi.getLowStock();
  },
};

// ============================================
// REPORTS API
// ============================================

export const mockReportsApi = {
  getTrialBalance: async (asOfDate: Date): Promise<TrialBalanceData> => {
    await delay(500);

    const accounts = mockDataStore.accounts.map(acc => ({
      accountCode: acc.code,
      accountName: acc.name,
      debit: acc.type === "asset" || acc.type === "expense" ? acc.balance : 0,
      credit: acc.type === "liability" || acc.type === "equity" || acc.type === "revenue" ? acc.balance : 0,
    }));

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
    await delay(400);

    return mockDataStore.customers.slice(0, 10).map(customer => {
      const total = Math.floor(Math.random() * 500000);
      return {
        customerId: customer.id,
        customerName: customer.name,
        current: Math.floor(total * 0.4),
        days30: Math.floor(total * 0.3),
        days60: Math.floor(total * 0.2),
        days90: Math.floor(total * 0.05),
        over90: Math.floor(total * 0.05),
        total,
      };
    });
  },

  getAgedPayables: async (): Promise<AgedPayablesData[]> => {
    await delay(400);

    return mockDataStore.suppliers.slice(0, 10).map(supplier => {
      const total = Math.floor(Math.random() * 300000);
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        current: Math.floor(total * 0.5),
        days30: Math.floor(total * 0.3),
        days60: Math.floor(total * 0.15),
        days90: Math.floor(total * 0.03),
        over90: Math.floor(total * 0.02),
        total,
      };
    });
  },

  getBalanceSheet: async (asOfDate: Date): Promise<BalanceSheetData> => {
    await delay(500);
    const accounts = mockDataStore.accounts;

    const currentAssets = accounts.filter(a => a.category === "current_asset" && !accounts.some(p => p.id === a.parentId && p.category === "current_asset"));
    const fixedAssets = accounts.filter(a => a.category === "fixed_asset");
    const currentLiabilities = accounts.filter(a => a.category === "current_liability" && !accounts.some(p => p.id === a.parentId));
    const longTermLiabilities = accounts.filter(a => a.category === "long_term_liability");
    const equityAccounts = accounts.filter(a => a.category === "equity" && a.parentId);

    const toBalance = (accs: typeof accounts) => accs.map(a => ({
      accountId: a.id, accountCode: a.code, accountName: a.name, balance: a.balance,
    }));

    const totalCurrentAssets = currentAssets.reduce((s, a) => s + a.balance, 0);
    const totalFixedAssets = fixedAssets.reduce((s, a) => s + a.balance, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;
    const totalCurrentLiabilities = currentLiabilities.reduce((s, a) => s + a.balance, 0);
    const totalLongTermLiabilities = longTermLiabilities.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);

    return {
      asOfDate,
      assets: { currentAssets: toBalance(currentAssets), fixedAssets: toBalance(fixedAssets), totalAssets },
      liabilities: { currentLiabilities: toBalance(currentLiabilities), longTermLiabilities: toBalance(longTermLiabilities), totalLiabilities },
      equity: { equityAccounts: toBalance(equityAccounts), totalEquity },
    };
  },

  getProfitLoss: async (startDate: Date, endDate: Date): Promise<ProfitLossData> => {
    await delay(500);
    const accounts = mockDataStore.accounts;

    const revenueItems = accounts.filter(a => a.category === "operating_revenue" && a.parentId);
    const cogsItems = accounts.filter(a => a.category === "cost_of_goods_sold");
    const opexItems = accounts.filter(a => a.category === "operating_expense" && a.parentId);
    const otherRevenue = accounts.filter(a => a.category === "other_revenue");
    const otherExpense = accounts.filter(a => a.category === "other_expense");

    const toBalance = (accs: typeof accounts) => accs.map(a => ({
      accountId: a.id, accountCode: a.code, accountName: a.name, balance: a.balance,
    }));

    const totalRevenue = revenueItems.reduce((s, a) => s + a.balance, 0);
    const totalCOGS = cogsItems.reduce((s, a) => s + a.balance, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalOpex = opexItems.reduce((s, a) => s + a.balance, 0);
    const otherIncome = otherRevenue.reduce((s, a) => s + a.balance, 0);
    const otherExp = otherExpense.reduce((s, a) => s + a.balance, 0);
    const netProfit = grossProfit - totalOpex + otherIncome - otherExp;

    return {
      startDate,
      endDate,
      revenue: { items: toBalance(revenueItems), total: totalRevenue },
      costOfGoodsSold: { items: toBalance(cogsItems), total: totalCOGS },
      grossProfit,
      operatingExpenses: { items: toBalance(opexItems), total: totalOpex },
      otherIncome,
      otherExpenses: otherExp,
      netProfit,
    };
  },

  getCashFlow: async (startDate: Date, endDate: Date): Promise<CashFlowData> => {
    await delay(500);
    const cashAccounts = mockDataStore.accounts.filter(a => a.code === "1010" || a.code === "1020");
    const openingBalance = cashAccounts.reduce((s, a) => s + a.balance * 0.85, 0);
    const closingBalance = cashAccounts.reduce((s, a) => s + a.balance, 0);

    const revenue = mockDataStore.accounts.find(a => a.code === "4010")?.balance ?? 0;
    const cogs = mockDataStore.accounts.find(a => a.code === "5000")?.balance ?? 0;
    const salaries = mockDataStore.accounts.find(a => a.code === "6010")?.balance ?? 0;
    const rent = mockDataStore.accounts.find(a => a.code === "6020")?.balance ?? 0;

    return {
      startDate,
      endDate,
      operatingActivities: {
        items: [
          { description: "Cash receipts from customers", amount: revenue * 0.9 },
          { description: "Cash paid to suppliers", amount: -cogs * 0.8 },
          { description: "Cash paid for salaries", amount: -salaries },
          { description: "Cash paid for rent", amount: -rent },
        ],
        total: revenue * 0.9 - cogs * 0.8 - salaries - rent,
      },
      investingActivities: {
        items: [
          { description: "Purchase of fixed assets", amount: -1500000 },
          { description: "Proceeds from asset disposal", amount: 250000 },
        ],
        total: -1250000,
      },
      financingActivities: {
        items: [
          { description: "Loan repayment", amount: -500000 },
          { description: "Owner drawings", amount: -300000 },
        ],
        total: -800000,
      },
      netCashFlow: closingBalance - openingBalance,
      openingBalance,
      closingBalance,
    };
  },
};

// ============================================
// SETTINGS API
// ============================================

export const mockSettingsApi = {
  getCompanySettings: async () => {
    await delay(200);
    return mockDataStore.companySettings;
  },

  getTaxSettings: async () => {
    await delay(200);
    return mockDataStore.taxSettings;
  },

  getInvoiceSettings: async () => {
    await delay(200);
    return mockDataStore.invoiceSettings;
  },

  updateCompanySettings: async (data: Partial<typeof mockDataStore.companySettings>) => {
    await delay(400);
    mockDataStore.companySettings = {
      ...mockDataStore.companySettings,
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.companySettings;
  },

  updateTaxSettings: async (data: Partial<typeof mockDataStore.taxSettings>) => {
    await delay(400);
    mockDataStore.taxSettings = {
      ...mockDataStore.taxSettings,
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.taxSettings;
  },

  updateInvoiceSettings: async (data: Partial<typeof mockDataStore.invoiceSettings>) => {
    await delay(400);
    mockDataStore.invoiceSettings = {
      ...mockDataStore.invoiceSettings,
      ...data,
      updatedAt: new Date(),
    };
    return mockDataStore.invoiceSettings;
  },
};

// ============================================
// PURCHASE ORDERS API
// ============================================

export const mockPurchaseOrdersApi = {
  getAll: async (filters?: { status?: string; supplierId?: string; query?: string }) => {
    await delay(300);
    let orders = [...mockDataStore.purchaseOrders];

    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters?.supplierId) {
      orders = orders.filter(o => o.supplierId === filters.supplierId);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q)
      );
    }

    return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  },

  getById: async (id: string) => {
    await delay(200);
    const order = mockDataStore.purchaseOrders.find(o => o.id === id);
    if (!order) throw new Error("Purchase order not found");
    return order;
  },

  create: async (data: CreatePurchaseOrderDto) => {
    await delay(500);
    const newOrder: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      orderNumber: `PO-${String(mockDataStore.purchaseOrders.length + 1021).padStart(4, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.purchaseOrders.push(newOrder);
    return newOrder;
  },

  update: async (id: string, data: Partial<PurchaseOrder>) => {
    await delay(400);
    const index = mockDataStore.purchaseOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Purchase order not found");
    mockDataStore.purchaseOrders[index] = { ...mockDataStore.purchaseOrders[index], ...data, updatedAt: new Date() };
    return mockDataStore.purchaseOrders[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.purchaseOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Purchase order not found");
    mockDataStore.purchaseOrders.splice(index, 1);
    return { success: true };
  },
};

// ============================================
// SALES ORDERS API
// ============================================

export const mockSalesOrdersApi = {
  getAll: async (filters?: { status?: string; customerId?: string; query?: string }) => {
    await delay(300);
    let orders = [...mockDataStore.salesOrders];

    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters?.customerId) {
      orders = orders.filter(o => o.customerId === filters.customerId);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }

    return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  },

  getById: async (id: string) => {
    await delay(200);
    const order = mockDataStore.salesOrders.find(o => o.id === id);
    if (!order) throw new Error("Sales order not found");
    return order;
  },

  create: async (data: CreateSalesOrderDto) => {
    await delay(500);
    const newOrder: SalesOrder = {
      ...data,
      id: `so-${Date.now()}`,
      orderNumber: `SO-${String(mockDataStore.salesOrders.length + 1021).padStart(4, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.salesOrders.push(newOrder);
    return newOrder;
  },

  update: async (id: string, data: Partial<SalesOrder>) => {
    await delay(400);
    const index = mockDataStore.salesOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Sales order not found");
    mockDataStore.salesOrders[index] = { ...mockDataStore.salesOrders[index], ...data, updatedAt: new Date() };
    return mockDataStore.salesOrders[index];
  },

  delete: async (id: string) => {
    await delay(300);
    const index = mockDataStore.salesOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Sales order not found");
    mockDataStore.salesOrders.splice(index, 1);
    return { success: true };
  },
};

// ============================================
// JOURNAL ENTRIES API
// ============================================

export const mockJournalEntriesApi = {
  getAll: async (filters?: { status?: string; query?: string }) => {
    await delay(300);
    let entries = [...mockDataStore.journalEntries];

    if (filters?.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      entries = entries.filter(e =>
        e.entryNumber.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.reference.toLowerCase().includes(q)
      );
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  getById: async (id: string) => {
    await delay(200);
    const entry = mockDataStore.journalEntries.find(e => e.id === id);
    if (!entry) throw new Error("Journal entry not found");
    return entry;
  },

  create: async (data: CreateJournalEntryDto) => {
    await delay(500);
    const totalDebits = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredits = data.lines.reduce((sum, l) => sum + l.credit, 0);
    const newEntry: JournalEntry = {
      ...data,
      id: `je-${Date.now()}`,
      entryNumber: `JE-${String(mockDataStore.journalEntries.length + 1009).padStart(4, "0")}`,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDataStore.journalEntries.push(newEntry);
    return newEntry;
  },
};

// ============================================
// USERS API
// ============================================

export const mockUsersApi = {
  getAll: async () => {
    await delay(300);
    return [...mockDataStore.users];
  },

  getById: async (id: string) => {
    await delay(200);
    const user = mockDataStore.users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },
};
