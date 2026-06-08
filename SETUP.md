# MoMo Shop Manager — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or cloud, e.g. Supabase, Neon, Railway)

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/momo_manager"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### Free PostgreSQL options:
- **Supabase**: https://supabase.com (free tier, hosted in Africa region)
- **Neon**: https://neon.tech (free tier, serverless Postgres)
- **Railway**: https://railway.app (free trial)

---

## 3. Set up the database

Push the Prisma schema to your database:

```bash
npm run db:push
```

---

## 4. Seed with demo data (optional)

```bash
npm run db:seed
```

Demo login: `demo@momoshop.gh` / `password123`

---

## 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment on Vercel

1. Push this folder to a GitHub repository
2. Connect to Vercel: https://vercel.com/new
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` — your production PostgreSQL URL
   - `NEXTAUTH_SECRET` — a secure random string
   - `NEXTAUTH_URL` — your Vercel app URL (e.g. https://momo-manager.vercel.app)
4. Deploy — Vercel auto-runs `npm run build` and `prisma generate`

### After deploy, run migrations:

```bash
npx prisma db push --accept-data-loss
```

Or set up Vercel Postgres / Neon directly in the Vercel dashboard for zero-config integration.

---

## Project structure

```
├── prisma/
│   ├── schema.prisma     # Database models
│   └── seed.ts           # Demo data
├── src/
│   ├── app/
│   │   ├── (auth)/       # Login & Register pages
│   │   ├── (dashboard)/  # Protected app pages
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── add-transaction/   # Record cash-in/out
│   │   │   ├── transactions/      # History & filtering
│   │   │   └── end-of-day/        # Close out the day
│   │   └── api/          # Backend API routes
│   ├── components/       # Reusable UI components
│   ├── lib/              # Auth, Prisma, calculations
│   └── types/            # TypeScript types
└── middleware.ts         # Route protection
```

---

## Key financial formula

```
Expected Cash = Starting Float + Total Cash-In - Total Cash-Out
Discrepancy   = Actual Cash − Expected Cash
Profit        = Sum of all commissions
```
