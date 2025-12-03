import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'

  return {
    base: '/prosurf_admin/',
    plugins: [react()],
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
