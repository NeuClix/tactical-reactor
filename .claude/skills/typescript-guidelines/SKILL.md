---
name: typescript-guidelines
description: TypeScript best practices for strict mode, type safety, avoiding any, proper typing patterns, and maintaining code quality. Use when writing TypeScript code.
---

# TypeScript Guidelines for NeuClix

## Strict Mode

All projects must use TypeScript strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Avoid `any`

**Never use `any` - be specific:**

```typescript
// Bad
function process(data: any) {
  return data.something
}

// Good
interface Data {
  something: string
  count: number
}

function process(data: Data) {
  return data.something
}

// Use unknown when type is truly unknown
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'something' in data) {
    return (data as Record<string, unknown>).something
  }
}
```

## Type Safety Patterns

**Use interfaces for public APIs:**

```typescript
// Good
interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: Date
}

function getUserProfile(id: string): Promise<UserProfile> {
  // implementation
}

// Type inference
function createUser(email: string) {
  return { email, id: uuid(), createdAt: new Date() }
  // Type is inferred, which is fine for internal functions
}
```

## Union Types and Type Guards

```typescript
// Good: Use discriminated unions
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function handleResult<T>(result: Result<T>) {
  if (result.status === 'success') {
    console.log(result.data) // T
  } else {
    console.log(result.error) // Error
  }
}

// Type guard function
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}
```

## Generics

**Use generics for reusable components:**

```typescript
// Good generic
interface PageProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  onSelect: (item: T) => void
}

function List<T extends { id: string }>({ items, renderItem, onSelect }: PageProps<T>) {
  return <ul>{items.map(item => <li key={item.id}>{renderItem(item)}</li>)}</ul>
}

// Usage
interface User {
  id: string
  name: string
}

<List<User> items={users} renderItem={u => u.name} onSelect={handleSelect} />
```

## Utility Types

**Use TypeScript utility types effectively:**

```typescript
// Partial - all optional
type UserUpdate = Partial<User>

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude properties
type UserWithoutPassword = Omit<User, 'password'>

// Record - object with specific keys
type RolePermissions = Record<'admin' | 'user' | 'guest', string[]>

// Readonly - immutable
type FrozenUser = Readonly<User>

// ReturnType - extract return type of function
type FetchResult = ReturnType<typeof fetchUser>
```

## Async/Await Types

```typescript
// Proper async typing
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error('Not found')
  return response.json()
}

// Error handling
async function safeFetch<T>(
  url: string,
  schema: (data: unknown) => T
): Promise<Result<T>> {
  try {
    const response = await fetch(url)
    const data = schema(await response.json())
    return { status: 'success', data }
  } catch (error) {
    return { status: 'error', error: error as Error }
  }
}
```

## Const Assertions

```typescript
// Without const assertion (type is string)
const direction = 'up'

// With const assertion (type is 'up')
const direction = 'up' as const

// Use for string literals
const directions = ['up', 'down', 'left', 'right'] as const
type Direction = (typeof directions)[number]
```

## Module Types

**Always export types from modules:**

```typescript
// Good: Exported types
export interface User {
  id: string
  email: string
}

export function getUser(id: string): Promise<User> {
  // implementation
}

// Import usage
import type { User } from './types'
import { getUser } from './api'
```

## Common Patterns

**React component typing:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button {...props} />
}
```

**API response typing:**
```typescript
interface ApiResponse<T> {
  data: T
  status: number
  timestamp: Date
}

type ApiError = {
  code: string
  message: string
  details?: Record<string, unknown>
}
```
