import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'Noto Serif TC', 'serif'],
        sans: ['Inter', 'Noto Sans TC', 'ui-sans-serif', 'system-ui'],
        handwriting: ['var(--font-handwriting)', 'var(--font-maszheng)', 'LXGW WenKai TC', 'Ma Shan Zheng', 'cursive'],
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px'
      }
    }
  },
  plugins: []
};

export default config;
