import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
          BootstrapVueNextResolver()
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
            console.log('Target URL:', proxyReq.path);
            console.log('Request Headers:', req.headers);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Response from Target:', proxyRes.statusCode, req.url);
            console.log('Response Headers:', proxyRes.headers);
            if (proxyRes.statusCode === 401) {
              console.log('Authentication failed - check token and roles');
            }
          });
        }
      }
    }
  }
})
