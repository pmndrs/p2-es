import react from '@vitejs/plugin-react'
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
    plugins: [react()],
    base: './',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: createEntrypoints([
                'buoyancy.html',
                'car.html',
                'ccd.html',
                'circles.html',
                'collisions.html',
                'compound.html',
                'concave.html',
                'constraints.html',
                'control.html',
                'distanceConstraint.html',
                'fixedRotation.html',
                'fixedXY.html',
                'friction.html',
                'gearConstraint.html',
                'hasActiveBodies.html',
                'heightfield.html',
                'islandSolver.html',
                'kinematic.html',
                'lock.html',
                'piston.html',
                'prismatic.html',
                'ragdoll.html',
                'removeSensor.html',
                'restitution.html',
                'friction.html',
                'segway.html',
                'sleep.html',
                'slingshot.html',
                'softWheel.html',
                'springs.html',
                'surfaceVelocity.html',
                'suspension.html',
                'tearable.html',
                'topDownVehicle.html',
                'voronoi.html',
            ]),
        },
    },
    root: ROOT,
})
