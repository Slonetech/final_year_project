import {
  Supplier, Customer, Product, PurchaseOrder, SalesOrder, Invoice,
  Payment, Account, JournalEntry, User, CompanySettings, TaxSettings,
  InvoiceSettings, StockMovement
} from "@/lib/types";

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// ============================================
// MOCK USERS
// ============================================

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Kamau",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "user-2",
    name: "Mary Wanjiru",
    email: "mary@example.com",
    role: "accountant",
    status: "active",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "user-3",
    name: "David Omondi",
    email: "david@example.com",
    role: "sales",
    status: "active",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "user-4",
    name: "Grace Njeri",
    email: "grace@example.com",
    role: "procurement",
    status: "active",
    createdAt: new Date("2024-02-15"),
  },
];

// ============================================
// MOCK SUPPLIERS
// ============================================

const supplierNames = [
  "East Africa Suppliers Ltd", "Nairobi Traders Co", "Kenya Wholesale Hub",
  "Mombasa Import Export", "Kisumu Distributors", "Nakuru Ventures Ltd",
  "Eldoret Supply Chain", "Thika Manufacturing Co", "Machakos Enterprises",
  "Nyeri Business Partners"
];

export const mockSuppliers: Supplier[] = supplierNames.map((name, index) => ({
  id: `supplier-${index + 1}`,
  name,
  contactPerson: randomItem(["James Mwangi", "Sarah Akinyi", "Peter Kariuki", "Jane Mutua"]),
  email: name.toLowerCase().replace(/\s+/g, "") + "@gmail.com",
  phone: `+254${randomInt(700000000, 799999999)}`,
  address: `${randomInt(1, 999)} ${randomItem(["Moi", "Kenyatta", "Uhuru", "Kimathi"])} Avenue`,
  city: randomItem(["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]),
  country: "Kenya",
  pin: `A${randomInt(100000000, 999999999)}`,
  paymentTerms: randomItem([7, 14, 30, 60]),
  creditLimit: randomInt(100000, 5000000),
  balance: randomInt(0, 500000),
  status: "active",
  createdAt: randomDate(new Date("2024-01-01"), new Date("2024-06-01")),
  updatedAt: new Date(),
}));

// ============================================
// MOCK CUSTOMERS
// ============================================

const customerNames = [
  "Safaricom PLC", "Equity Bank Kenya", "KCB Group", "Tusker Mattresses Ltd",
  "Java House Group", "Naivas Supermarkets", "Chandaria Industries",
  "Brookside Dairy Ltd", "East African Breweries", "Kenya Airways",
  "Bamburi Cement", "Unga Group Ltd", "Bidco Africa", "Mumias Sugar Co",
  "Kenya Power & Lighting", "Telkom Kenya", "Standard Chartered Bank",
  "Cooperative Bank", "Diamond Trust Bank", "Family Bank"
];

export const mockCustomers: Customer[] = customerNames.map((name, index) => ({
  id: `customer-${index + 1}`,
  name,
  contactPerson: randomItem(["John Doe", "Jane Smith", "Michael Brown", "Emily Davis"]),
  email: name.toLowerCase().replace(/\s+/g, "").replace(/&/g, "") + "@company.co.ke",
  phone: `+254${randomInt(700000000, 799999999)}`,
  address: `${randomInt(1, 999)} ${randomItem(["Moi", "Kenyatta", "Uhuru", "Kimathi"])} Road`,
  city: randomItem(["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]),
  country: "Kenya",
  pin: `A${randomInt(100000000, 999999999)}`,
  paymentTerms: randomItem([14, 30, 45, 60]),
  creditLimit: randomInt(500000, 10000000),
  balance: randomInt(0, 1000000),
  status: "active",
  createdAt: randomDate(new Date("2024-01-01"), new Date("2024-06-01")),
  updatedAt: new Date(),
}));

// ============================================
// MOCK PRODUCTS
// ============================================

const productCategories = ["Electronics", "Office Supplies", "Furniture", "Software", "Services"];
const productData = [
  { name: "Laptop Computer", category: "Electronics", unit: "pcs", cost: 65000, selling: 85000 },
  { name: "Desktop Monitor", category: "Electronics", unit: "pcs", cost: 15000, selling: 22000 },
  { name: "Office Chair", category: "Furniture", unit: "pcs", cost: 8000, selling: 12000 },
  { name: "Desk", category: "Furniture", unit: "pcs", cost: 12000, selling: 18000 },
  { name: "Printer Paper A4", category: "Office Supplies", unit: "ream", cost: 450, selling: 650 },
  { name: "Toner Cartridge", category: "Office Supplies", unit: "pcs", cost: 3500, selling: 5000 },
  { name: "Microsoft Office 365", category: "Software", unit: "license", cost: 8000, selling: 12000 },
  { name: "Antivirus Software", category: "Software", unit: "license", cost: 2500, selling: 4000 },
  { name: "IT Support Service", category: "Services", unit: "hour", cost: 1500, selling: 3000 },
  { name: "Consulting Service", category: "Services", unit: "hour", cost: 2500, selling: 5000 },
];

export const mockProducts: Product[] = productData.map((product, index) => ({
  id: `product-${index + 1}`,
  name: product.name,
  sku: `SKU-${String(index + 1).padStart(4, "0")}`,
  description: `High quality ${product.name.toLowerCase()}`,
  category: product.category,
  unit: product.unit,
  costPrice: product.cost,
  sellingPrice: product.selling,
  stockLevel: randomInt(10, 500),
  reorderPoint: randomInt(5, 20),
  reorderQuantity: randomInt(20, 100),
  status: "active",
  createdAt: randomDate(new Date("2024-01-01"), new Date("2024-03-01")),
  updatedAt: new Date(),
}));

// ============================================
// MOCK CHART OF ACCOUNTS
// ============================================

export const mockAccounts: Account[] = [
  // Assets
  { id: "acc-1", code: "1000", name: "Assets", type: "asset", category: "current_asset", balance: 0, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-2", code: "1010", name: "Cash", type: "asset", category: "current_asset", parentId: "acc-1", balance: 2500000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-3", code: "1020", name: "Bank Account", type: "asset", category: "current_asset", parentId: "acc-1", balance: 8500000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-4", code: "1030", name: "Accounts Receivable", type: "asset", category: "current_asset", parentId: "acc-1", balance: 3500000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-5", code: "1040", name: "Inventory", type: "asset", category: "current_asset", parentId: "acc-1", balance: 5000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-6", code: "1500", name: "Fixed Assets", type: "asset", category: "fixed_asset", parentId: "acc-1", balance: 10000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },

  // Liabilities
  { id: "acc-10", code: "2000", name: "Liabilities", type: "liability", category: "current_liability", balance: 0, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-11", code: "2010", name: "Accounts Payable", type: "liability", category: "current_liability", parentId: "acc-10", balance: 2000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-12", code: "2020", name: "VAT Payable", type: "liability", category: "current_liability", parentId: "acc-10", balance: 450000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-13", code: "2030", name: "Withholding Tax Payable", type: "liability", category: "current_liability", parentId: "acc-10", balance: 125000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-14", code: "2500", name: "Long Term Loan", type: "liability", category: "long_term_liability", parentId: "acc-10", balance: 5000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },

  // Equity
  { id: "acc-20", code: "3000", name: "Equity", type: "equity", category: "equity", balance: 20000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-21", code: "3010", name: "Owner's Capital", type: "equity", category: "equity", parentId: "acc-20", balance: 15000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-22", code: "3020", name: "Retained Earnings", type: "equity", category: "equity", parentId: "acc-20", balance: 5000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },

  // Revenue
  { id: "acc-30", code: "4000", name: "Revenue", type: "revenue", category: "operating_revenue", balance: 0, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-31", code: "4010", name: "Sales Revenue", type: "revenue", category: "operating_revenue", parentId: "acc-30", balance: 25000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-32", code: "4020", name: "Service Revenue", type: "revenue", category: "operating_revenue", parentId: "acc-30", balance: 5000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-33", code: "4500", name: "Other Income", type: "revenue", category: "other_revenue", parentId: "acc-30", balance: 500000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },

  // Expenses
  { id: "acc-40", code: "5000", name: "Cost of Goods Sold", type: "expense", category: "cost_of_goods_sold", balance: 15000000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-41", code: "6000", name: "Operating Expenses", type: "expense", category: "operating_expense", balance: 0, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-42", code: "6010", name: "Salaries and Wages", type: "expense", category: "operating_expense", parentId: "acc-41", balance: 3500000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-43", code: "6020", name: "Rent Expense", type: "expense", category: "operating_expense", parentId: "acc-41", balance: 600000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-44", code: "6030", name: "Utilities", type: "expense", category: "operating_expense", parentId: "acc-41", balance: 250000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-45", code: "6040", name: "Office Supplies", type: "expense", category: "operating_expense", parentId: "acc-41", balance: 180000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
  { id: "acc-46", code: "6050", name: "Marketing and Advertising", type: "expense", category: "operating_expense", parentId: "acc-41", balance: 450000, status: "active", createdAt: new Date("2024-01-01"), updatedAt: new Date() },
];

// ============================================
// MOCK SETTINGS
// ============================================

export const mockCompanySettings: CompanySettings = {
  id: "company-1",
  name: "FinPal Systems Ltd",
  email: "info@finpalsystems.co.ke",
  phone: "+254 712 345 678",
  address: "Westlands Square, 5th Floor",
  city: "Nairobi",
  country: "Kenya",
  pin: "A012345678Z",
  paybillNumber: "123456",
  tillNumber: "987654",
  website: "www.finpalsystems.co.ke",
  updatedAt: new Date(),
};

export const mockTaxSettings: TaxSettings = {
  id: "tax-1",
  vatRate: 16,
  withholdingTaxRates: {
    professionalFees: 5,
    supplies: 3,
    rent: 10,
    commissions: 2,
  },
  updatedAt: new Date(),
};

export const mockInvoiceSettings: InvoiceSettings = {
  id: "invoice-1",
  invoicePrefix: "INV",
  nextInvoiceNumber: 1001,
  paymentTerms: "Payment due within 30 days",
  termsAndConditions: "All sales are final. Late payments will incur a 2% monthly interest charge.",
  footerText: "Thank you for your business!",
  updatedAt: new Date(),
};

// ============================================
// MOCK INVOICES
// ============================================

export const mockInvoices: Invoice[] = Array.from({ length: 50 }, (_, index) => {
  const customer = randomItem(mockCustomers);
  const invoiceDate = randomDate(new Date("2024-01-01"), new Date("2024-10-31"));
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + customer.paymentTerms);

  const lines = Array.from({ length: randomInt(1, 5) }, (_, i) => {
    const product = randomItem(mockProducts);
    const quantity = randomInt(1, 20);
    const unitPrice = product.sellingPrice;
    const total = quantity * unitPrice;

    return {
      id: `line-${index}-${i}`,
      productId: product.id,
      description: product.name,
      quantity,
      unitPrice,
      total,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const vatAmount = subtotal * 0.16;
  const total = subtotal + vatAmount;

  const statuses: Invoice["status"][] = ["draft", "sent", "paid", "overdue"];
  const status = index < 5 ? "overdue" : index < 15 ? "sent" : index < 35 ? "paid" : "draft";

  const amountPaid = status === "paid" ? total : status === "overdue" ? randomInt(0, total * 0.5) : 0;

  return {
    id: `invoice-${index + 1}`,
    invoiceNumber: `INV-${String(index + 1001).padStart(4, "0")}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerAddress: `${customer.address}, ${customer.city}`,
    invoiceDate,
    dueDate,
    status,
    lines,
    subtotal,
    vatAmount,
    vatRate: 16,
    total,
    amountPaid,
    amountDue: total - amountPaid,
    notes: "Thank you for your business",
    createdBy: randomItem(mockUsers).id,
    createdAt: invoiceDate,
    updatedAt: new Date(),
  };
});

// ============================================
// MOCK PAYMENTS
// ============================================

export const mockPayments: Payment[] = Array.from({ length: 30 }, (_, index) => {
  const type: Payment["type"] = index % 3 === 0 ? "made" : "received";
  const customer = type === "received" ? randomItem(mockCustomers) : undefined;
  const supplier = type === "made" ? randomItem(mockSuppliers) : undefined;
  const method = randomItem<Payment["method"]>(["cash", "mpesa", "bank_transfer", "cheque"]);

  return {
    id: `payment-${index + 1}`,
    paymentNumber: `PAY-${String(index + 1001).padStart(4, "0")}`,
    type,
    date: randomDate(new Date("2024-01-01"), new Date("2024-10-31")),
    amount: randomInt(10000, 500000),
    method,
    reference: method === "mpesa" ? `Q${randomInt(100000000, 999999999)}` : `REF-${randomInt(1000, 9999)}`,
    customerId: customer?.id,
    customerName: customer?.name,
    supplierId: supplier?.id,
    supplierName: supplier?.name,
    notes: `Payment via ${method}`,
    createdBy: randomItem(mockUsers).id,
    createdAt: randomDate(new Date("2024-01-01"), new Date()),
  };
});

// ============================================
// EXPORT MOCK DATA STORE
// ============================================

export const mockDataStore = {
  users: mockUsers,
  suppliers: mockSuppliers,
  customers: mockCustomers,
  products: mockProducts,
  accounts: mockAccounts,
  invoices: mockInvoices,
  payments: mockPayments,
  companySettings: mockCompanySettings,
  taxSettings: mockTaxSettings,
  invoiceSettings: mockInvoiceSettings,
  purchaseOrders: [] as PurchaseOrder[],
  salesOrders: [] as SalesOrder[],
  journalEntries: [] as JournalEntry[],
  stockMovements: [] as StockMovement[],
};
