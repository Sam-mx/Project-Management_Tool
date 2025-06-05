import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // <-- This makes Vite listen on 0.0.0.0 (all interfaces)
    port: 3000,         // <-- Match your desired port
    watch: {
      usePolling: true, // <-- Recommended for Docker
    },
  },
});
