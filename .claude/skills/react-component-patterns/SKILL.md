---
name: react-component-patterns
description: React best practices including hooks, composition, state management, prop patterns, and performance optimization. Use when building or refactoring React components.
---

# React Component Patterns

## Component Composition

**Favor composition over inheritance:**

```typescript
// Good: Composition
function Card({ children }: { children: React.ReactNode }) {
  return <div className="border rounded p-4">{children}</div>
}

// Good: Wrapper component
function ProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </Card>
  )
}

// Bad: Over-engineered prop drilling
function Card({ title, subtitle, content, footer, ... }) {
  // 10+ props
}
```

## Props and TypeScript

**Use TypeScript for prop safety:**

```typescript
interface CardProps {
  title: string
  description?: string
  variant?: 'default' | 'outline' | 'ghost'
  children: React.ReactNode
}

export function Card({ title, description, variant = 'default', children }: CardProps) {
  return <div className={cn('card', variant)}>{children}</div>
}

// Extending props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}
```

## Hooks Pattern

**Keep hooks focused and simple:**

```typescript
// Good: Single responsibility
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}

// Bad: Mixing concerns
function useEverything() {
  const [data, setData] = useState()
  const [form, setForm] = useState()
  const [notifications, setNotifications] = useState()
  // 50+ lines of unrelated logic
}
```

## Memoization

**Use memoization strategically:**

```typescript
// Memoize expensive components
const ExpensiveList = React.memo(function List({ items }: { items: Item[] }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
})

// Memoize callbacks that are passed as props
function Parent() {
  const handleClick = useCallback(() => {
    // handler
  }, [dependency])

  return <Child onClick={handleClick} />
}

// Memoize computed values
function Component({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  return <List items={sortedItems} />
}
```

## Event Handlers

**Keep event handlers clean and minimal:**

```typescript
// Good
function Form() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await submitForm(Object.fromEntries(formData))
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// Bad: Complex logic in handlers
function Form() {
  const [state, setState] = useState({})
  // 20+ lines of manual state updates
  const handleChange = (e) => {
    // Complex nested updates
  }
}
```

## Controlled vs Uncontrolled

**Use controlled components for forms:**

```typescript
function SearchInput() {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search..."
    />
  )
}

// For simple inputs without validation, uncontrolled is fine
function SimpleInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const value = inputRef.current?.value
  }

  return <input ref={inputRef} />
}
```

## Error Boundaries

**Handle errors gracefully:**

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>
    }
    return this.props.children
  }
}

// Use with Suspense
function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## Performance Best Practices

1. **Lazy load components** - `const Heavy = lazy(() => import('./Heavy'))`
2. **Code split by route** - Automatic in Next.js
3. **Minimize re-renders** - Memoize when necessary
4. **Optimize lists** - Always use stable keys
5. **Avoid creating objects/functions in render** - Use useMemo/useCallback

## Common Anti-Patterns to Avoid

- Props drilling (pass data through 5+ levels)
- Creating functions inside render
- Unnecessary state updates
- Not using keys in lists
- Over-memoizing (premature optimization)
- Prop spreading without control
