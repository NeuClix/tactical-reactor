import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Tactical Reactor by NeuClix - AI Marketing Fusion',
    template: '%s | Tactical Reactor',
  },
  description:
    'Tactical Reactor is a nuclear-powered AI marketing platform. Achieve critical mass with content fusion, lead fission, and marketing chain reactions.',
  keywords: [
    'AI marketing',
    'content fusion',
    'lead generation',
    'marketing automation',
    'tactical reactor',
    'neuclix',
  ],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
