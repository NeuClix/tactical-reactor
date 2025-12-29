---
name: shadcn-ui-patterns
description: shadcn/ui component usage, customization, theming, and best practices. Use when building UI with shadcn/ui components.
---

# shadcn/ui Patterns

## Installation and Setup

**Install shadcn/ui for Next.js:**

```bash
npx shadcn-ui@latest init -d
```

This initializes shadcn/ui with Tailwind CSS configuration.

## Adding Components

**Install individual components:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

## Common Components

**Button:**
```typescript
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

**Card:**
```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Input:**
```typescript
import { Input } from '@/components/ui/input'

<Input placeholder="Enter text" type="email" />
```

**Form (with React Hook Form):**
```typescript
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

function MyForm() {
  const form = useForm({
    defaultValues: { email: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

**Dialog:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

function MyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        Content
      </DialogContent>
    </Dialog>
  )
}
```

**Dropdown Menu:**
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Option 1</DropdownMenuItem>
    <DropdownMenuItem>Option 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Customization

**Using `cn()` for class merging:**

```typescript
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  customClass?: string
}

function CustomButton({ className, ...props }: CustomButtonProps) {
  return <Button className={cn('custom-style', className)} {...props} />
}
```

**Extending components:**

```typescript
// Create a variant wrapper
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function PrimaryButton(props: PrimaryButtonProps) {
  return <Button variant="default" size="lg" {...props} />
}
```

## Theming

**Custom theme colors in `globals.css`:**

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --primary: 0 72.2% 50.6%;
    --primary-foreground: 0 0% 100%;
    /* ... other colors ... */
  }
}
```

## Accessibility

**shadcn/ui components are accessible by default:**
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader support

Always use semantic HTML:
```typescript
// Good: Using Form component
<FormField ... />

// Bad: Manual accessibility
<input aria-label="email" />
```

## Best Practices

1. **Use composition** - Stack shadcn components for complex UIs
2. **Leverage variants** - Use built-in variants before custom styling
3. **Extract to components** - Don't repeat shadcn usage
4. **Keep it simple** - Use defaults when possible
5. **Test accessibility** - Keyboard and screen reader testing
6. **Use responsive variants** - Tailwind's responsive classes work
