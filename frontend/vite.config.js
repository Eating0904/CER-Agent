/* eslint-disable no-underscore-dangle */
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        base: '/',
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            host: '127.0.0.1',
            port: 3001,
            proxy: {
                '/api': {
                    target: env.VITE_API_SERVER,
                    changeOrigin: true,
                    secure: false,
                },
                '/media': {
                    target: env.VITE_MEDIA_SERVER,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
