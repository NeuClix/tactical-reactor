import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/theme-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeuClix Tactical Reactor',
  description: 'Comprehensive SaaS platform for business intelligence and content creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
