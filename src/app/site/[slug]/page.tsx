import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import SiteTemplate from '@/components/tactical-reactor/site-template'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('tr_sites')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) return { title: 'Not Found' }

  const fullAddress = [site.address_street, site.address_city, site.address_state, site.address_zip]
    .filter(Boolean)
    .join(', ')

  return {
    title: site.meta_title || `${site.business_name} â ${site.tagline || site.industry}`,
    description: site.meta_description || site.description || `${site.business_name} in ${site.address_city}, ${site.address_state}`,
    keywords: site.keywords || [],
    openGraph: {
      title: site.business_name,
      description: site.description || site.tagline || '',
      type: 'website',
      locale: 'en_US',
      images: site.hero_image_url ? [{ url: site.hero_image_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.business_name,
      description: site.description || site.tagline || '',
    },
    other: {
      'geo.region': `US-${site.address_state}`,
      'geo.placename': site.address_city || '',
      'geo.position': site.latitude && site.longitude ? `${site.latitude};${site.longitude}` : '',
      'ICBM': site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : '',
    },
  }
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch site data
  const { data: site } = await supabase
    .from('tr_sites')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!site) notFound()

  // Fetch related data in parallel
  const [servicesRes, testimonialsRes, imagesRes] = await Promise.all([
    supabase
      .from('tr_services')
      .select('*')
      .eq('site_id', site.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('tr_testimonials')
      .select('*')
      .eq('site_id', site.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('tr_images')
      .select('*')
      .eq('site_id', site.id)
      .order('sort_order', { ascending: true }),
  ])

  const services = servicesRes.data || []
  const testimonials = testimonialsRes.data || []
  const images = imagesRes.data || []

  // Build JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.business_name,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    url: site.website_url,
    image: site.hero_image_url || site.logo_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address_street,
      addressLocality: site.address_city,
      addressRegion: site.address_state,
      postalCode: site.address_zip,
      addressCountry: site.address_country || 'US',
    },
    ...(site.latitude && site.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: site.latitude,
            longitude: site.longitude,
          },
          areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
              '@type': 'GeoCoordinates',
              latitude: site.latitude,
              longitude: site.longitude,
            },
            geoRadius: `${site.service_radius_miles || 25} mi`,
          },
        }
      : {}),
    ...(site.business_hours && Object.keys(site.business_hours).length > 0
      ? {
          openingHoursSpecification: Object.entries(site.business_hours as Record<string, { open: string; close: string }>).map(
            ([day, hours]) => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
              opens: hours.open,
              closes: hours.close,
            })
          ),
        }
      : {}),
    ...(testimonials.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (
              testimonials.reduce((sum: number, t: any) => sum + (t.rating || 5), 0) / testimonials.length
            ).toFixed(1),
            reviewCount: testimonials.length,
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteTemplate
        site={site}
        services={services}
        testimonials={testimonials}
        images={images}
      />
    </>
  )
}
