# Senior Dog Nutrition API

Serverless API for the Senior Dog Nutrition Gap Checker.

## Stack

- **Runtime:** Vercel Serverless Functions (Node.js 18+)
- **Database:** Supabase Postgres
- **AI:** Claude API (Sonnet)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products?q=` | Search products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/estimate` | AI food estimation |
| GET | `/api/nutrients/references` | AAFCO nutrient targets |

## Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   # Edit with your keys
   ```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL from `22-backend-api-spec.md` to create tables
   - Import product data from `product_database_v2.xlsx`

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

## Environment Variables

Set these in Vercel dashboard:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon/public key
- `ANTHROPIC_API_KEY` - Claude API key

## API Examples

**Search products:**
```bash
curl "https://your-api.vercel.app/api/products?q=purina+senior"
```

**Get product:**
```bash
curl "https://your-api.vercel.app/api/products/prod_abc123"
```

**Estimate food:**
```bash
curl -X POST "https://your-api.vercel.app/api/estimate" \
  -H "Content-Type: application/json" \
  -d '{"text": "half cup chicken and rice", "item_type": "meal"}'
```

**Get nutrient references:**
```bash
curl "https://your-api.vercel.app/api/nutrients/references"
```
