import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Allows any ngrok or localtunnel URL to securely bounce through Vite
  }
});
