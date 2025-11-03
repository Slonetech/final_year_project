import {
  Supplier, Customer, Product, Invoice, Payment, Account, User,
  CreateSupplierDto, UpdateSupplierDto, CreateCustomerDto, UpdateCustomerDto,
  CreateProductDto, UpdateProductDto, CreateInvoiceDto, CreatePaymentDto,
  CreateAccountDto, DashboardKPIs, RecentTransaction, TopCustomer, TopProduct,
  SalesChartData, LowStockAlert, BalanceSheetData, ProfitLossData,
  TrialBalanceData, AgedReceivablesData, AgedPayablesData,
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