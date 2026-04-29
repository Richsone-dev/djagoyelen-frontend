import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // On force l'utilisation de PostCSS pour éviter les erreurs de syntaxe CSS
    transformer: 'postcss',
  },
  build: {
    // On utilise esbuild pour la minification du CSS au lieu de lightningcss
    cssMinifier: 'esbuild',
  }
})