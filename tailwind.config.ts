import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#121829',
        card: '#162036',
        border: '#1e2a40',
        primary: {
          DEFAULT: '#00d2b4',
          foreground: '#03171f',
          muted: '#0d9488',
        },
        accent: {
          DEFAULT: '#f59e0b',
          teal: '#00d2b4',
          amber: '#f59e0b',
          coral: '#f43f5e',
          cyan: '#00f2fe',
        },
        muted: {
          DEFAULT: '#1e2a40',
          foreground: '#94a3b8',
        },
        profit: '#00e676',
        loss: '#ef4444',
        success: '#00e676',
        warning: '#f59e0b',
        danger: '#ef4444',
        gold: '#f59e0b',
        zinc: {
          850: '#162036',
          950: '#0a0e1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(16, 185, 129, 0.25)',
        'glow-sm': '0 0 12px rgba(16, 185, 129, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
