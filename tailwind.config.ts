import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        accent: {
          bg: 'var(--accent-bg)',
          text: 'var(--accent-text)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        'focus-ring': 'var(--focus-ring)',
        ring: 'var(--focus-ring)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '100': '25rem', // 400px
        '175': '43.75rem', // 700px
      },
      height: {
        '100': '25rem', // 400px
        '175': '43.75rem', // 700px
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
