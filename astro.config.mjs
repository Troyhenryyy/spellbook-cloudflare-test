// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Preact goes here (Astro Integration)
  integrations: [preact()],

  // Tailwind v4 goes here (Vite Plugin)
  vite: {
    plugins: [tailwindcss()],
  },

  // This silences the "Server Routes" warning for now
  output: 'server',

  adapter: cloudflare(),
});