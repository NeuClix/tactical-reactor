# CLAUDE.md - NeuClix Tactical Reactor

> AI assistant instructions for NeuClix Tactical Reactor codebase

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server → localhost:3000 |
| `npm run build` | Production build + type check |
| `npm run lint` | ESLint check |
| `npm run start` | Run production build |

---

## Project Context

**What this is**: SaaS platform for AI-powered business intelligence and content creation.

**Core features**:
- Dashboard Hub → Activity metrics/analytics
- Content Hub → CRUD for blog/social/email content
- Gen Hub → AI content generation (Claude API)
- Brand Hub → Brand customization (colors, fonts, logos)
- Settings → User profile and subscriptions

**Tech stack**: Next.js 15 (App Router) • React 19 • Supabase • Stripe • Anthropic Claude API • Tailwind + shadcn/ui • TypeScript (strict)

**User tiers**: Starter (100 gen/mo) • Pro (1000 gen/mo) • Agency (unlimited)

---

## Critical Constraints

### DO NOT

- ❌ Use `createClient()` in Server Components — use `createServerComponentClient()`
- ❌ Skip subscription checks before AI generation
- ❌ Process Stripe webhooks without idempotency check
- ❌ Bypass input validation in API routes
- ❌ Hardcode environment variables
- ❌ Use `any` type — strict TypeScript required
- ❌ Commit `.env.local` or expose secrets

### ALWAYS

- ✅ Validate user input with `src/lib/validation.ts`
- ✅ Check subscription status before AI generation
- ✅ Use rate limiting on API routes
- ✅ Include CSRF protection on state-changing operations
- ✅ Use path alias `@/*` for imports from `src/*`
- ✅ Run `npm run build` to verify changes compile

---

## Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── generate/         # AI generation endpoint
│   │   ├── checkout/         # Stripe checkout
│   │   ├── csrf-token/       # CSRF token endpoint
│   │   └── webhooks/stripe/  # Stripe webhook handler
│   ├── auth/                 # Login/signup pages
│   ├── dashboard/            # Protected pages
│   │   ├── content/          # Content Hub (list, [id], new)
│   │   ├── gen/              # Gen Hub (AI)
│   │   ├── brand/            # Brand Hub
│   │   └── settings/         # User settings
│   └── pricing/              # Public pricing page
├── components/
│   ├── ui/                   # shadcn/ui (alert, badge, button, card, input)
│   └── content-editor.tsx    # Content editing component
├── lib/                      # Core utilities
│   ├── supabase.ts           # Browser client
│   ├── supabase-server.ts    # Server client (cookies)
│   ├── stripe.ts             # Stripe + PRICING_TIERS
│   ├── validation.ts         # Input sanitization
│   ├── rate-limit.ts         # Request throttling
│   ├── csrf.ts               # CSRF tokens
│   └── utils.ts              # Helpers (cn, etc.)
└── types/index.ts            # TypeScript interfaces

.claude/
├── agents/                   # Specialized agents
│   ├── api-builder.md        # API route specialist
│   ├── component-builder.md  # React component builder
│   ├── database-architect.md # Supabase schema specialist
│   ├── security-reviewer.md  # Security audit agent
│   ├── stripe-integrator.md  # Payments specialist
│   └── test-engineer.md      # Testing specialist
└── skills/                   # Pattern references
    ├── api-security/
    ├── nextjs-patterns/
    ├── react-component-patterns/
    ├── shadcn-ui-patterns/
    ├── stripe-implementation/
    ├── supabase-integration/
    └── typescript-guidelines/
```

---

## Code Patterns

### Supabase Client Selection

```typescript
// Client Components (browser)
import { createClient } from '@/lib/supabase'
const supabase = createClient()

// Server Components & API Routes
import { createServerComponentClient } from '@/lib/supabase-server'
const supabase = createServerComponentClient()
```

### Authentication Check (Server)

```typescript
const supabase = createServerComponentClient()
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  redirect('/auth/login')
}
```

### Subscription Enforcement

```typescript
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .single()

if (!subscription) {
  return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
}

// Usage limits by plan
const limits = { starter: 100, pro: 1000, agency: Infinity }
```

### API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { validatePrompt } from '@/lib/validation'
import { rateLimiters, getClientIdentifier, getClientIp, checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limit
    const ip = getClientIp(req.headers)
    const { allowed } = checkRateLimit(getClientIdentifier(null, ip), rateLimiters.generate)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    // 2. Auth check
    const supabase = createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Validate input
    const body = await req.json()
    const validation = validatePrompt(body.prompt)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 4. Business logic here...

  } catch (error) {
    console.error('[API_ROUTE_NAME]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### shadcn/ui Component Import

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/generate` | 20 req | 1 min (per user) |
| `/api/checkout` | 10 req | 1 min (per user) |
| `/auth/login` | 5 req | 1 min (per IP) |
| `/auth/signup` | 3 req | 1 min (per IP) |
| `/api/webhooks/*` | 100 req | 1 min (per IP) |

---

## Database Schema

