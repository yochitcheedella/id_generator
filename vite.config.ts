import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // If you run a local Vercel dev server for the API on port 3000, uncomment this proxy.
    // proxy: {
    //   '/api': 'http://localhost:3000'
    // }
  }
});
