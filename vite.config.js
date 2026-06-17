import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // On le gère manuellement dans main.jsx via virtual:pwa-register
      manifest: {
        name: 'DjagoYelen - Gestion Financière',
        short_name: 'DjagoYelen',
        description: 'Solution moderne de gestion financière et de suivi pour les petites et moyennes entreprises.',
        //theme_color: '#1e5f38',
        theme_color: '#0A3B2F',
        //background_color: '#ffffff',
        background_color: '#1e5f38',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        categories: ['finance', 'business'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist',
    minify: 'esbuild'
  },

  css: {
    transformer: 'postcss'
  }
})