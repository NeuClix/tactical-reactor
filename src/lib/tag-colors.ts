// Tag color presets with light/dark mode variations
// Each color has: bg (light), bgDark, text (light), textDark

export interface TagColorConfig {
  bg: string      // Light mode background with transparency
  bgDark: string  // Dark mode background with transparency
  text: string    // Light mode text
  textDark: string // Dark mode text
}

// Opacity levels for light and dark modes (4 steps each)
export type OpacityLevel = 1 | 2 | 3 | 4

// Default opacity levels (used when tag doesn't specify)
export const DEFAULT_LIGHT_OPACITY: OpacityLevel = 2
export const DEFAULT_DARK_OPACITY: OpacityLevel = 2

export const OPACITY_LEVELS = {
  light: {
    1: 0.15,  // Subtle
    2: 0.35,  // Medium (default)
    3: 0.55,  // Bold
    4: 0.95,  // Solid (near-full opacity)
  },
  dark: {
    1: 0.20,  // Subtle
    2: 0.45,  // Medium (default)
    3: 0.70,  // Bold
    4: 0.90,  // Solid (near-full opacity)
  },
} as const

export const OPACITY_LABELS = {
  1: 'Subtle',
  2: 'Medium',
  3: 'Bold',
  4: 'Solid',
} as const

// Preset tag colors (hex values)
export const TAG_COLOR_PRESETS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
] as const

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Calculate relative luminance for contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Darken a color by percentage
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const factor = 1 - percent / 100
  const r = Math.round(rgb.r * factor)
  const g = Math.round(rgb.g * factor)
  const b = Math.round(rgb.b * factor)
  return `rgb(${r}, ${g}, ${b})`
}

// Lighten a color by percentage
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const factor = percent / 100
  const r = Math.round(rgb.r + (255 - rgb.r) * factor)
  const g = Math.round(rgb.g + (255 - rgb.g) * factor)
  const b = Math.round(rgb.b + (255 - rgb.b) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

// Text color presets for auto-calculation
export const TEXT_COLOR_DARK = '#1f2937'  // Dark gray for light backgrounds
export const TEXT_COLOR_LIGHT = '#ffffff' // White for dark backgrounds

// Calculate effective background luminance considering opacity and base background
// Light mode base: white (#ffffff), Dark mode base: dark (#1f2937)
function getEffectiveLuminance(
  hexColor: string,
  opacity: number,
  mode: 'light' | 'dark'
): number {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return mode === 'light' ? 1 : 0

  // Base background colors
  const baseBg = mode === 'light'
    ? { r: 255, g: 255, b: 255 }  // white
    : { r: 31, g: 41, b: 55 }      // dark-800

  // Blend the tag color with the base background using the opacity
  const blendedR = Math.round(rgb.r * opacity + baseBg.r * (1 - opacity))
  const blendedG = Math.round(rgb.g * opacity + baseBg.g * (1 - opacity))
  const blendedB = Math.round(rgb.b * opacity + baseBg.b * (1 - opacity))

  return getLuminance(blendedR, blendedG, blendedB)
}

// Smart auto-calculate text color based on effective background luminance
// Returns black or white for optimal contrast
export function getAutoTextColor(
  hexColor: string,
  opacityLevel: OpacityLevel,
  mode: 'light' | 'dark'
): string {
  const opacity = mode === 'light'
    ? OPACITY_LEVELS.light[opacityLevel]
    : OPACITY_LEVELS.dark[opacityLevel]

  const effectiveLuminance = getEffectiveLuminance(hexColor, opacity, mode)

  // Use a threshold of 0.5 - if effective bg is light, use dark text and vice versa
  return effectiveLuminance > 0.5 ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT
}

// Generate CSS styles for a tag color with light/dark mode support
// Accepts optional opacity overrides (1-3), uses defaults if not specified
// Supports optional text color overrides (null/undefined = auto-calculate)
export function getTagColorStyles(
  hexColor: string,
  lightOpacity: OpacityLevel = DEFAULT_LIGHT_OPACITY,
  darkOpacity: OpacityLevel = DEFAULT_DARK_OPACITY,
  lightTextOverride?: string | null,
  darkTextOverride?: string | null
): {
  lightBg: string
  lightText: string
  darkBg: string
  darkText: string
  lightTextAuto: string  // The auto-calculated value (for UI display)
  darkTextAuto: string   // The auto-calculated value (for UI display)
} {
  const rgb = hexToRgb(hexColor)
  if (!rgb) {
    // Fallback to gray if invalid color
    const fallbackLightOp = OPACITY_LEVELS.light[lightOpacity]
    const fallbackDarkOp = OPACITY_LEVELS.dark[darkOpacity]
    return {
      lightBg: `rgba(107, 114, 128, ${fallbackLightOp})`,
      lightText: TEXT_COLOR_DARK,
      darkBg: `rgba(107, 114, 128, ${fallbackDarkOp})`,
      darkText: TEXT_COLOR_LIGHT,
      lightTextAuto: TEXT_COLOR_DARK,
      darkTextAuto: TEXT_COLOR_LIGHT,
    }
  }

  const { r, g, b } = rgb

  // Get opacity values from levels
  const lightOp = OPACITY_LEVELS.light[lightOpacity]
  const darkOp = OPACITY_LEVELS.dark[darkOpacity]

  // Calculate backgrounds
  const lightBg = `rgba(${r}, ${g}, ${b}, ${lightOp})`
  const darkBg = `rgba(${r}, ${g}, ${b}, ${darkOp})`

  // Smart auto-calculate text colors based on effective luminance
  const lightTextAuto = getAutoTextColor(hexColor, lightOpacity, 'light')
  const darkTextAuto = getAutoTextColor(hexColor, darkOpacity, 'dark')

  // Use override if provided, otherwise use auto-calculated
  const lightText = lightTextOverride || lightTextAuto
  const darkText = darkTextOverride || darkTextAuto

  return { lightBg, lightText, darkBg, darkText, lightTextAuto, darkTextAuto }
}

// Get inline style object for a tag (for dynamic colors)
// Uses defaults if opacity levels not specified
// Supports optional text color overrides
export function getTagStyle(
  hexColor: string,
  isDarkMode: boolean,
  lightOpacity?: OpacityLevel,
  darkOpacity?: OpacityLevel,
  lightTextOverride?: string | null,
  darkTextOverride?: string | null
): React.CSSProperties {
  const colors = getTagColorStyles(
    hexColor,
    lightOpacity ?? DEFAULT_LIGHT_OPACITY,
    darkOpacity ?? DEFAULT_DARK_OPACITY,
    lightTextOverride,
    darkTextOverride
  )
  return {
    backgroundColor: isDarkMode ? colors.darkBg : colors.lightBg,
    color: isDarkMode ? colors.darkText : colors.lightText,
  }
}

// Color name mapping for display
export const TAG_COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'Red',
  '#f97316': 'Orange',
  '#eab308': 'Yellow',
  '#22c55e': 'Green',
  '#14b8a6': 'Teal',
  '#3b82f6': 'Blue',
  '#6366f1': 'Indigo',
  '#a855f7': 'Purple',
  '#ec4899': 'Pink',
  '#6b7280': 'Gray',
}
