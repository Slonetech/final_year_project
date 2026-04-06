// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = "admin" | "accountant" | "sales" | "procurement";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: "active" | "inactive";
  createdAt: Date;
}

// ============================================
// SUPPLIER TYPES
// ============================================

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  pin?: string; // Kenya PIN number
  paymentTerms: number; // days
  creditLimit: number;
  balance: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSupplierDto = Omit<Supplier, "id" | "balance" | "createdAt" | "updatedAt">;
export type UpdateSupplierDto = Partial<CreateSupplierDto>;

// ============================================
// CUSTOMER TYPES
// ============================================

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  pin?: string; // Kenya PIN number
  paymentTerms: number; // days
  creditLimit: number;
  balance: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCustomerDto = Omit<Customer, "id" | "balance" | "createdAt" | "updatedAt">;
export type UpdateCustomerDto = Partial<CreateCustomerDto>;

// ============================================
// PRODUCT & INVENTORY TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unit: string; // e.g., "pcs", "kg", "liters"
  costPrice: number;
  sellingPrice: number;
  stockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reference: string; // PO number, SO number, or adjustment reference
  date: Date;
  notes?: string;
}

export type CreateProductDto = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProductDto = Partial<CreateProductDto>;

// ============================================
// PURCHASE ORDER TYPES
// ============================================

export type PurchaseOrderStatus = "pending" | "approved" | "received" | "completed";

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDate: Date;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePurchaseOrderDto = Omit<PurchaseOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">;

// ============================================
// SALES ORDER TYPES
// ============================================

export type SalesOrderStatus = "quote" | "order" | "delivered" | "paid";

export interface SalesOrderLine {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: SalesOrderStatus;
  lines: SalesOrderLine[];
  subtotal: number;
  taxAmount: number;
  taxRate: number; // 16% for Kenya VAT
  total: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSalesOrderDto = Omit<SalesOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">;

// ============================================
// INVOICE TYPES
// ============================================

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceLine {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  withholdingTax?: number;
  withholdingTaxRate?: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  termsAndConditions?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateInvoiceDto = Omit<Invoice, "id" | "invoiceNumber" | "amountPaid" | "amountDue" | "createdAt" | "updatedAt">;

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = "cash" | "mpesa" | "bank_transfer" | "cheque";
export type PaymentType = "received" | "made";

export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType;
  date: Date;
  amount: number;
  method: PaymentMethod;
  reference: string; // M-Pesa code, cheque number, bank reference
  customerId?: string; // for payments received
  customerName?: string;
  supplierId?: string; // for payments made
  supplierName?: string;
  invoiceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface MpesaPayment {
  transactionCode: string;
  phoneNumber: string;
  amount: number;
  paybillNumber: string;
  accountReference: string;
  transactionDate: Date;
}

export type CreatePaymentDto = Omit<Payment, "id" | "paymentNumber" | "createdAt">;


// ============================================
// CHART OF ACCOUNTS TYPES
// ============================================

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountCategory =
  | "current_asset"
  | "fixed_asset"
  | "current_liability"
  | "long_term_liability"
  | "equity"
  | "operating_revenue"
  | "other_revenue"
  | "cost_of_goods_sold"
  | "operating_expense"
  | "other_expense";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  description?: string;
  balance: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAccountDto = Omit<Account, "id" | "balance" | "createdAt" | "updatedAt">;

// ============================================
// JOURNAL ENTRY TYPES
// ============================================

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  status: "draft" | "posted";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateJournalEntryDto = Omit<JournalEntry, "id" | "entryNumber" | "totalDebits" | "totalCredits" | "isBalanced" | "createdAt" | "updatedAt">;

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string;
  date: Date;
  type: "sale" | "purchase" | "payment" | "receipt" | "journal";
  reference: string;
  description: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

// ============================================
// REPORTS TYPES
// ============================================

export interface BalanceSheetData {
  asOfDate: Date;
  assets: {
    currentAssets: AccountBalance[];
    fixedAssets: AccountBalance[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: AccountBalance[];
    longTermLiabilities: AccountBalance[];
    totalLiabilities: number;
  };
  equity: {
    equityAccounts: AccountBalance[];
    totalEquity: number;
  };
}

export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface ProfitLossData {
  startDate: Date;
  endDate: Date;
  revenue: {
    items: AccountBalance[];
    total: number;
  };
  costOfGoodsSold: {
    items: AccountBalance[];
    total: number;
  };
  grossProfit: number;
  operatingExpenses: {
    items: AccountBalance[];
    total: number;
  };
  otherIncome: number;
  otherExpenses: number;
  netProfit: number;
}

export interface CashFlowData {
  startDate: Date;
  endDate: Date;
  operatingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  investingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  financingActivities: {
    items: { description: string; amount: number }[];
    total: number;
  };
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

export interface TrialBalanceData {
  asOfDate: Date;
  accounts: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export interface AgedReceivablesData {
  customerId: string;
  customerName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

export interface AgedPayablesData {
  supplierId: string;
  supplierName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface CompanySettings {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  pin: string; // Tax identification number
  paybillNumber?: string; // M-Pesa paybill
  tillNumber?: string; // M-Pesa till
  website?: string;
  updatedAt: Date;
}

export interface TaxSettings {
  id: string;
  vatRate: number; // Kenya standard 16%
  withholdingTaxRates: {
    professionalFees: number; // 5%
    supplies: number; // 3%
    rent: number; // 10%
    commissions: number; // 2%
  };
  updatedAt: Date;
}

export interface InvoiceSettings {
  id: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  paymentTerms: string;
  termsAndConditions: string;
  footerText?: string;
  updatedAt: Date;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
  revenueChange: number; // percentage
  expensesChange: number;
  profitChange: number;
  cashChange: number;
}

export interface RecentTransaction {
  id: string;
  date: Date;
  type: string;
  reference: string;
  description: string;
  amount: number;
  status?: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  revenue: number;
  invoiceCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesChartData {
  month: string;
  sales: number;
  expenses: number;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
}

// ============================================
// FILTER TYPES
// ============================================

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchFilter {
  query?: string;
}
