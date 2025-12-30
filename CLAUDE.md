# CLAUDE.md - NeuClix Tactical Reactor

> AI assistant instructions for NeuClix Tactical Reactor codebase

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server → localhost:3000 |
| `npm run build` | Production build + type check |
| `npm run lint` | ESLint check |
| `npm run start` | Run production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Coverage report |

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
- ❌ Skip error boundaries in client components
- ❌ Make direct Supabase calls from client without RLS consideration

### ALWAYS

- ✅ Validate user input with `src/lib/validation.ts`
- ✅ Check subscription status before AI generation
- ✅ Use rate limiting on API routes
- ✅ Include CSRF protection on state-changing operations
- ✅ Use path alias `@/*` for imports from `src/*`
- ✅ Run `npm run build` to verify changes compile
- ✅ Write tests for new API routes and critical business logic
- ✅ Use try/catch with typed error responses

---

## Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── generate/         # AI generation endpoint
│   │   ├── checkout/         # Stripe checkout
│   │   └── webhooks/stripe/  # Stripe webhook handler
│   ├── auth/                 # Login/signup pages
│   ├── dashboard/            # Protected pages
│   │   ├── content/          # Content Hub
│   │   ├── gen/              # Gen Hub (AI)
│   │   ├── brand/            # Brand Hub
│   │   └── settings/         # User settings
│   └── pricing/              # Public pricing page
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── dashboard/            # Dashboard-specific components
│   ├── forms/                # Form components
│   └── layouts/              # Layout wrappers
├── lib/                      # Core utilities
│   ├── supabase.ts           # Browser client
│   ├── supabase-server.ts    # Server client (cookies)
│   ├── stripe.ts             # Stripe + PRICING_TIERS
│   ├── anthropic.ts          # Claude API wrapper
│   ├── validation.ts         # Input sanitization
│   ├── rate-limit.ts         # Request throttling
│   └── csrf.ts               # CSRF tokens
├── hooks/                    # Custom React hooks
├── types/index.ts            # TypeScript interfaces
└── __tests__/                # Test files mirror src/ structure
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
// Check before AI generation
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
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limit
    const rateLimitResult = await rateLimit(req, 'endpoint-name')
    if (!rateLimitResult.success) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Error Response Pattern

```typescript
// Consistent error shape across all API routes
type ApiError = {
  error: string
  code?: string
  details?: Record<string, unknown>
}

// Usage
return NextResponse.json<ApiError>(
  { error: 'Validation failed', code: 'INVALID_INPUT', details: { field: 'prompt' } },
  { status: 400 }
)
```

### Component Pattern

```typescript
// Props interface at top
interface ContentCardProps {
  title: string
  content: string
  status: 'draft' | 'published'
  onEdit?: () => void
}

// Functional component with explicit return type
export function ContentCard({ title, content, status, onEdit }: ContentCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  )
}
```

### shadcn/ui Component Import

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

### Claude API Integration

```typescript
// src/lib/anthropic.ts pattern
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function generateContent(prompt: string, brandContext?: BrandProfile) {
  const systemPrompt = brandContext
    ? `You are a content creator for ${brandContext.name}. Voice: ${brandContext.voice}`
    : 'You are a helpful content creation assistant.'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

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

## Testing Strategy

### Structure
```
src/__tests__/
├── api/                # API route tests
├── components/         # Component tests
├── lib/                # Utility function tests
└── integration/        # E2E flows
```

### Testing Approach
- **API Routes**: Test auth, validation, rate limiting, and business logic
- **Components**: Test rendering and user interactions
- **Utils**: Test validation, formatting, error handling
- **Integration**: Test critical user flows (signup → subscribe → generate)

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm test -- --grep "auth"   # Filter by pattern
```

### Test Patterns
```typescript
// API route test example
describe('POST /api/generate', () => {
  it('returns 401 without auth', async () => {
    const response = await POST(mockRequest({ prompt: 'test' }))
    expect(response.status).toBe(401)
  })

  it('returns 403 without active subscription', async () => {
    // Mock authenticated user without subscription
    const response = await POST(mockAuthenticatedRequest({ prompt: 'test' }))
    expect(response.status).toBe(403)
  })
})
```

---

## Git Workflow

### Branch Naming
```
feature/add-content-templates
bugfix/fix-subscription-check
hotfix/stripe-webhook-signature
```

### Commit Messages
```
feat(gen-hub): add content template selector
fix(api): validate subscription before generation
docs: update API documentation
refactor(auth): simplify session handling
test(api): add generate endpoint tests
```

### PR Process
1. Create feature branch from `main`
2. Make changes, ensure `npm run build` passes
3. Write/update tests
4. Push and create PR with description
5. Request review
6. Squash merge after approval

---

## Workflows for Claude

### Feature Development
```
1. UNDERSTAND: Read relevant files to grasp current implementation
2. PLAN: Think through the approach — consider edge cases, types, tests
3. TEST FIRST: Write failing test for expected behavior
4. IMPLEMENT: Write minimal code to pass the test
5. REFACTOR: Clean up while keeping tests green
6. VERIFY: Run `npm run build` and `npm test`
7. DOCUMENT: Update types/comments if needed
```

