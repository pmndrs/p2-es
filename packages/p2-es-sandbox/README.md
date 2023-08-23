# @p2-es/sandbox

`@p2-es/sandbox` is a demo renderer for p2-es.

## Installation

```sh
npm install @p2-es/sandbox
```

## Usage

```js
import { Sandbox } from '@p2-es/sandbox'
import * as p2 from 'p2-es'

const sandbox = new Sandbox(({ frame }) => {
    const enablePositionNoise = true // Add some noise in circle positions
    const N = 15 // Number of circles in x direction
    const M = 15 // and in y
    const r = 0.07 // circle radius
    const d = 2.2 // Distance between circle centers

    // Create the world
    const world = new p2.World({
        gravity: [0, -5],
    })

    // Set stiffness of all contacts and constraints
    world.setGlobalStiffness(1e8)

    // Max number of solver iterations to do
    world.solver.iterations = 20

    // Solver error tolerance
    world.solver.tolerance = 0.02

    // Enables sleeping of bodies
    world.sleepMode = p2.World.BODY_SLEEPING

    // Create circle bodies
    for (let i = 0; i < N; i++) {
        for (let j = M - 1; j >= 0; j--) {
            const x = (i - N / 2) * r * d + (enablePositionNoise ? Math.random() * r : 0)
            const y = (j - M / 2) * r * d
            const p = new p2.Body({
                mass: 1,
                position: [x, y],
            })
            p.addShape(new p2.Circle({ radius: r }))
            p.allowSleep = true
            p.sleepSpeedLimit = 1 // Body will feel sleepy if speed<1 (speed is the norm of velocity)
            p.sleepTimeLimit = 1 // Body falls asleep after 1s of sleepiness
            world.addBody(p)
        }
    }

    // Compute max/min positions of circles
    const xmin = (-N / 2) * r * d
    const xmax = (N / 2) * r * d
    const ymin = (-M / 2) * r * d
    const ymax = (M / 2) * r * d

    // Create bottom plane
    const plane = new p2.Body({
        position: [0, ymin],
    })
    plane.addShape(new p2.Plane())
    world.addBody(plane)

    // Left plane
    const planeLeft = new p2.Body({
        angle: -Math.PI / 2,
        position: [xmin, 0],
    })
    planeLeft.addShape(new p2.Plane())
    world.addBody(planeLeft)

    // Right plane
    const planeRight = new p2.Body({
        angle: Math.PI / 2,
        position: [xmax, 0],
    })
    planeRight.addShape(new p2.Plane())
    world.addBody(planeRight)

    // Frame demo
    frame(0, 0, 4, 4)

    return { world }
})

sandbox.mount(document.querySelector('#app'))
```
