# NeuClix Tactical Reactor - Style Guide

**Version:** 1.0.0
**Last Updated:** December 30, 2025

---

## Theme System Overview

NeuClix supports **dual themes** (Dark/Light) with **8 color palettes** (4 per theme).

### Theme Modes
- **Dark Mode**: Default, cyberpunk-inspired aesthetic
- **Light Mode**: Professional, clean aesthetic
- **System Mode**: Follows OS preference

### Color Palettes

#### Dark Theme Palettes
| Palette | Primary | Accent | Use Case |
|---------|---------|--------|----------|
| **Cyberpunk Blue** (default) | `#5b87ff` | `#7fa8ff` | Tech-forward, AI-focused |
| **Cyberpunk Purple** | `#a855f7` | `#c084fc` | Creative, artistic |
| **Neon Cyan** | `#06b6d4` | `#22d3ee` | Fresh, modern |
| **Hot Pink** | `#ec4899` | `#f472b6` | Bold, energetic |

#### Light Theme Palettes
| Palette | Primary | Accent | Use Case |
|---------|---------|--------|----------|
| **Professional Blue** (default) | `#2563eb` | `#3b82f6` | Corporate, trustworthy |
| **Forest Green** | `#059669` | `#10b981` | Growth, sustainability |
| **Warm Orange** | `#ea580c` | `#f97316` | Energetic, creative |
| **Royal Purple** | `#7c3aed` | `#8b5cf6` | Premium, sophisticated |

---

## Typography

### Heading Hierarchy

| Element | Dark Mode | Light Mode | Font Size |
|---------|-----------|------------|-----------|
| `h1` | Gradient text | Gradient text | `text-4xl` (2.25rem) |
| `h2` | `text-dark-50` | `text-gray-900` | `text-3xl` (1.875rem) |
| `h3` | `text-dark-100` | `text-gray-800` | `text-xl` (1.25rem) |
| Body `p` | `text-dark-300` | `text-gray-600` | `text-base` (1rem) |
| Muted | `text-dark-400` | `text-gray-400` | Varies |

### Usage Examples

```tsx
// Page title - uses gradient
<h1 className="text-4xl font-bold gradient-text-tech">Page Title</h1>

// Section heading - theme-aware
<h2 className="text-3xl font-bold text-dark-50 dark:text-dark-50 light:text-gray-900">
  Section Title
</h2>

// Card title
<h3 className="text-lg font-semibold text-dark-50 dark:text-dark-50 light:text-gray-900">
  Card Title
</h3>

// Body text
<p className="text-dark-300 dark:text-dark-300 light:text-gray-600">
  Body content here
</p>
```

---

## Color Reference

### Background Layers

