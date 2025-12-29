---
name: supabase-integration
description: Supabase best practices including authentication, database queries, row-level security, types, and integration patterns. Use when working with Supabase.
---

# Supabase Integration Patterns

## Client Setup

**Create a client utility:**

```typescript
// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export default createClient()
```

## Authentication

**User authentication pattern:**

```typescript
// Server-side session
import { createServerClient } from '@supabase/ssr'

export async function getServerSession() {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'User Name',
    },
  },
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Sign out
await supabase.auth.signOut()
```

## Database Queries

**Query patterns:**

```typescript
// Select
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Insert
const { data, error } = await supabase
  .from('users')
  .insert({
    email: 'user@example.com',
    name: 'User',
  })
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('users')
  .update({ name: 'New Name' })
  .eq('id', userId)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

## Row-Level Security (RLS)

**Enforce data isolation:**

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id)

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id)

-- Only authenticated users can insert
CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id)
```

## Typed Queries

**Use generated types:**

```typescript
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type InsertUser = Database['public']['Tables']['users']['Insert']
type UpdateUser = Database['public']['Tables']['users']['Update']

// Fully typed query
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single() as { data: User | null; error: any }
```

## Error Handling

```typescript
async function fetchUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}
```

## Realtime Subscriptions

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('users')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'users',
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

## Transactions

```typescript
// Using Supabase RPC for transactions
const { data, error } = await supabase.rpc('update_user_and_log', {
  user_id: id,
  new_name: name,
})
```

## Pagination

```typescript
const pageSize = 10
const page = 1

const { data, error, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

## Common Patterns

**Upsert operation:**
```typescript
const { data, error } = await supabase
  .from('users')
  .upsert({ id: userId, email })
  .select()
  .single()
```

**Batch operations:**
```typescript
const { data, error } = await supabase
  .from('posts')
  .insert(posts)
  .select()
```

**Filtering:**
```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .gte('published_at', '2025-01-01')
  .order('published_at', { ascending: false })
  .limit(10)
```
