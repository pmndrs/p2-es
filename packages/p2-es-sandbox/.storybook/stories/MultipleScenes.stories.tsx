import * as p2 from 'p2-es'
import React from 'react'
import { SandboxContext } from '../../src'
import { App } from '../../src/components/App'

export const MultipleScenes = () => {
    const common = (context: SandboxContext) => {
        // Create world
        const world = new p2.World({
            gravity: [0, -5],
        })

        // Create bottom plane
        const plane = new p2.Body({
            position: [0, -0.5],
        })
        plane.addShape(new p2.Plane())
        world.addBody(plane)

        // Frame demo
        context.frame(0, 0, 4, 4)

        return world
    }

    const sphere = (context: SandboxContext) => {
        const world = common(context)

        const body = new p2.Body({
            mass: 1,
            position: [0, 1],
        })
        body.addShape(
            new p2.Circle({
                radius: 0.2,
            })
        )
        world.addBody(body)

        return { world }
    }

    const box = (context: SandboxContext) => {
        const world = common(context)

        const body = new p2.Body({
            mass: 1,
            position: [0, 1],
        })
        body.addShape(
            new p2.Box({
                width: 0.4,
                height: 0.4,
            })
        )
        world.addBody(body)

        return { world }
    }

    return (
        <App
            title="Multiple Scenes"
            setup={{
                'Falling Sphere': { setup: sphere },
                'Falling Box': { setup: box },
            }}
            codeLink=""
        />
    )
}

export default {
    name: 'MultipleScenes',
    component: MultipleScenes,
}