| Layer | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Base | `bg-dark-950` (#07080e) | `bg-gray-50` | Main page background |
| Elevated | `bg-dark-900` (#0f1419) | `bg-white` | Cards, modals, sidebar |
| Surface | `bg-dark-800` (#1a1f2e) | `bg-gray-100` | Inputs, hover states |

### Text Colors

| Type | Dark Mode | Light Mode |
|------|-----------|------------|
| Primary | `text-dark-50` (#f9fafb) | `text-gray-900` |
| Secondary | `text-dark-200` (#e5e7eb) | `text-gray-600` |
| Muted | `text-dark-400` (#9ca3af) | `text-gray-400` |

### Border Colors

| Type | Dark Mode | Light Mode |
|------|-----------|------------|
| Default | `border-dark-700` | `border-gray-200` |
| Subtle | `border-dark-800` | `border-gray-100` |
| Accent | `border-primary-500/30` | `border-primary-500/30` |

---

## Component Patterns

### Cards

```tsx
// Theme-aware card
<div className="card-themed border rounded-lg p-6">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-sm mt-2">Description</p>
</div>

// Gradient card (dark theme special)
<div className="card-gradient p-6">
  Content
</div>

// Glass card (backdrop blur)
<div className="card-glass p-6">
  Content
</div>
```

### Buttons

```tsx
// Primary button - gradient background
<button className="btn-primary">
  Primary Action
</button>

// Secondary button - outline style
<button className="btn-secondary">
  Secondary Action
</button>

// Destructive button
<button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
  Delete
</button>
```

### Inputs

```tsx
// Theme-aware input
<input
  className="input-themed w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
  placeholder="Enter text..."
/>

// With explicit dark/light classes
<input
  className="w-full px-3 py-2 rounded-lg border
    dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100 dark:placeholder:text-dark-400
    light:bg-white light:border-gray-300 light:text-gray-900 light:placeholder:text-gray-400"
/>
```

### Modals/Dialogs

```tsx
// Modal content wrapper
<div className="modal-content p-6">
  <h2 className="text-lg font-semibold">Modal Title</h2>
  <p className="mt-2">Modal content</p>
  <div className="mt-4 flex gap-3">
    <button className="btn-secondary">Cancel</button>
    <button className="btn-primary">Confirm</button>
  </div>
</div>
```

---

## CSS Variables

All palette colors are exposed as CSS variables for dynamic theming:

```css
/* Available variables */
--palette-primary: R, G, B;        /* Primary color as RGB values */
--palette-primary-hex: #RRGGBB;    /* Primary color as hex */
--palette-accent: R, G, B;         /* Accent color as RGB values */
--palette-accent-hex: #RRGGBB;     /* Accent color as hex */
--palette-gradient: linear-gradient(...);  /* Theme gradient */
```

### Using CSS Variables

```css
/* In CSS */
.custom-element {
  color: var(--palette-primary-hex);
  border-color: rgba(var(--palette-primary), 0.3);
  background-image: var(--palette-gradient);
}
```

```tsx
// In inline styles
<div style={{ color: 'var(--palette-primary-hex)' }}>
  Dynamic color
</div>
```

---

## Theme Hook Usage

```tsx
import { useTheme, darkPalettes, lightPalettes } from '@/contexts/theme-context'

function MyComponent() {
  const {
    mode,           // 'dark' | 'light' | 'system'
    resolvedMode,   // 'dark' | 'light' (actual applied mode)
    darkPalette,    // Current dark palette
    lightPalette,   // Current light palette
    highContrast,   // boolean
    reduceMotion,   // boolean
    setMode,
    setDarkPalette,
    setLightPalette,
    setHighContrast,
    setReduceMotion,
  } = useTheme()

  return (
    <div>
      <p>Current mode: {resolvedMode}</p>
      <button onClick={() => setMode('light')}>Switch to Light</button>
    </div>
  )
}
```

---

## Accessibility

### High Contrast Mode
When `highContrast` is enabled:
- Text becomes pure white (dark) or black (light)
- Increased contrast ratios for all text elements

### Reduce Motion
When `reduceMotion` is enabled:
- All animations disabled
- All transitions set to 0ms

### ARIA Best Practices
- All form inputs must have associated labels (use `htmlFor`/`id`)
- Interactive elements need `aria-label` if no visible text
- Icon-only buttons require accessible names
- Decorative icons use `aria-hidden="true"`

```tsx
// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />

<button aria-label="Delete item">
  <Trash aria-hidden="true" />
</button>

// Bad
<input type="email" /> {/* No label */}
<button><Trash /></button> {/* No accessible name */}
```

---

## Dashboard Page Standard

All dashboard pages should follow this structure:

```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-dark-50 dark:text-dark-50">
          Page Title
        </h2>
        <p className="text-dark-300 dark:text-dark-300 light:text-gray-600">
          Page description
        </p>
      </div>

      {/* Main Content */}
      <div className="card-themed border rounded-lg p-6">
        {/* Content */}
      </div>
    </div>
  )
}
```

---

## File Organization

```
src/
├── app/
│   ├── globals.css          # Theme CSS variables + base styles
│   ├── layout.tsx           # ThemeProvider wrapper
│   └── dashboard/
│       └── [page]/page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components (theme-aware)
│   └── theme-settings.tsx   # Theme configuration UI
├── contexts/
│   └── theme-context.tsx    # Theme state management
└── styles/
    └── (reserved for additional style utilities)
```

---

## Quick Reference

### Theme Classes Cheatsheet

| Need | Dark Class | Light Class |
|------|------------|-------------|
| Page bg | `bg-dark-950` | `bg-gray-50` |
| Card bg | `bg-dark-900` | `bg-white` |
| Input bg | `bg-dark-800` | `bg-white` |
| Primary text | `text-dark-50` | `text-gray-900` |
| Secondary text | `text-dark-300` | `text-gray-600` |
| Muted text | `text-dark-400` | `text-gray-400` |
| Border | `border-dark-700` | `border-gray-200` |

### Utility Classes

| Class | Description |
|-------|-------------|
| `.card-themed` | Theme-aware card background/border |
| `.card-gradient` | Gradient border card (dark) |
| `.card-glass` | Backdrop blur glass effect |
| `.btn-primary` | Gradient primary button |
| `.btn-secondary` | Outline secondary button |
| `.input-themed` | Theme-aware input styling |
| `.modal-content` | Theme-aware modal wrapper |
| `.gradient-text-tech` | Gradient text effect |
| `.text-glow` | Glowing text (dark mode) |

---

## Migration Notes

When updating existing components to support themes:

1. Replace hardcoded dark colors with theme-aware classes
2. Add `dark:` and `light:` prefixes where needed
3. Use CSS variables for palette colors
4. Test in both dark and light modes
5. Verify high contrast mode works

### Common Replacements

| Old | New |
|-----|-----|
| `text-slate-900` | `text-dark-50 dark:text-dark-50 light:text-gray-900` |
| `text-slate-600` | `text-dark-300 dark:text-dark-300 light:text-gray-600` |
| `text-gray-900` | `text-dark-50` (dark) / `text-gray-900` (light) |
| `bg-white` | `bg-dark-900` (dark) / `bg-white` (light) |
