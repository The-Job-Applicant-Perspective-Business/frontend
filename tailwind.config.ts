import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/blocks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)', // Maps the #081F48 hex from MainFooter
        },
        accent: {
          DEFAULT: 'var(--accent-bg)',
          foreground: 'var(--accent-text)',
        },
        'focus-ring': 'var(--focus-ring)',
      },
      spacing: {
        '100': '25rem', // Replaces h-[400px] from TabbedInterface
        '175': '43.75rem', // Replaces h-[700px] from TabbedInterface
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
