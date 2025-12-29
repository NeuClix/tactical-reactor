# NeuClix Tactical Reactor - Implementation Plan

## Goal Description
Build "NeuClix Tactical Reactor", a comprehensive SaaS platform for business intelligence and content creation. The platform unifies research, creation, management, and distribution of content, powered by AI (Anthropic Claude).
The initial goal is to reach MVP (Phase 1) encompassing Dashboard, Content, Gen, Brand, and User Hubs, along with proper Authentication and Billing infrastructure.

## User Review Required
> [!IMPORTANT]
> **API Keys Required**: To proceed with development, we will eventually need valid API keys for:
> - **Supabase** (Project URL, Anon Key, Service Role Key)
> - **Stripe** (Test Publishable Key, Secret Key)
> - **Anthropic** (API Key for Claude)

> [!NOTE]
> **Deployment**: The plan assumes deployment to Vercel. You will need to connect your GitHub repository to Vercel for CI/CD.

## Proposed Changes

### Core Infrastructure
#### [NEW] [Project Setup]
- Initialize `next` app with TypeScript, Tailwind CSS, ESLint.
- Set up directory structure as specified (`src/app`, `src/components`, `src/lib`, etc.).
- Install `lucide-react`, `clsx`, `tailwind-merge` (for utils).
- Initialize `shadcn-ui` and install core components (Button, Input, Card, Dropdown, etc.).

#### [NEW] [Database & Auth]
- **Supabase Client**: Create `src/lib/supabase.ts` for client and server-side usage.
- **Middleware**: Implement `middleware.ts` for route protection and session management.
- **Types**: Generate TypeScript definitions from Supabase DB schema (`src/types/database.types.ts`).

### Phase 1: MVP Hubs

#### [NEW] [Dashboard Hub]
- **Layout**: Create main app shell `src/components/layout/AppShell.tsx` with Sidebar and Header.
- **Page**: `src/app/dashboard/page.tsx` displaying widgets.
- **Components**: `StatsCard`, `RecentActivityList`.

#### [NEW] [Brand Hub]
- **Schema**: Table `brand_profiles`.
- **Page**: `src/app/dashboard/brand/page.tsx`.
- **Features**: Forms to update logo URL, colors (using color picker), and font selections. Store in Supabase.

#### [NEW] [Content Hub]
- **Schema**: Table `content_items`.
- **Page**: `src/app/dashboard/content/page.tsx` (List view).
- **Editor**: `src/app/dashboard/content/[id]/page.tsx` (Editor view).
- **Features**: CRUD operations for content. Simple rich text editor or Markdown editor.

#### [NEW] [Gen Hub] (AI)
- **Schema**: Table `generation_history`.
- **API**: `src/app/api/generate/route.ts` handling calls to Anthropic.
- **Page**: `src/app/dashboard/gen/page.tsx` containing prompt interface.
- **Integration**: Secure backend calls to Claude API; streaming responses to UI.

#### [NEW] [User Hub & Settings]
- **Page**: `src/app/dashboard/settings/page.tsx`.
- **Features**: Profile update, password reset (via Supabase auth).

#### [NEW] [Payments (Stripe)]
- **Schema**: Table `subscriptions`.
- **Lib**: `src/lib/stripe.ts`.
- **API**: Webhook handler `src/app/api/webhooks/stripe/route.ts`.
- **Features**: Subscribe to Starter/Pro/Agency tiers. Gate features based on subscription status.

## Verification Plan

### Automated Tests
- Since this is an initial build, we will rely on manual verification and potentially add unit tests for utility functions later.
- Run `npm run lint` and `npm run build` to ensure type safety and build integrity.

### Manual Verification
1. **Auth Flow**: Sign up a new user, verify redirection to dashboard.
2. **Brand Profile**: Save brand colors, refresh page, verify persistence.
3. **Content**: Create a post, save it, see it in the list.
4. **AI Generation**: Run a prompt in Gen Hub, verify output from Claude, check usage limit logic.
5. **Subscription**: (Test Mode) 'Purchase' a Pro plan via Stripe, verify UI updates to reflect Pro status.