**Tables** (all have RLS enabled):

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `subscriptions` | Stripe subscription state | user_id, stripe_customer_id, status, plan |
| `generation_history` | AI usage tracking | user_id, prompt, response, tokens_used |
| `brand_profiles` | Brand customization | user_id, colors, logo_url, font_family |
| `content_items` | User content | user_id, title, content, status |
| `webhook_events` | Idempotency tracking | event_id, processed_at |

**Migrations**: `supabase/migrations/`

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Workflows for Claude

### Feature Development
```
1. UNDERSTAND: Read relevant files, check .claude/skills/ for patterns
2. PLAN: Think through approach — consider edge cases, types, security
3. IMPLEMENT: Write code following project patterns
4. VERIFY: Run `npm run build` to catch type errors
5. TEST: Manual test in dev server
```

### Bug Fixing
```
1. REPRODUCE: Understand the failure scenario
2. LOCATE: Check API routes, components, lib/ — use grep
3. DIAGNOSE: Add console.log, trace data flow
4. PLAN FIX: Address root cause, not symptoms
5. FIX: Implement following project patterns
6. VERIFY: `npm run build` + manual test
```

### Adding API Route
```
1. Create src/app/api/{name}/route.ts
2. Add rate limiter in src/lib/rate-limit.ts if new endpoint
3. Follow template: rate limit → auth → validate → business logic
4. Add types to src/types/index.ts if needed
5. Run `npm run build`
```

### Adding Dashboard Page
```
1. Create src/app/dashboard/{page}/page.tsx
2. Auth is automatic (middleware protects /dashboard/*)
3. Use createServerComponentClient() for data fetching
4. Import UI from @/components/ui/
5. Test with `npm run dev`
```

### Database Changes
```
1. Create migration: supabase/migrations/YYYYMMDDHHMMSS_description.sql
2. Include RLS policies for new tables
3. Update src/types/index.ts with new types
4. Update relevant queries
```

---

## Debugging Guide

### API Issues
```typescript
// Add temporarily to trace
console.log('[DEBUG]', { user: user?.id, body, subscription: subscription?.plan })
```

### Auth Issues
Check in order:
1. Session exists: `supabase.auth.getSession()`
2. Cookie in browser DevTools
3. Correct client: `createServerComponentClient()` vs `createClient()`

### Stripe Issues
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-json
```

### Database / RLS Issues
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

---

## Security Checklist

| Feature | Location | Notes |
|---------|----------|-------|
| Input validation | `src/lib/validation.ts` | Blocks injection patterns |
| Rate limiting | `src/lib/rate-limit.ts` | In-memory (use Redis for prod) |
| CSRF protection | `src/lib/csrf.ts` | Double-submit cookie pattern |
| Webhook idempotency | `webhook_events` table | Prevents duplicate processing |
| Security headers | `next.config.js` | CSP, X-Frame-Options, etc. |
| Password policy | `src/lib/validation.ts` | 12+ chars, mixed case, number, special |

See `SECURITY_FIXES.md` for implementation details.

---

## Stripe Testing

```bash
# Terminal 1: Forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test cards
4242424242424242  # Success
4000000000000002  # Decline
4000000000009995  # Insufficient funds
```

---

## Known Gotchas

1. **Supabase cookies**: Server components need `cookies()` from `next/headers` — component must be async
2. **Stripe webhooks**: Events can arrive out of order — always fetch current state from Stripe
3. **Rate limiter**: Currently in-memory, resets on server restart — use Upstash Redis for prod
4. **shadcn variants**: Check component file for available variants before adding custom classes
5. **Next.js 15 caching**: API routes with auth don't cache by default — good for this app

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Unauthorized" on dashboard | Missing/expired session | Check Supabase auth flow |
| AI generation fails | Invalid API key or rate limit | Verify `ANTHROPIC_API_KEY` |
| Webhook not processing | Missing signature verification | Check `STRIPE_WEBHOOK_SECRET` |
| Type errors on build | Strict mode violations | Fix types, no `any` allowed |
| CORS errors | Wrong `NEXT_PUBLIC_APP_URL` | Verify env matches actual URL |

---

## Code Style

- **Imports**: Use `@/` path alias, group by external → internal → types
- **Components**: Functional components with TypeScript interfaces for props
- **Naming**: PascalCase components, camelCase functions, SCREAMING_SNAKE constants
- **Files**: kebab-case for files, match export name for components
- **Async**: Use async/await, handle errors explicitly with try/catch
- **Comments**: Explain "why" not "what" — code should be self-documenting

---

## Available Agents & Skills

Use these for specialized tasks:

**Agents** (`.claude/agents/`):
- `api-builder` — API routes, server logic, external APIs
- `component-builder` — React components, UI patterns
- `database-architect` — Schema, migrations, RLS
- `security-reviewer` — Security audits, vulnerability checks
- `stripe-integrator` — Payments, subscriptions, webhooks
- `test-engineer` — Testing strategy and implementation

**Skills** (`.claude/skills/`):
- `api-security` — Secure API patterns
- `nextjs-patterns` — App Router best practices
- `react-component-patterns` — Component architecture
- `shadcn-ui-patterns` — UI component usage
- `stripe-implementation` — Payment flows
- `supabase-integration` — Auth, queries, RLS
- `typescript-guidelines` — Type safety patterns
