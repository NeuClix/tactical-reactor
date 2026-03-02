'use client'

import { useState, useEffect } from 'react'
import {
  Phone, Mail, MapPin, Clock, Star, ChevronRight,
  Menu, X, Facebook, Instagram, Linkedin, Youtube,
  Shield, Award, ThumbsUp, ArrowUp
} from 'lucide-react'

// ============================================================
// Types
// ============================================================
interface Site {
  id: string
  slug: string
  business_name: string
  tagline: string | null
  description: string | null
  phone: string | null
  email: string | null
  website_url: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  latitude: number | null
  longitude: number | null
  business_hours: Record<string, { open: string; close: string }> | null
  logo_url: string | null
  hero_image_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  google_business_url: string | null
  yelp_url: string | null
  show_map: boolean
  show_testimonials: boolean
  show_contact_form: boolean
  cta_text: string
  cta_phone_text: string
}

interface Service {
  id: string
  title: string
  description: string | null
  icon: string
  image_url: string | null
  price_range: string | null
  is_featured: boolean
}

interface Testimonial {
  id: string
  customer_name: string
  customer_location: string | null
  rating: number
  review_text: string
  service_type: string | null
}

interface SiteImage {
  id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  category: string
}

interface Props {
  site: Site
  services: Service[]
  testimonials: Testimonial[]
  images: SiteImage[]
}

// ============================================================
// Icon Map â maps string names to Lucide icons
// ============================================================
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  shield: Shield,
  award: Award,
  thumbsup: ThumbsUp,
  star: Star,
  phone: Phone,
  mail: Mail,
}

