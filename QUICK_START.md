# Quick Start Guide

## 🔧 **IMPORTANT: Fix Inventory & Sales Issues First**

If you're experiencing issues with adding products or accessing inventory/sales routes, you need to apply a database migration:

### Apply Database Migration (Choose One Method)

#### Option A: Supabase Dashboard (Recommended - 2 minutes)
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ymftcsdkvtmnbhrmmaho/editor)
2. Copy the entire content from `supabase/migrations/003_fix_inventory_and_sales_schema.sql`
3. Paste into SQL Editor and click "Run"
4. Restart your dev server: `npm run dev`

#### Option B: Using Script
```bash
# Install tsx if needed
npm install -D tsx

# Run migration script
npx tsx scripts/apply-migration.ts
```

**What this fixes:**
- ✅ Database column names to match TypeScript types
- ✅ Missing sales order fields (order_number, delivery_date, tax fields)
- ✅ Auto-generation of sales order numbers
- ✅ Proper user_id tracking for Row Level Security

---

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment is Already Configured
Your `.env.local` file is set up with:
- ✅ Supabase credentials
- ⏳ PayHero credentials (add when ready)

### 3. Set Up Database

#### Option A: Use Supabase Dashboard
1. Go to https://app.supabase.com/project/ymftcsdkvtmnbhrmmaho
2. Click "SQL Editor"
3. Copy the SQL from `DATABASE.md` (tables section)
4. Click "Run"

#### Option B: Run Seed Script
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Test the Application

#### Create Account
1. Go to http://localhost:3000/signup
2. Create a new account
3. Check email for confirmation (if enabled)

#### Test Features
- ✅ Dashboard
- ✅ Customers
- ✅ Suppliers
- ✅ Products
- ✅ Invoices
- ✅ Payments (needs PayHero credentials)
- ✅ Reports

## 📋 Pre-Production Checklist

Before deploying to production:

- [ ] Complete Supabase setup
  - [ ] Database tables created
  - [ ] Row Level Security enabled
  - [ ] Data seeded
- [ ] Get PayHero credentials
  - [ ] Sign up at https://payhero.co.ke
  - [ ] Get API credentials
  - [ ] Add to `.env.local`
  - [ ] Configure webhook URL
- [ ] Review documentation
  - [ ] Read [DEPLOYMENT.md](./DEPLOYMENT.md)
  - [ ] Review [SECURITY.md](./SECURITY.md)
  - [ ] Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- [ ] Choose deployment method
  - [ ] Vercel (easiest)
  - [ ] Docker (recommended for self-hosting)
  - [ ] VPS (full control)

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Docker
docker-compose up -d              # Start containers
docker-compose logs -f            # View logs
docker-compose down               # Stop containers
curl localhost:3000/api/health    # Check health

# Database
npm run seed         # Seed database
```

## 🏥 Health Checks

```bash
# Health endpoint
curl http://localhost:3000/api/health

# Metrics endpoint
curl http://localhost:3000/api/metrics
```

## 📚 Documentation

- [README.md](./README.md) - Overview and features
- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy
- [SECURITY.md](./SECURITY.md) - Security guide
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance tips
- [DATABASE.md](./DATABASE.md) - Database schema
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Deploy checklist
- [SUMMARY.md](./SUMMARY.md) - What was done

## 🆘 Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
```bash
# Make sure .env.local exists
ls -la .env.local

# Restart dev server
# Ctrl+C, then npm run dev
```

### Database Connection Issues
- Check Supabase URL in `.env.local`
- Verify API keys are correct
- Check network connectivity

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 🎯 Next Steps

1. **Set up database** (see step 3 above)
2. **Test locally** (run through all features)
3. **Get PayHero credentials** (when ready to accept payments)
4. **Deploy** (follow [DEPLOYMENT.md](./DEPLOYMENT.md))

## 💡 Tips

- Keep `.env.local` updated but never commit it
- Test payment flows with small amounts first (KES 10)
- Monitor `/api/health` endpoint in production
- Set up error tracking (Sentry recommended)
- Enable Vercel Analytics if using Vercel

## ✨ Production-Ready Features

Your app includes:
- 🔐 Authentication & authorization
- 🛡️ Rate limiting
- ✅ Input validation
- 🔑 Webhook verification
- ❤️ Health checks
- 📊 Metrics
- 🚨 Error boundaries
- 📝 Structured logging
- 🐳 Docker support
- 🔄 CI/CD pipeline

**You're ready to go! 🎉**

---

Need help? Check the full docs or open an issue.
