import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// Libraries that rarely change get their own chunks, so they stay cached across deployments
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          const pkg = id.split('node_modules/').pop() ?? ''
          return Object.entries(VENDOR_CHUNKS).find(([, packages]) =>
            packages.some((name) => pkg === name || pkg.startsWith(`${name}/`))
          )?.[0]
        },
      },
    },
  },
})
