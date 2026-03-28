import * as XLSX from "xlsx";
import { BalanceSheetData, ProfitLossData, CashFlowData, TrialBalanceData, AgedReceivablesData, AgedPayablesData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function exportBalanceSheetToExcel(data: BalanceSheetData, asOfDate: Date, filename: string) {
  const wb = XLSX.utils.book_new();

  // Create worksheet data
  const wsData: any[][] = [
    ["Balance Sheet"],
    [`As of ${asOfDate.toLocaleDateString()}`],
    [],
    ["ASSETS"],
    ["Current Assets"],
  ];

  // Add current assets
  data.assets.currentAssets.forEach(account => {
    wsData.push([`  ${account.accountName}`, account.balance]);
  });

  wsData.push(["Fixed Assets"]);
  data.assets.fixedAssets.forEach(account => {
    wsData.push([`  ${account.accountName}`, account.balance]);
  });

  wsData.push(["Total Assets", data.assets.totalAssets]);
  wsData.push([]);

  // Liabilities
  wsData.push(["LIABILITIES"]);
  wsData.push(["Current Liabilities"]);
  data.liabilities.currentLiabilities.forEach(account => {
    wsData.push([`  ${account.accountName}`, account.balance]);
  });

  wsData.push(["Long-Term Liabilities"]);
  data.liabilities.longTermLiabilities.forEach(account => {
    wsData.push([`  ${account.accountName}`, account.balance]);
  });

  wsData.push(["Total Liabilities", data.liabilities.totalLiabilities]);
  wsData.push([]);

  // Equity
  wsData.push(["EQUITY"]);
  data.equity.equityAccounts.forEach(account => {
    wsData.push([`  ${account.accountName}`, account.balance]);
  });

  wsData.push(["Total Equity", data.equity.totalEquity]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [{ wch: 40 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
  XLSX.writeFile(wb, filename);
}

export function exportProfitLossToExcel(data: ProfitLossData, startDate: Date, endDate: Date, filename: string) {
  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["Profit & Loss Statement"],
    [`${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`],
    [],
    ["REVENUE"],
  ];

  data.revenue.items.forEach(item => {
    wsData.push([`  ${item.accountName}`, item.balance]);
  });
  wsData.push(["Total Revenue", data.revenue.total]);
  wsData.push([]);

  wsData.push(["COST OF GOODS SOLD"]);
  data.costOfGoodsSold.items.forEach(item => {
    wsData.push([`  ${item.accountName}`, item.balance]);
  });
  wsData.push(["Total COGS", data.costOfGoodsSold.total]);
  wsData.push([]);

  wsData.push(["GROSS PROFIT", data.grossProfit]);
  wsData.push([]);

  wsData.push(["OPERATING EXPENSES"]);
  data.operatingExpenses.items.forEach(item => {
    wsData.push([`  ${item.accountName}`, item.balance]);
  });
  wsData.push(["Total Operating Expenses", data.operatingExpenses.total]);
  wsData.push([]);

  if (data.otherIncome > 0) {
    wsData.push(["Other Income", data.otherIncome]);
  }
  if (data.otherExpenses > 0) {
    wsData.push(["Other Expenses", -data.otherExpenses]);
  }
  wsData.push([]);

  wsData.push(["NET PROFIT", data.netProfit]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 40 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
  XLSX.writeFile(wb, filename);
}

export function exportCashFlowToExcel(data: CashFlowData, startDate: Date, endDate: Date, filename: string) {
  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["Cash Flow Statement"],
    [`${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`],
    [],
    ["OPERATING ACTIVITIES"],
  ];

  data.operatingActivities.items.forEach(item => {
    wsData.push([`  ${item.description}`, item.amount]);
  });
  wsData.push(["Net Cash from Operations", data.operatingActivities.total]);
  wsData.push([]);

  wsData.push(["INVESTING ACTIVITIES"]);
  data.investingActivities.items.forEach(item => {
    wsData.push([`  ${item.description}`, item.amount]);
  });
  wsData.push(["Net Cash from Investing", data.investingActivities.total]);
  wsData.push([]);

  wsData.push(["FINANCING ACTIVITIES"]);
  data.financingActivities.items.forEach(item => {
    wsData.push([`  ${item.description}`, item.amount]);
  });
  wsData.push(["Net Cash from Financing", data.financingActivities.total]);
  wsData.push([]);

  wsData.push(["NET CHANGE IN CASH", data.netCashChange]);
  wsData.push(["Beginning Cash Balance", data.beginningCash]);
  wsData.push(["Ending Cash Balance", data.endingCash]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 40 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Cash Flow");
  XLSX.writeFile(wb, filename);
}

export function exportTrialBalanceToExcel(data: TrialBalanceData, asOfDate: Date, filename: string) {
  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["Trial Balance"],
    [`As of ${asOfDate.toLocaleDateString()}`],
    [],
    ["Account Code", "Account Name", "Debit", "Credit"],
  ];

  data.accounts.forEach(account => {
    wsData.push([
      account.code,
      account.name,
      account.debit,
      account.credit,
    ]);
  });

  wsData.push([]);
  wsData.push(["TOTALS", "", data.totalDebit, data.totalCredit]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, "Trial Balance");
  XLSX.writeFile(wb, filename);
}

export function exportAgedReceivablesToExcel(data: AgedReceivablesData[], filename: string) {
  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["Aged Receivables Report"],
    [`As of ${new Date().toLocaleDateString()}`],
    [],
    ["Customer", "Current", "1-30 Days", "31-60 Days", "61-90 Days", "Over 90 Days", "Total"],
  ];

  data.forEach(item => {
    wsData.push([
      item.customerName,
      item.current,
      item.days30,
      item.days60,
      item.days90,
      item.over90,
      item.total,
    ]);
  });

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      current: acc.current + item.current,
      days30: acc.days30 + item.days30,
      days60: acc.days60 + item.days60,
      days90: acc.days90 + item.days90,
      over90: acc.over90 + item.over90,
      total: acc.total + item.total,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 }
  );

  wsData.push([]);
  wsData.push([
    "TOTALS",
    totals.current,
    totals.days30,
    totals.days60,
    totals.days90,
    totals.over90,
    totals.total,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(wb, ws, "Aged Receivables");
  XLSX.writeFile(wb, filename);
}

export function exportAgedPayablesToExcel(data: AgedPayablesData[], filename: string) {
  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["Aged Payables Report"],
    [`As of ${new Date().toLocaleDateString()}`],
    [],
    ["Supplier", "Current", "1-30 Days", "31-60 Days", "61-90 Days", "Over 90 Days", "Total"],
  ];

  data.forEach(item => {
    wsData.push([
      item.supplierName,
      item.current,
      item.days30,
      item.days60,
      item.days90,
      item.over90,
      item.total,
    ]);
  });

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      current: acc.current + item.current,
      days30: acc.days30 + item.days30,
      days60: acc.days60 + item.days60,
      days90: acc.days90 + item.days90,
      over90: acc.over90 + item.over90,
      total: acc.total + item.total,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 }
  );

  wsData.push([]);
  wsData.push([
    "TOTALS",
    totals.current,
    totals.days30,
    totals.days60,
    totals.days90,
    totals.over90,
    totals.total,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(wb, ws, "Aged Payables");
  XLSX.writeFile(wb, filename);
}
