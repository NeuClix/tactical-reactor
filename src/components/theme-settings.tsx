'use client'

import { useTheme, ThemeMode, DarkPalette, LightPalette } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Moon, Sun, Monitor, Check } from 'lucide-react'

const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'dark', label: 'Dark', icon: <Moon className="h-5 w-5" />, description: 'Always use dark theme' },
  { value: 'light', label: 'Light', icon: <Sun className="h-5 w-5" />, description: 'Always use light theme' },
  { value: 'system', label: 'System', icon: <Monitor className="h-5 w-5" />, description: 'Follow system preference' },
]

const darkPalettes: { value: DarkPalette; label: string; color: string; gradient: string }[] = [
  { value: 'cyberpunk-blue', label: 'Cyberpunk Blue', color: '#5b87ff', gradient: 'from-blue-500 via-purple-500 to-pink-500' },
  { value: 'cyberpunk-purple', label: 'Cyberpunk Purple', color: '#a855f7', gradient: 'from-purple-500 via-pink-500 to-orange-500' },
  { value: 'neon-cyan', label: 'Neon Cyan', color: '#06b6d4', gradient: 'from-cyan-500 via-blue-500 to-purple-500' },
  { value: 'hot-pink', label: 'Hot Pink', color: '#ec4899', gradient: 'from-pink-500 via-purple-500 to-blue-500' },
]

const lightPalettes: { value: LightPalette; label: string; color: string; gradient: string }[] = [
  { value: 'professional-blue', label: 'Professional Blue', color: '#2563eb', gradient: 'from-blue-600 to-indigo-600' },
  { value: 'forest-green', label: 'Forest Green', color: '#059669', gradient: 'from-green-600 to-teal-600' },
  { value: 'warm-orange', label: 'Warm Orange', color: '#ea580c', gradient: 'from-orange-600 to-amber-600' },
  { value: 'royal-purple', label: 'Royal Purple', color: '#7c3aed', gradient: 'from-purple-600 to-violet-600' },
]

export function ThemeSettings() {
  const {
    mode,
    setMode,
    darkPalette,
    setDarkPalette,
    lightPalette,
    setLightPalette,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    resolvedMode
  } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel of your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Theme Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 dark:text-dark-50">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map((themeMode) => (
              <button
                key={themeMode.value}
                onClick={() => setMode(themeMode.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
                  'hover:border-primary-500/50',
                  mode === themeMode.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-dark-700 dark:bg-dark-800/30 dark:hover:bg-dark-800/50'
                )}
              >
                {mode === themeMode.value && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                  </div>
                )}
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  mode === themeMode.value
                    ? 'bg-primary-500/20 text-primary-500 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-dark-700 dark:text-dark-300'
                )}>
                  {themeMode.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-dark-100">{themeMode.label}</span>
                <span className="text-xs text-center text-gray-500 dark:text-dark-400">{themeMode.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Theme Palette Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-dark-50">Dark Theme Palette</label>
            {resolvedMode === 'dark' && (
              <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-1 rounded">Active</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {darkPalettes.map((palette) => (
              <button
                key={palette.value}
                onClick={() => setDarkPalette(palette.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                  'hover:border-primary-500/50',
                  darkPalette === palette.value
                    ? 'border-primary-500 bg-gray-100 dark:bg-dark-800'
                    : 'border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-800/30'
                )}
              >
                {darkPalette === palette.value && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-3 w-3 text-primary-500 dark:text-primary-400" />
                  </div>
                )}
                <div
                  className={cn('h-8 w-8 rounded-full bg-gradient-to-br', palette.gradient)}
                  style={{ boxShadow: `0 0 12px ${palette.color}40` }}
                />
                <span className="text-xs font-medium text-center leading-tight text-gray-700 dark:text-dark-200">
                  {palette.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Light Theme Palette Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-dark-50">Light Theme Palette</label>
            {resolvedMode === 'light' && (
              <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-1 rounded">Active</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {lightPalettes.map((palette) => (
              <button
                key={palette.value}
                onClick={() => setLightPalette(palette.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                  'hover:border-primary-500/50',
                  lightPalette === palette.value
                    ? 'border-primary-500 bg-gray-100 dark:bg-dark-800'
                    : 'border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-800/30'
                )}
              >
                {lightPalette === palette.value && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-3 w-3 text-primary-500 dark:text-primary-400" />
                  </div>
                )}
                <div
                  className={cn('h-8 w-8 rounded-full bg-gradient-to-br', palette.gradient)}
                />
                <span className="text-xs font-medium text-center leading-tight text-gray-700 dark:text-dark-200">
                  {palette.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 dark:text-dark-50">Accessibility</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors',
                  highContrast ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-700'
                )} />
                <div className={cn(
                  'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                  highContrast && 'translate-x-4'
                )} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-dark-100">High contrast mode</span>
                <span className="text-xs text-gray-500 dark:text-dark-400">Increases text and border contrast</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => setReduceMotion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors',
                  reduceMotion ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-700'
                )} />
                <div className={cn(
                  'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                  reduceMotion && 'translate-x-4'
                )} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-dark-100">Reduce motion</span>
                <span className="text-xs text-gray-500 dark:text-dark-400">Disables animations and transitions</span>
              </div>
            </label>
          </div>
        </div>

        {/* Current Theme Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 dark:text-dark-50">Preview</label>
          <div className="rounded-lg border p-4 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[var(--palette-primary-hex)] to-purple-500" />
              <span className="text-sm text-gray-700 dark:text-dark-200">
                {resolvedMode === 'dark' ? 'Dark' : 'Light'} mode with{' '}
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {resolvedMode === 'dark'
                    ? darkPalettes.find(p => p.value === darkPalette)?.label
                    : lightPalettes.find(p => p.value === lightPalette)?.label
                  }
                </span>
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-8 rounded bg-[var(--palette-primary-hex)]" title="Primary" />
              <div className="h-8 rounded bg-gray-100 dark:bg-dark-900" title="Background" />
              <div className="h-8 rounded bg-gray-200 dark:bg-dark-800" title="Surface" />
              <div className="h-8 rounded bg-gray-300 dark:bg-dark-700" title="Border" />
              <div className="h-8 rounded bg-gray-400 dark:bg-dark-600" title="Muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
