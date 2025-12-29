/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary tech/AI palette
        primary: {
          50: '#f0f4ff',
          100: '#e6ecff',
          200: '#c7d9ff',
          300: '#a8c7ff',
          400: '#7fa8ff',
          500: '#5b87ff',
          600: '#4a6fff',
          700: '#3857d9',
          800: '#2d45ad',
          900: '#243582',
        },
        // Secondary accent - neon purple
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Dark mode base
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#0f1419',
          950: '#07080e',
        },
        // Cyberpunk gradient stops
        cyber: {
          blue: '#00d9ff',
          purple: '#d000ff',
          pink: '#ff006e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-tech': 'linear-gradient(135deg, #5b87ff 0%, #a855f7 50%, #ff006e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f1419 0%, #1f2937 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(91, 135, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.3)',
        'tech': '0 0 0 1px rgba(91, 135, 255, 0.2), 0 0 20px rgba(91, 135, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
