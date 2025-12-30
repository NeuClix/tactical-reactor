'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Theme modes
export type ThemeMode = 'dark' | 'light' | 'system'

// Color palette types
export type DarkPalette = 'cyberpunk-blue' | 'cyberpunk-purple' | 'neon-cyan' | 'hot-pink'
export type LightPalette = 'professional-blue' | 'forest-green' | 'warm-orange' | 'royal-purple'

// Theme context state
interface ThemeContextState {
  mode: ThemeMode
  resolvedMode: 'dark' | 'light' // Actual applied mode (resolved from system if needed)
  darkPalette: DarkPalette
  lightPalette: LightPalette
  highContrast: boolean
  reduceMotion: boolean
  setMode: (mode: ThemeMode) => void
  setDarkPalette: (palette: DarkPalette) => void
  setLightPalette: (palette: LightPalette) => void
  setHighContrast: (enabled: boolean) => void
  setReduceMotion: (enabled: boolean) => void
}

// Default values
const defaultTheme: ThemeContextState = {
  mode: 'dark',
  resolvedMode: 'dark',
  darkPalette: 'cyberpunk-blue',
  lightPalette: 'professional-blue',
  highContrast: false,
  reduceMotion: false,
  setMode: () => {},
  setDarkPalette: () => {},
  setLightPalette: () => {},
  setHighContrast: () => {},
  setReduceMotion: () => {},
}

// Create context
const ThemeContext = createContext<ThemeContextState>(defaultTheme)

// Storage key
const THEME_STORAGE_KEY = 'neuclix-theme-preferences'

// Theme preferences interface for storage
interface ThemePreferences {
  mode: ThemeMode
  darkPalette: DarkPalette
  lightPalette: LightPalette
  highContrast: boolean
  reduceMotion: boolean
}

// Load preferences from localStorage
function loadPreferences(): ThemePreferences {
  if (typeof window === 'undefined') {
    return {
      mode: 'dark',
      darkPalette: 'cyberpunk-blue',
      lightPalette: 'professional-blue',
      highContrast: false,
      reduceMotion: false,
    }
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }

  return {
    mode: 'dark',
    darkPalette: 'cyberpunk-blue',
    lightPalette: 'professional-blue',
    highContrast: false,
    reduceMotion: false,
  }
}

// Save preferences to localStorage
function savePreferences(prefs: ThemePreferences): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage errors
  }
}

// Get system preference
function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [mode, setModeState] = useState<ThemeMode>('dark')
  const [darkPalette, setDarkPaletteState] = useState<DarkPalette>('cyberpunk-blue')
  const [lightPalette, setLightPaletteState] = useState<LightPalette>('professional-blue')
  const [highContrast, setHighContrastState] = useState(false)
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [resolvedMode, setResolvedMode] = useState<'dark' | 'light'>('dark')

  // Initialize from localStorage
  useEffect(() => {
    const prefs = loadPreferences()
    setModeState(prefs.mode)
    setDarkPaletteState(prefs.darkPalette)
    setLightPaletteState(prefs.lightPalette)
    setHighContrastState(prefs.highContrast)
    setReduceMotionState(prefs.reduceMotion)
    setMounted(true)
  }, [])

  // Resolve system mode and apply theme
  useEffect(() => {
    if (!mounted) return

    const resolved = mode === 'system' ? getSystemPreference() : mode
    setResolvedMode(resolved)

    // Apply dark class to document
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    // Apply palette CSS variables
    const palette = resolved === 'dark' ? darkPalette : lightPalette
    root.setAttribute('data-palette', palette)

    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduce motion
    if (reduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [mounted, mode, darkPalette, lightPalette, highContrast, reduceMotion])

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode])

  // Setters with persistence
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    savePreferences({
      mode: newMode,
      darkPalette,
      lightPalette,
      highContrast,
      reduceMotion,
    })
  }, [darkPalette, lightPalette, highContrast, reduceMotion])

  const setDarkPalette = useCallback((palette: DarkPalette) => {
    setDarkPaletteState(palette)
    savePreferences({
      mode,
      darkPalette: palette,
      lightPalette,
      highContrast,
      reduceMotion,
    })
  }, [mode, lightPalette, highContrast, reduceMotion])

  const setLightPalette = useCallback((palette: LightPalette) => {
    setLightPaletteState(palette)
    savePreferences({
      mode,
      darkPalette,
      lightPalette: palette,
      highContrast,
      reduceMotion,
    })
  }, [mode, darkPalette, highContrast, reduceMotion])

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled)
    savePreferences({
      mode,
      darkPalette,
      lightPalette,
      highContrast: enabled,
      reduceMotion,
    })
  }, [mode, darkPalette, lightPalette, reduceMotion])

  const setReduceMotion = useCallback((enabled: boolean) => {
    setReduceMotionState(enabled)
    savePreferences({
      mode,
      darkPalette,
      lightPalette,
      highContrast,
      reduceMotion: enabled,
    })
  }, [mode, darkPalette, lightPalette, highContrast])

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="dark" suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedMode,
        darkPalette,
        lightPalette,
        highContrast,
        reduceMotion,
        setMode,
        setDarkPalette,
        setLightPalette,
        setHighContrast,
        setReduceMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Export palette information for UI
export const darkPalettes: { id: DarkPalette; name: string; primary: string; preview: string }[] = [
  { id: 'cyberpunk-blue', name: 'Cyberpunk Blue', primary: '#5b87ff', preview: 'bg-blue-500' },
  { id: 'cyberpunk-purple', name: 'Cyberpunk Purple', primary: '#a855f7', preview: 'bg-purple-500' },
  { id: 'neon-cyan', name: 'Neon Cyan', primary: '#06b6d4', preview: 'bg-cyan-500' },
  { id: 'hot-pink', name: 'Hot Pink', primary: '#ec4899', preview: 'bg-pink-500' },
]

export const lightPalettes: { id: LightPalette; name: string; primary: string; preview: string }[] = [
  { id: 'professional-blue', name: 'Professional Blue', primary: '#2563eb', preview: 'bg-blue-600' },
  { id: 'forest-green', name: 'Forest Green', primary: '#059669', preview: 'bg-emerald-600' },
  { id: 'warm-orange', name: 'Warm Orange', primary: '#ea580c', preview: 'bg-orange-600' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#7c3aed', preview: 'bg-violet-600' },
]
