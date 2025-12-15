import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { copyFileSync } from 'fs'

// Plugin to create 404.html for GitHub Pages SPA routing
const create404Plugin = () => ({
  name: 'create-404',
  closeBundle() {
    const distPath = path.resolve(__dirname, 'dist')
    copyFileSync(
      path.resolve(distPath, 'index.html'),
      path.resolve(distPath, '404.html')
    )
  }
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'

  return {
    base: '/prosurf_admin/',
    plugins: [react(), create404Plugin()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
        },
        '/static': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
      allowedHosts: [
        'qvenge.github.io'
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      // Disable inlining svg icon as Base64
      assetsInlineLimit: 0,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/shared/lib/style-utils" as utils;\n'
            + '@use "@/shared/ds" as ds;\n',
        },
      },
    },
  }
})
