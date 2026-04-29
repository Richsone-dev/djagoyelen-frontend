import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    // On force esbuild et on désactive lightningcss explicitement
    cssMinifier: 'esbuild', 
    minify: 'esbuild',
  },
  css: {
    transformer: 'postcss',
    lightningcss: false // On lui dit explicitement de ne PAS l'utiliser
  }
})