# FinPal ERP System

A comprehensive ERP system built with Next.js 16, featuring integrated PayHero payment gateway support for seamless M-Pesa and card payments.

## Features

- 📊 **Dashboard** - Real-time financial KPIs and analytics
- 👥 **Customer & Supplier Management** - Complete CRM functionality
- 📦 **Inventory Management** - Product tracking and stock alerts
- 🧾 **Invoicing** - Professional invoice generation
- 💳 **Payments** - PayHero integration for M-Pesa and card payments
- 📈 **Reporting** - Trial balance, aged receivables/payables
- 🏦 **Accounting** - Chart of accounts and journal entries

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS v4
- **State Management**: TanStack React Query
- **Payment Gateway**: PayHero API
- **Forms**: React Hook Form + Zod validation

## Prerequisites

- Node.js 18+ and npm
- PayHero account with API credentials ([Get started](https://payhero.co.ke))

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
# PayHero API Credentials
PAYHERO_API_USERNAME=your_api_username
PAYHERO_API_PASSWORD=your_api_password
PAYHERO_ACCOUNT_ID=your_account_id
PAYHERO_BASE_URL=https://api.payhero.co.ke

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Security**: Never commit `.env.local` to version control. It's already in `.gitignore`.

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## PayHero Integration

### Setup Instructions

1. **Get API Credentials**
   - Log in to your [PayHero Dashboard](https://dashboard.payhero.co.ke)
   - Navigate to **Settings > API Keys**
   - Copy your API Username, Password, and Account ID
   - Add them to `.env.local` as shown above

2. **Configure Webhook** (for payment status updates)
   - In PayHero Dashboard, go to **Settings > Webhooks**
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Select events: `payment.success`, `payment.failed`, `payment.cancelled`
   - Save configuration

3. **Test Payment Flow**
   - Navigate to **Payments** page
   - Click **"PayHero Payment"** button
   - Select customer and enter amount
   - Enter phone number (format: `0712345678` or `254712345678`)
   - Click **"Initiate Payment"**
   - Check your phone for M-Pesa STK push
   - Enter PIN to complete payment
   - Watch real-time status updates in the UI

### Payment Methods Supported

- **M-Pesa** - Kenyan mobile money (Safaricom)
- **Credit/Debit Cards** - Visa, Mastercard (coming soon)

### Phone Number Format

PayHero accepts Kenyan phone numbers in these formats:
- `0712345678` (will be converted to `254712345678`)
- `254712345678` (preferred format)
- `+254712345678` (will be converted to `254712345678`)

## Project Structure

```
erp-finpal-system/
├── app/
│   ├── api/                    # Next.js API routes
│   │   └── payments/          # PayHero payment endpoints
│   │       ├── initiate/      # POST - Start payment
│   │       ├── [reference]/   # GET - Check status
│   │       ├── webhook/       # POST - Receive updates
│   │       └── history/       # GET - List transactions
│   └── (dashboard)/           # Dashboard pages
│       ├── customers/
│       ├── suppliers/
│       ├── inventory/
│       ├── invoices/
│       ├── payments/
│       ├── accounting/
│       └── reports/
├── components/
│   ├── ui/                    # Shadcn components
│   └── dashboard/             # Custom components
│       ├── payhero-payment-dialog.tsx
│       └── payment-status-badge.tsx
├── hooks/
│   ├── use-payments.ts        # Payment CRUD hooks
│   └── use-payhero.ts         # PayHero integration hooks
├── lib/
│   ├── services/
│   │   └── payhero/          # PayHero service layer
│   │       ├── types.ts      # TypeScript types
│   │       ├── client.ts     # API client
│   │       ├── payments.ts   # Payment service
│   │       └── webhooks.ts   # Webhook handler
│   ├── types.ts              # Global types
│   └── utils.ts              # Utility functions
└── .env.local                # Environment variables (not in git)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Payment Endpoints

#### Initiate Payment
```http
POST /api/payments/initiate
Content-Type: application/json

{
  "amount": 1000,
  "phone_number": "254712345678",
  "provider": "m-pesa",
  "external_reference": "INV-001"
}
```

#### Check Payment Status
```http
GET /api/payments/{transaction_reference}/status
```

#### Payment Webhook
```http
POST /api/payments/webhook
Content-Type: application/json

{
  "event": "payment.success",
  "transaction_id": "...",
  "transaction_reference": "...",
  "amount": 1000,
  "status": "success"
}
```

#### Transaction History
```http
GET /api/payments/history?page=1&limit=20&status=success
```

## Troubleshooting

### PayHero Payment Issues

**M-Pesa STK Push Not Received**
- Verify phone number format is correct
- Ensure phone has network coverage
- Check M-Pesa service is available
- Try again after 1-2 minutes

**Payment Status Stuck on "Pending"**
- User may have cancelled on their phone
- Check PayHero dashboard for transaction status
- Status updates automatically every 3 seconds
- Payments auto-expire after 5 minutes

**Authentication Failed**
- Double-check API credentials in `.env.local`
- Ensure no extra spaces in environment variables
- Restart development server after changing `.env.local`

**Webhook Not Working**
- Verify webhook URL is publicly accessible
- Check webhook is configured in PayHero dashboard
- Review server logs for incoming webhook requests
- Test webhook endpoint: `GET /api/payments/webhook` should return 200

### Development Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Type Errors**
```bash
# Regenerate TypeScript types
rm -rf node_modules
npm install
```

## Security Best Practices

1. **Never commit API credentials** - They're in `.env.local` which is gitignored
2. **Use environment variables** - All secrets should be in `.env.*` files
3. **Verify webhooks** - Signature verification is implemented (update secret key)
4. **HTTPS in production** - Always use HTTPS for webhook endpoints
5. **Validate inputs** - All payment amounts and phone numbers are validated

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update PayHero webhook URL with your Vercel domain

### Manual Deployment

```bash
npm run build
npm start
```

Set environment variables on your hosting platform.

## Testing

### Test Credentials

For development/testing, use small amounts (KES 10-50) to verify the integration works correctly.

### Test Scenarios

1. **Successful Payment**
   - Initiate payment with valid phone and amount
   - Complete M-Pesa prompt on phone
   - Verify status updates to "success"

2. **Failed Payment**
   - Initiate payment
   - Cancel M-Pesa prompt
   - Verify status updates to "failed" or "cancelled"

3. **Expired Payment**
   - Initiate payment
   - Don't respond to M-Pesa prompt
   - Wait 5+ minutes
   - Verify status updates to "expired"

## Support

For issues or questions:
- 📧 Email: support@finpal.co.ke
- 💬 PayHero Support: [support.payhero.co.ke](https://support.payhero.co.ke)
- 📖 PayHero Docs: [docs.payhero.co.ke](https://docs.payhero.co.ke)

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for the Kenyan market**
