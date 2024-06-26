import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
        react(),
    ],
    build: {
        lib: {
            entry: path.resolve('src/index.tsx'),
            name: '@p2-es/sandbox',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['p2-es'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'p2-es': 'p2',
                },
            },
        },
    },
})
