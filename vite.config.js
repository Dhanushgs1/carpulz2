import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      {
        name: 'redirect-to-admin',
        configureServer(server) {
          if (mode === 'admin') {
            server.middlewares.use((req, res, next) => {
              if (req.url === '/') {
                req.url = '/admin.html';
              }
              next();
            });
          }
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html')
        }
      }
    }
  };
});
