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
        // Primary - Neuclix Yellow (#efc772)
        primary: {
          50: '#fef9ec',
          100: '#fdf3d4',
          200: '#fbe7a9',
          300: '#f8da7d',
          400: '#f4ce52',
          500: '#efc772', // Brand yellow
          600: '#d9a848',
          700: '#b88a3d',
          800: '#956f33',
          900: '#755629',
        },
        // Secondary accent - Neuclix Green (#00ac4e)
        accent: {
          50: '#e6f7ed',
          100: '#ccefdb',
          200: '#99dfb7',
          300: '#66cf93',
          400: '#33bf6f',
          500: '#00ac4e', // Brand green
          600: '#009a46',
          700: '#00833b',
          800: '#006c30',
          900: '#005525',
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
          800: '#231f20', // Brand dark grey
          900: '#0f1419',
          950: '#07080e',
        },
        // Brand colors for convenience
        brand: {
          yellow: '#efc772',
          green: '#00ac4e',
          dark: '#231f20',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-tech': 'linear-gradient(135deg, #00ac4e 0%, #66cf93 50%, #efc772 100%)', // Green to Yellow
        'gradient-dark': 'linear-gradient(135deg, #07080e 0%, #231f20 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(239, 199, 114, 0.3)', // Yellow glow
        'glow-green': '0 0 20px rgba(0, 172, 78, 0.3)', // Green glow
        'glow-yellow': '0 0 20px rgba(239, 199, 114, 0.3)', // Yellow glow
        'tech': '0 0 0 1px rgba(0, 172, 78, 0.2), 0 0 20px rgba(239, 199, 114, 0.1)', // Green border, yellow glow
      },
    },
  },
  plugins: [],
}
