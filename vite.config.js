import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // On le gère manuellement dans main.jsx via virtual:pwa-register
      
      // 1. Mise en cache des icônes PWA de base pour le hors-ligne
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      
      // 2. Configuration Workbox pour les images statiques et dynamiques
      workbox: {
        // Cache tous les fichiers statiques de base
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 5000000,
        
        // Configuration du cache dynamique pour les images de la base de données
        runtimeCaching: [
          {
            // Intercepte les requêtes d'images
            urlPattern: ({ request, url }) => request.destination === 'image' || url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp|gif)$/i),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'djago-dynamic-images',
              expiration: {
                maxEntries: 50, // Garde les 50 dernières images
                maxAgeSeconds: 60 * 60 * 24 * 30, // Expire après 30 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },

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