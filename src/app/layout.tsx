import type { Metadata } from 'next'
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
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
