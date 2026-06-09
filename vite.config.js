import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Esta cabecera permite que los popups de autenticación (como Google) se comuniquen con la app
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
