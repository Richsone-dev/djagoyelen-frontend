import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // On force esbuild et on désactive lightningcss explicitement
    cssMinifier: 'esbuild', 
    minify: 'esbuild',
    outDir: 'dist'
  },
  css: {
    transformer: 'postcss',
    lightningcss: false // On lui dit explicitement de ne PAS l'utiliser
  }
})