// ============================================================
// Main Component
// ============================================================
export default function SiteTemplate({ site, services, testimonials, images }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fullAddress = [site.address_street, site.address_city, site.address_state, site.address_zip]
    .filter(Boolean)
    .join(', ')

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : null

  const dayNames: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  }

  // CSS custom properties for theming
  const themeStyle = {
    '--color-primary': site.primary_color,
    '--color-secondary': site.secondary_color,
    '--color-accent': site.accent_color,
  } as React.CSSProperties

  return (
    <div style={themeStyle} className="min-h-screen bg-white text-gray-900">
      {/* ---- NAVIGATION ---- */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3">
            {site.logo_url && (
              <img src={site.logo_url} alt={site.business_name} className="h-10 w-auto" />
            )}
            <span className="text-xl font-bold" style={{ color: site.primary_color }}>
              {site.business_name}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Services</a>
            {site.show_testimonials && testimonials.length > 0 && (
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            )}
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: site.primary_color }}
              >
                {site.cta_phone_text || 'Call Now'}
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <a href="#services" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Services</a>
            {site.show_testimonials && testimonials.length > 0 && (
              <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Reviews</a>
            )}
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Contact</a>
            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="block text-center px-4 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: site.primary_color }}
              >
                {site.cta_phone_text || 'Call Now'} â {site.phone}
              </a>
            )}
          </div>
        )}
      </nav>

      {/* ---- HERO ---- */}
      <section
        id="hero"
        className="relative pt-16 min-h-[70vh] flex items-center"
        style={{
          backgroundImage: site.hero_image_url ? `url(${site.hero_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {site.hero_image_url && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        <div className={`relative z-10 max-w-6xl mx-auto px-4 py-20 ${site.hero_image_url ? 'text-white' : ''}`}>
          <div className="max-w-2xl">
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      fill={i <= Math.round(Number(avgRating)) ? site.secondary_color : 'transparent'}
                      stroke={site.secondary_color}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium opacity-90">
                  {avgRating} stars Â· {testimonials.length} reviews
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              {site.business_name}
            </h1>

            {site.tagline && (
              <p className="text-xl md:text-2xl opacity-90 mb-6">{site.tagline}</p>
            )}

            {site.description && (
              <p className="text-lg opacity-80 mb-8 max-w-xl">{site.description}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {site.phone && (
                <a
                  href={`tel:${site.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: site.primary_color }}
                >
                  <Phone className="w-5 h-5" />
                  {site.cta_text || 'Get a Free Quote'}
                </a>
              )}
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold border-2 transition-colors hover:bg-white/10"
                style={{
                  borderColor: site.hero_image_url ? 'white' : site.primary_color,
                  color: site.hero_image_url ? 'white' : site.primary_color,
                }}
              >
                Our Services
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- SERVICES ---- */}
      {services.length > 0 && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ color: site.primary_color }}>
                Our Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional solutions tailored to your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => {
                const IconComponent = ICON_MAP[service.icon.toLowerCase()] || Shield
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                      service.is_featured ? 'ring-2' : 'border border-gray-100'
                    }`}
                    style={service.is_featured ? { borderColor: site.secondary_color, ringColor: site.secondary_color } : {}}
                  >
                    {service.is_featured && (
                      <span
                        className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white mb-3"
                        style={{ backgroundColor: site.secondary_color }}
                      >
                        Most Popular
                      </span>
                    )}

                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${site.primary_color}15` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: site.primary_color }} />
                      </div>
                    )}

                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    )}
                    {service.price_range && (
                      <p className="mt-3 text-sm font-medium" style={{ color: site.accent_color }}>
                        {service.price_range}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---- TESTIMONIALS ---- */}
      {site.show_testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ color: site.primary_color }}>
                What Our Customers Say
              </h2>
              {avgRating && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        fill={i <= Math.round(Number(avgRating)) ? site.secondary_color : 'transparent'}
                        stroke={site.secondary_color}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">{avgRating} average from {testimonials.length} reviews</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(testimonial => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i <= testimonial.rating ? site.secondary_color : 'transparent'}
                        stroke={site.secondary_color}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    &ldquo;{testimonial.review_text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: site.primary_color }}
                    >
                      {testimonial.customer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.customer_name}</p>
                      {testimonial.customer_location && (
                        <p className="text-gray-500 text-xs">{testimonial.customer_location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- CONTACT ---- */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: site.primary_color }}>
              Get In Touch
            </h2>
            <p className="text-gray-600">Ready to get started? Contact us today.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-4 group">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: site.primary_color }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold group-hover:underline">{site.phone}</p>
                  </div>
                </a>
              )}

              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-4 group">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: site.primary_color }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold group-hover:underline">{site.email}</p>
                  </div>
                </a>
              )}

              {fullAddress && (
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: site.primary_color }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold">{fullAddress}</p>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {site.business_hours && Object.keys(site.business_hours).length > 0 && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: site.primary_color }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Business Hours</p>
                    <div className="space-y-1">
                      {Object.entries(site.business_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between gap-8 text-sm">
                          <span className="font-medium">{dayNames[day] || day}</span>
                          <span className="text-gray-600">{hours.open} â {hours.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex gap-3 pt-4">
                {site.facebook_url && (
                  <a href={site.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Facebook className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {site.instagram_url && (
                  <a href={site.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Instagram className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {site.linkedin_url && (
                  <a href={site.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Linkedin className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {site.youtube_url && (
                  <a href={site.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Youtube className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            {site.show_contact_form && (
              <form
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  // TODO: Hook to n8n webhook or Supabase function
                  alert('Thank you! We will get back to you shortly.')
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                      style={{ '--tw-ring-color': site.primary_color } as any}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                      placeholder="Your phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-white font-semibold transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: site.primary_color }}
                >
                  {site.cta_text || 'Get a Free Quote'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ---- MAP ---- */}
      {site.show_map && site.latitude && site.longitude && (
        <section id="map" className="h-80">
          <iframe
            title={`${site.business_name} location`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${site.latitude},${site.longitude}&zoom=14`}
          />
        </section>
      )}

      {/* ---- FOOTER ---- */}
      <footer className="py-8 text-white" style={{ backgroundColor: site.primary_color }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">{site.business_name}</p>
          {fullAddress && <p className="text-sm opacity-80 mb-1">{fullAddress}</p>}
          {site.phone && <p className="text-sm opacity-80">{site.phone}</p>}
          <p className="text-xs opacity-60 mt-4">
            &copy; {new Date().getFullYear()} {site.business_name}. All rights reserved.
          </p>
          <p className="text-xs opacity-40 mt-1">
            Powered by NeuClix Tactical Reactor
          </p>
        </div>
      </footer>

      {/* ---- BACK TO TOP ---- */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 z-40"
          style={{ backgroundColor: site.primary_color }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* ---- STICKY MOBILE CTA ---- */}
      {site.phone && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t shadow-lg p-3 z-50">
          <a
            href={`tel:${site.phone}`}
            className="block text-center py-3 rounded-lg text-white font-semibold text-lg"
            style={{ backgroundColor: site.primary_color }}
          >
            <Phone className="w-5 h-5 inline mr-2" />
            {site.cta_phone_text || 'Call Now'} â {site.phone}
          </a>
        </div>
      )}
    </div>
  )
}
