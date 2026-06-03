import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        valo: {
          red: '#ff4655',
          dark: '#1a2332',
          black: '#0f1923',
          panel: '#252d3a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
