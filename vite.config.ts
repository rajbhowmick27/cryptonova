import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/twitter-api': {
          target: 'https://api.twitter.com/2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/twitter-api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_TWITTER_BEARER_TOKEN}`);
              proxyReq.setHeader('Accept', 'application/json');
            });
          }
        }
      }
    }
  }
})