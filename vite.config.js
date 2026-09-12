import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: { 
    outDir: 'dist', 
    assetsDir: 'assets', 
    sourcemap: false,
    rollupOptions: {
      input: ['./index.html'],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: { port: 5173 },
  esbuild: { legalComments: 'none' }
});
