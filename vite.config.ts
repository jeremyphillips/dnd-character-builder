import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@/app': path.resolve(__dirname, './src/app'),
      '@/characterBuilder': path.resolve(__dirname, './src/features/characterBuilder'),
      '@/characterBuilder/context': path.resolve(__dirname, './src/features/characterBuilder/context'),
      "@/components/elements": path.resolve(__dirname, "src/components/elements"),
      "@/components/modules": path.resolve(__dirname, "src/components/modules"),
      "@/data": path.resolve(__dirname, "src/data"),
      "@/helpers": path.resolve(__dirname, "src/helpers"),
      "@/chat": path.resolve(__dirname, "src/features/chat"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@/shared": path.resolve(__dirname, "shared/types"),
      "@/steps": path.resolve(__dirname, "src/steps"),
    }
  }
})
