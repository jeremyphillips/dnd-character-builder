import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //       secure: false
  //     }
  //   }
  // },
  resolve: {
    alias: {
      "@/components/elements": path.resolve(__dirname, "src/components/elements"),
      "@/components/modules": path.resolve(__dirname, "src/components/modules"),
      "@/data": path.resolve(__dirname, "src/data"),
      "@/helpers": path.resolve(__dirname, "src/helpers"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/services": path.resolve(__dirname, "src/services"),
    }
  }
})
