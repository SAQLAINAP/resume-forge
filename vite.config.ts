import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative base so the same build runs from a subpath, from file:// and
  // inside the Capacitor WebView without rebuilding.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Resume Forge — ATS Resume Builder',
        short_name: 'Resume Forge',
        description:
          'Build ATS-friendly resumes from real university and industry formats. Works completely offline.',
        theme_color: '#181b23',
        background_color: '#f6f7f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './index.html',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything. The app has no backend, so a full precache is
        // the entire offline story — first load online, every load after offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // docx is ~600KB and only pulled in when the user clicks "Word".
        manualChunks: (id) => (id.includes('node_modules/docx') ? 'docx' : undefined),
      },
    },
  },
})
