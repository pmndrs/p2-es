import { resolve } from 'path'
import { defineConfig } from 'vite'

const ROOT = './src'

const createEntrypoints = (entrypoints) => {
    const entries = {}
    for (const entrypoint of entrypoints) {
        entries[entrypoint] = resolve(__dirname, `${ROOT}/${entrypoint}`)
    }
    return entries
}

export default defineConfig({
    base: './',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: createEntrypoints([
                'canvas/asteroids.html',
                'canvas/box.html',
                'canvas/character.html',
                'canvas/circle.html',
                'canvas/interpolation.html',
                'canvas/mouseJoint.html',
                'canvas/platformer.html',
                'canvas/raycasting.html',
                'canvas/rayreflect.html',
                'canvas/sensors.html',
                'canvas/sensors2.html',
                'canvas/tapball.html',
                'canvas/worker.html',
                'dom/index.html',
                'pixijs/box.html',
            ]),
        },
    },
    root: ROOT,
})
