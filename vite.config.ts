/* Vite config for building the frontend react app: https://vite.dev/config/ */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    server: {
      host: '::',
      port: 8080,
    },
    experimental: {
      enableNativePlugin: true
    },
    build: {
      // Minificar apenas em produção
      minify: isProduction ? 'esbuild' : false,
      // Sourcemaps apenas em desenvolvimento
      sourcemap: !isProduction,
      // Otimizações de build
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Chunking strategy para melhor cache
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
            ],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }
          warn(warning)
        },
      },
      // Limites de tamanho (ajustar conforme necessário)
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode ?? process.env.NODE_ENV ?? 'production'),
      // Expor modo para uso no código
      'import.meta.env.MODE': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Otimizações de preview
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
})
