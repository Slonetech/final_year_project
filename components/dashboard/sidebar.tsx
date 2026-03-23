"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  ShoppingBag,
  FileText,
  CreditCard,
  Package,
  BookOpen,
  PenSquare,
  BarChart3,
  Settings,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Business Partners",
    icon: Users,
    children: [
      { name: "Suppliers", href: "/suppliers" },
      { name: "Customers", href: "/customers" },
    ],
  },
  { name: "Inventory", href: "/inventory", icon: Package },
  {
    name: "Transactions",
    icon: ShoppingBag,
    children: [
      { name: "Purchases", href: "/purchases" },
      { name: "Sales", href: "/sales" },
    ],
  },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  {
    name: "Accounting",
    icon: BookOpen,
    children: [
      { name: "Chart of Accounts", href: "/accounting/chart-of-accounts" },
      { name: "Journal Entries", href: "/accounting/journal-entries" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Balance Sheet", href: "/reports/balance-sheet" },
      { name: "Profit & Loss", href: "/reports/profit-loss" },
      { name: "Cash Flow", href: "/reports/cash-flow" },
      { name: "Trial Balance", href: "/reports/trial-balance" },
      { name: "Aged Receivables", href: "/reports/aged-receivables" },
      { name: "Aged Payables", href: "/reports/aged-payables" },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Business Partners", "Transactions", "Accounting", "Reports"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Building2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-bold text-lg">FinPal ERP</h1>
          <p className="text-xs text-muted-foreground">Financial System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openGroups.includes(item.name);
              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent"
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </span>
                    <span className={cn("transition-transform", isOpen && "rotate-90")}>
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-md hover:bg-accent",
                              pathname === child.href && "bg-accent font-medium"
                            )}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent",
                    pathname === item.href && "bg-accent font-medium"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-background border-r flex-col fixed left-0 top-0 bottom-0">
        {sidebarContent}
      </aside>
    </>
  );
}
