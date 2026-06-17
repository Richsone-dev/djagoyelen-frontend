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
      
      // 2. Configuration Workbox pour les images statiques, dynamiques ET les polices d'icônes
      workbox: {
        // Cache tous les fichiers statiques de base ET les polices locales (woff, woff2, tttf)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 5000000,
        
        // Configuration du cache dynamique
        runtimeCaching: [
          {
            // Intercepte les requêtes d'images (statiques et base de données)
            urlPattern: ({ request, url }) => request.destination === 'image' || url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp|gif)$/i),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'djago-images-cache',
              expiration: {
                maxEntries: 100, 
                maxAgeSeconds: 60 * 60 * 24 * 30, // Expire après 30 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Intercepte et cache les polices d'icônes (sécurité supplémentaire pour les CDN)
            urlPattern: ({ request, url }) => request.destination === 'font' || url.pathname.match(/\.(?:woff|woff2|ttf|eot)$/i) || url.host.includes('jsdelivr') || url.host.includes('cdnjs'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'djago-fonts-icons',
              expiration: { 
                maxEntries: 20, 
                maxAgeSeconds: 60 * 60 * 24 * 365 // Gardé 1 an
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
        theme_color: '#0A3B2F',
        background_color: '#0A3B2F', // 👈 MODIFIÉ : Aligné sur ton vert foncé pour un splash screen natif fluide
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
            purpose: 'any maskable' // Assure que ton logo s'adapte parfaitement aux formes d'icônes d'Android
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