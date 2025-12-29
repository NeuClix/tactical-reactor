---
name: api-security
description: Security best practices for APIs including authentication, authorization, input validation, and preventing common vulnerabilities. Use when building API routes and endpoints.
---

# API Security Best Practices

## Authentication

**Always verify user identity:**

```typescript
import { createServerClient } from '@supabase/ssr'

export async function getAuthUser() {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

// In API route
export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Process authenticated request
}
```

## Authorization

**Check user permissions before action:**

```typescript
// Role-based access control
async function checkPermission(userId: string, resource: string, action: string) {
  const { data: permission } = await supabase
    .from('permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('resource', resource)
    .eq('action', action)
    .single()

  if (!permission) {
    throw new Error('Forbidden')
  }
}

// Resource ownership check
async function checkOwnership(userId: string, resourceId: string) {
  const { data: resource, error } = await supabase
    .from('content_items')
    .select('user_id')
    .eq('id', resourceId)
    .single()

  if (error || resource.user_id !== userId) {
    throw new Error('Forbidden')
  }
}
```

## Input Validation

**Always validate and sanitize input:**

```typescript
import { z } from 'zod'

// Define schema
const CreateContentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  published: z.boolean().default(false),
})

// Validate request
export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = CreateContentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: result.error },
      { status: 400 }
    )
  }

  const validData = result.data
  // Use validated data
}
```

## SQL Injection Prevention

**Use parameterized queries:**

```typescript
// Good: Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)  // Parameter binding

// Bad: String interpolation
const query = `SELECT * FROM users WHERE id = '${userId}'`

// Good: For custom queries
const { data } = await supabase.rpc('get_user', { user_id: userId })
```

## XSS Prevention

**Never trust user input in HTML:**

```typescript
// Bad: HTML injection
<div dangerousSetInnerHTML={{ __html: userContent }} />

// Good: Text content only
<div>{userContent}</div>

// Good: Use sanitization library if needed
import DOMPurify from 'isomorphic-dompurify'

const clean = DOMPurify.sanitize(userHtml)
```

## CSRF Protection

**Use SameSite cookies (set by default in modern frameworks):**

```typescript
// Next.js handles CSRF by default with cookies
// Ensure proper headers are set
Response.headers.set('X-CSRF-Token', token)
```

## Rate Limiting

**Prevent abuse:**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
})

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(userId)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Process request
}
```

## Secure Headers

**Return appropriate headers:**

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data })

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000')

  return response
}
```

## API Keys

**Never expose secret keys:**

```typescript
// Bad: Exposed in client-side code
const API_KEY = 'sk_live_xxx'

// Good: Environment variable
const apiKey = process.env.ANTHROPIC_API_KEY

// Good: Only use in server components/API routes
// Never pass to client

// If needed in client, create a proxy endpoint
export async function POST(request: NextRequest) {
  const apiKey = process.env.STRIPE_SECRET_KEY
  // Use key securely on server
  const result = await stripe.charges.create({...}, { apiKey })
  return NextResponse.json(result)
}
```

## Error Handling

**Don't expose sensitive error details:**

```typescript
// Bad: Leaks internals
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}

// Good: Generic error to client
catch (error) {
  console.error('Processing error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Logging

**Log security events:**

```typescript
async function logSecurityEvent(userId: string, event: string, details: any) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      event,
      details,
      timestamp: new Date(),
    })
}

// Log failed auth
try {
  await authenticate(credentials)
} catch {
  await logSecurityEvent(email, 'auth_failed', { email })
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
```
