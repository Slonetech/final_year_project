# FinPal ERP System: A Comprehensive System Architecture and Implementation Report

## Abstract
Enterprise Resource Planning (ERP) systems represent a critical technological infrastructure for automating and integrating core business processes. This project presents the design, development, and implementation of the FinPal ERP System, an integrated web-based solution intended to address the operational inefficiencies faced by small to medium enterprises (SMEs) in managing financial, supply chain, and customer relationship operations. The solution replaces fragmented legacy workflows with a unified platform offering real-time financial tracking, inventory management, and automated invoicing. The system is engineered using a modern JavaScript/TypeScript stack, utilizing Next.js (App Router) on the frontend and Supabase (PostgreSQL) on the backend, ensuring a highly responsive, scalable, and secure application architecture.

## Introduction
In the contemporary business landscape, organizations struggle with data silos, delayed financial reporting, and complex supply chain tracking (Author, Year). The FinPal ERP system is scoped to resolve these organizational challenges by providing a consolidated environment that covers the entire operational lifecycle—from procurement and inventory management to sales, payments, and double-entry accounting. 

The primary objectives of the system are:
* **Centralization:** To create a single source of truth for customer, supplier, and inventory data.
* **Automation:** To automate the transition of data between modules (e.g., automatically generating journal entries from sales orders).
* **Real-time Analytics:** To provide immediate access to financial dashboards, trial balances, and aged receivables/payables.
* **Security:** To enforce strict data isolation and role-based access control.

## System Architecture
The FinPal ERP system employs a modern **Client-Server Architecture** utilizing a decoupled frontend and a Backend-as-a-Service (BaaS) provider. 

* **Frontend (Client):** Built with **Next.js 16 (App Router)** and **React 19**, the client application employs Server Components and Client Components to optimize rendering performance and interactivity. It utilizes **Tailwind CSS** and **Shadcn UI** for a responsive, accessible User Interface (UI), and integrates **TanStack React Query** for asynchronous state management.
* **Backend:** Powered by **Supabase**, leveraging a managed **PostgreSQL** relational database. Supabase provides RESTful and GraphQL API endpoints automatically generated from the database schema schema.
* **Interaction Flow:** The frontend communicates with the backend via the Supabase Client SDK. Data mutations (e.g., creating a purchase order) are handled through Next.js Server Actions, which securely ingest data, validate it using **Zod**, and execute SQL queries against the PostgreSQL database. Real-time updates and Row Level Security (RLS) policies are enforced natively at the database layer before responses are returned to the client.

## Core Functional Modules

### 1. User Authentication and Authorization
* **The Logic:** The system verifies user identities against stored credentials before granting access to the system. Upon successful authentication, a session token is issued.
* **Technical Implementation:** Handled via **Supabase Auth** which utilizes JSON Web Tokens (JWT) (Author, Year). Sessions are managed securely via HTTP-only cookies in Next.js middleware, effectively protecting all dashboard routes.
* **Practical Example:** When an employee attempts to log in, the Next.js middleware intercepts the request. The credentials are exchanged with Supabase for a JWT. If validated, the user is redirected to the central dashboard; otherwise, they are denied access and shown an error.

### 2. Inventory and Procurement Management
* **The Logic:** Tracks the lifecycle of physical assets from supplier ordering to stock receipt. Adding inventory increases stock counts, while sales decrease them. Minimum stock thresholds trigger automated reorder alerts.
* **Technical Implementation:** Utilizes relational tables for `products` and `purchases`. The frontend employs **React Hook Form** for complex order data entry, and Next.js Server Actions perform transactional database insertions to maintain atomic operations (e.g., inserting a purchase order header alongside multiple line items).
* **Practical Example:** When a Procurement Officer creates a Purchase Order for 50 laptops, the system inserts the order record (`status: 'pending'`). Once the goods are marked as `received` in the UI, a background database trigger updates the available `stockLevel` of laptops by +50.

### 3. Sales and Invoicing
* **The Logic:** Manages the conversion of goods to revenue. The module captures customer details, logs sales line items, calculates localized taxes (e.g., VAT), and generates trackable invoices.
* **Technical Implementation:** Client-side calculations ensure instantaneous total updates as users add line items. Submission triggers a Server Action that securely records the invoice and its status (`draft` or `sent`) into the PostgreSQL database.
* **Practical Example:** When a Sales Agent finalizes a sale, the system calculates a 16% tax rate over the subtotal and deducts the sold items from the inventory table. It generates a unique sequential invoice number (e.g., `INV-00100`) and logs an associated Double-Entry Journal line to credit "Sales" and debit "Accounts Receivable".

### 4. Financial Tracking & Reporting
* **The Logic:** Aggregates granular transactional data into comprehensive financial statements. It calculates gross profit, tracks unpaid invoices, and summarizes the Chart of Accounts to ensure debits strictly equal credits.
* **Technical Implementation:** Employs complex SQL aggregations executed server-side via Supabase. Data is mapped to TypeScript interfaces (`BalanceSheetData`, `ProfitLossData`) ensuring type safety. The UI visualizes this data dynamically without requiring third-party reporting software.
* **Practical Example:** When Management selects the "Profit & Loss" report, a server function aggregates all `invoices` within the specified date range to calculate Revenue, subtracts aggregated `purchases` for Cost of Goods Sold (COGS), and deducts Chart of Account expenses to output an accurate Net Profit figure.

## Database Design
The foundation of the ERP is a highly normalized **PostgreSQL** relational database. Strict referential integrity is maintained via Foreign Keys (FKs).
* **Relational Structure:** The `invoices` table links to a `customers` table via `customer_id`. Each invoice has multiple `invoice_lines`, linked via `invoice_id`. 
* **Data Integrity:** PostgreSQL Check Constraints (e.g., ensuring order statuses strictly conform to `pending`, `approved`, `received`, `completed`) and `NOT NULL` constraints proactively block corrupted or invalid data entry at the database level.
* **ACID Compliance:** Financial transactions, such as transferring funds or logging multi-line journal entries, are executed within database transactions to guarantee Atomicity, Consistency, Isolation, and Durability (Author, Year).

## Security & Standards
* **Row Level Security (RLS):** Supabase RLS policies are applied directly to database tables. This enforces multi-tenancy rules ensuring users can only read, update, or delete data belonging to their respective organizational roles or scopes.
* **Input Validation:** The application heavily utilizes **Zod** schema validation on both the client (preventing invalid UI submissions) and the server (guarding against malicious API requests).
* **Environmental Security:** Industry-standard practices are followed with the strict separation of credentials. Sensitive tokens (e.g., `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are managed strictly via `.env` files and omitted from version control.

## Conclusion
The FinPal ERP system successfully digitizes and unifies disparate business workflows into a cohesive, high-performance web application. By leveraging Next.js and Supabase, the architecture achieves a highly robust, scalable, and secure environment capable of supporting standard enterprise lifecycles—from initial user login down to the exportation of Trial Balance reports. Future enhancements could include the integration of predictive analytics for inventory forecasting and machine learning algorithms to autonomously identify anomalous journal entries.
