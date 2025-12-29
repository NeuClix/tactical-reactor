---
name: nextjs-patterns
description: Next.js 15 App Router best practices, file structure, server/client components, and performance optimization. Use when building pages, layouts, or API routes.
---

# Next.js 15 App Router Patterns

## Key Principles

1. **Server Components by Default** - Use Server Components unless you need interactivity
2. **App Router Structure** - Use file-based routing in `src/app/`
3. **Layouts for Shared UI** - Use `layout.tsx` for navigation, headers, sidebars
4. **API Routes** - Use `src/app/api/` for backend endpoints

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout
│   │   ├── page.tsx        # Dashboard home
│   │   ├── [id]/
│   │   │   └── page.tsx    # Dynamic route
│   │   └── api/
│   │       └── route.ts    # API endpoint
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/
│   ├── layout/             # Layout components
│   ├── ui/                 # shadcn/ui components
│   └── features/           # Feature-specific components
├── lib/
│   ├── supabase.ts         # Database client
│   ├── stripe.ts           # Stripe utilities
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # Helpers
└── types/
    └── index.ts            # TypeScript definitions
```

## Server vs Client Components

**Use Server Components for:**
- Fetching data from databases
- Accessing API keys and secrets
- Processing forms and mutations
- Rendering sensitive information

**Use Client Components for:**
- Interactive features (onClick, onChange)
- Using hooks (useState, useEffect, useContext)
- Using browser APIs
- Real-time updates

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client Component
'use client'
import { useState } from 'react'

export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## Layouts and Route Groups

Use layouts for shared UI structure:

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

## API Routes

API endpoints are in `src/app/api/`:

```typescript
// src/app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Server-side logic here
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  // Handle POST
  return NextResponse.json({ success: true })
}
```

## Dynamic Routes

Use `[id]` for dynamic segments:

```typescript
// src/app/dashboard/content/[id]/page.tsx
export default async function ContentPage({ params }: { params: { id: string } }) {
  const content = await getContent(params.id)
  return <Editor content={content} />
}
```

## Data Fetching

```typescript
// Good: Server Component
async function UserData({ userId }: { userId: string }) {
  const user = await db.query.users.findById(userId)
  return <div>{user.name}</div>
}

// Bad: Client Component making multiple requests
'use client'
function UserData({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(/* ... */)
  }, [userId])
  // Many requests, no caching
}
```

## Performance Tips

1. Use dynamic imports for large components
2. Implement streaming for slow data
3. Use Image component for optimization
4. Leverage caching headers
5. Minimize JavaScript sent to client

## Common Patterns

- Parallel routes for complex layouts
- Route groups `(group)` to organize without affecting URL
- Catch-all routes `[...slug]` for flexible routing
- Optional catch-all routes `[[...slug]]`
