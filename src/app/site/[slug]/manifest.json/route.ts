import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('tr_sites')
    .select('business_name, pwa_name, pwa_short_name, pwa_theme_color, pwa_background_color, logo_url, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const manifest = {
    name: site.pwa_name || site.business_name,
    short_name: site.pwa_short_name || site.business_name,
    description: site.description || '',
    start_url: `/site/${slug}`,
    display: 'standalone',
    background_color: site.pwa_background_color || '#ffffff',
    theme_color: site.pwa_theme_color || '#1e40af',
    icons: site.logo_url
      ? [
          { src: site.logo_url, sizes: '192x192', type: 'image/png' },
          { src: site.logo_url, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
