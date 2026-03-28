# FinPal ERP System

A comprehensive ERP system built with Next.js 16 for managing business operations including customers, suppliers, inventory, sales, purchases, and accounting.

## Features

- 📊 **Dashboard** - Real-time financial KPIs and analytics
- 👥 **Customer & Supplier Management** - Complete CRM functionality
- 📦 **Inventory Management** - Product tracking and stock alerts
- 🛒 **Sales Orders** - Create and manage sales orders
- 📥 **Purchase Orders** - Track supplier orders and deliveries
- 🧾 **Invoicing** - Professional invoice generation
- 💳 **Payments** - Track payments received and made
- 📈 **Reporting** - Trial balance, aged receivables/payables
- 🏦 **Accounting** - Chart of accounts and journal entries

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI**: Shadcn/ui, Tailwind CSS v4
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+ and npm
- Supabase account ([Get started](https://supabase.com))

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd erp-finpal-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database connection string (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **Security**: Never commit `.env.local` to version control. It's already in `.gitignore`.

4. **Run database migrations**

First, run the migrations in your Supabase Dashboard SQL Editor, or if you have DATABASE_URL configured:

```bash
npm run migrate
```

The migrations will set up:
- All database tables (customers, suppliers, inventory, sales, purchases, payments, accounting)
- Row Level Security (RLS) policies
- Triggers and functions
- Seed data (optional)

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
erp-finpal-system/
├── app/
│   ├── (auth)/                # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   └── (dashboard)/           # Dashboard pages
│       ├── customers/
│       ├── suppliers/
│       ├── inventory/
│       ├── sales/
│       ├── purchases/
│       ├── invoices/
│       ├── payments/
│       ├── accounting/
│       └── reports/
├── components/
│   ├── ui/                    # Shadcn components
│   └── dashboard/             # Custom components
├── lib/
│   ├── supabase/             # Supabase client & queries
│   │   ├── server.ts         # Server-side client
│   │   ├── client.ts         # Client-side client
│   │   └── queries/          # Database queries
│   ├── types.ts              # Global TypeScript types
│   └── utils.ts              # Utility functions
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed.sql             # Seed data
└── .env.local               # Environment variables (not in git)
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

## Key Features

### Authentication
- Supabase Auth with email/password
- Row Level Security (RLS) for data isolation
- User-specific data access

### Inventory Management
- Product catalog with SKU tracking
- Stock level monitoring
- Reorder point alerts
- Cost and selling price management

### Sales & Purchases
- Create sales and purchase orders
- Auto-generate order numbers (SO-XXXXXX, PO-XXXXXX)
- Line item management
- Tax calculations
- Order status tracking

### Payments
- Record payments received from customers
- Track payments made to suppliers
- Multiple payment methods (Cash, M-Pesa, Bank Transfer, Cheque)
- Payment reconciliation

### Accounting
- Chart of Accounts
- Journal Entries
- Trial Balance
- Financial Reports

## Troubleshooting

### Database Connection Issues

**Can't connect to Supabase**
- Verify credentials in `.env.local`
- Check Supabase project is active
- Ensure database password is correct

**Migration Errors**
- Check if migrations already ran
- Verify DATABASE_URL format
- Run migrations manually in Supabase SQL Editor

### Development Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Type Errors**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Security Best Practices

1. **Never commit API credentials** - They're in `.env.local` which is gitignored
2. **Use environment variables** - All secrets should be in `.env.*` files
3. **Enable RLS** - Row Level Security is enforced on all tables
4. **HTTPS in production** - Always use HTTPS for production deployments
5. **Validate inputs** - All forms use Zod validation

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

Set environment variables on your hosting platform.

## Testing

### Test Scenarios

1. **User Registration & Login**
   - Create new user account
   - Login with credentials
   - Verify authentication

2. **Inventory Management**
   - Add new products
   - Update stock levels
   - Check reorder alerts

3. **Order Processing**
   - Create sales orders
   - Create purchase orders
   - Track order status

4. **Payment Recording**
   - Record customer payments
   - Record supplier payments
   - View payment history

## Support

For issues or questions:
- 📧 Email: support@finpal.co.ke
- 🐛 GitHub Issues: [Report a bug](https://github.com/your-repo/issues)

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for small and medium businesses**
