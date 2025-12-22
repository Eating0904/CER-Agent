import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        base: '/',
        plugins: [react()],
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