### Bug Fixing
```
1. REPRODUCE: Understand the exact failure scenario
2. LOCATE: Find the relevant code (check API routes, components, lib/)
3. DIAGNOSE: Add logging if needed, trace data flow
4. PLAN FIX: Think through the root cause — don't just patch symptoms
5. TEST: Write a test that reproduces the bug
6. FIX: Implement the fix
7. VERIFY: Confirm test passes, run full suite, run build
```

### Adding API Route
```
1. Create src/app/api/{name}/route.ts
2. Add rate limiting config in src/lib/rate-limit.ts
3. Implement with template: rate limit → auth → validate → business logic
4. Add types to src/types/index.ts if needed
5. Write tests in src/__tests__/api/{name}.test.ts
6. Run `npm run build` to verify
```

### Adding Dashboard Page
```
1. Create src/app/dashboard/{page}/page.tsx
2. Auth is automatic (middleware protects /dashboard/*)
3. Use createServerComponentClient() for data fetching
4. Create page-specific components in src/components/dashboard/
5. Test loading and error states
```

### Database Changes
```
1. Create migration: supabase/migrations/YYYYMMDDHHMMSS_description.sql
2. Include RLS policies for new tables
3. Update src/types/index.ts with new types
4. Test migration locally: supabase db reset
5. Update relevant queries in the codebase
```

---

## Debugging Guide

### API Issues
```typescript
// Add to API route temporarily
console.log('[DEBUG]', {
  user: user?.id,
  body,
  subscription: subscription?.plan
})
```

### Auth Issues
Check in order:
1. Supabase session: `supabase.auth.getSession()`
2. Cookie presence in browser DevTools
3. Server-side: `createServerComponentClient()` vs `createClient()`

### Stripe Issues
```bash
# Watch webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-json
```

### Database Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test as authenticated user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM your_table;
```

---

## Security Checklist

| Feature | Location | Notes |
|---------|----------|-------|
| Input validation | `src/lib/validation.ts` | Blocks injection patterns |
| Rate limiting | `src/lib/rate-limit.ts` | generate=20/min, checkout=10/min |
| CSRF protection | `src/lib/csrf.ts` | Double-submit cookie pattern |
| Webhook idempotency | `webhook_events` table | Prevents duplicate processing |
| Security headers | `next.config.js` | CSP, X-Frame-Options, etc. |
| Password policy | `src/lib/validation.ts` | 12+ chars, mixed case, number, special |

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

## Performance Considerations

### Data Fetching
- Use React Server Components for initial data load
- Implement pagination for list views (content, history)
- Cache brand profiles per request using React cache()

### AI Generation
- Stream responses for long content (`stream: true`)
- Show generation progress to user
- Implement request queuing for agency tier

### Database
- Ensure indexes on: user_id, created_at, status
- Use select() with only needed columns
- Batch operations where possible

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Unauthorized" on dashboard | Missing/expired session | Check Supabase auth flow |
| AI generation fails | Invalid API key or rate limit | Verify `ANTHROPIC_API_KEY` |
| Webhook not processing | Missing signature verification | Check `STRIPE_WEBHOOK_SECRET` |
| Type errors on build | Strict mode violations | Fix types, no `any` allowed |
| CORS errors | Wrong `NEXT_PUBLIC_APP_URL` | Verify env matches actual URL |
| Hydration mismatch | Server/client render difference | Check for Date, random, or browser-only code |
| RLS denying access | Missing or wrong policy | Check pg_policies, verify user_id match |

---

## Known Gotchas

1. **Supabase cookies**: Server components need `cookies()` from `next/headers` — don't forget to make the component async
2. **Stripe webhooks**: Events can arrive out of order — always fetch current state from Stripe
3. **React 19 changes**: `use()` hook is available but stick to established patterns for now
4. **shadcn variants**: Check component file for available variants before adding custom classes
5. **Next.js caching**: API routes with auth don't cache by default — good for our use case

---

## Code Style

- **Imports**: Use `@/` path alias, group by external → internal → types
- **Components**: Functional components with TypeScript interfaces for props
- **Naming**: PascalCase components, camelCase functions, SCREAMING_SNAKE constants
- **Files**: kebab-case for files, match export name for components
- **Async**: Use async/await, handle errors explicitly with try/catch
- **Comments**: Explain "why" not "what" — code should be self-documenting
- **Types**: Prefer interfaces for objects, types for unions/primitives

---

## Agents & Skills

See `.claude/` for specialized helpers:

| Type | Available | Purpose |
|------|-----------|---------|
| **Agents** | api-builder, component-builder, database-architect, security-reviewer, stripe-integrator, test-engineer | Task-specific specialists |
| **Skills** | api-security, nextjs-patterns, react-component-patterns, shadcn-ui-patterns, stripe-implementation, supabase-integration, typescript-guidelines | Pattern references |
