import * as p2 from 'p2-es'
import React from 'react'
import { SandboxFunction } from '../../src'
import { App } from '../../src/components/App'

export const SandboxSettings = () => {
    const fn: SandboxFunction = (context) => {
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

        // Frame demo
        context.frame(0, 0, 4, 4)

        return {
            world,
            settings: {
                drawAABBs: true,
            },
        }
    }

    return <App title="Sandbox Settings" setup={fn} />
}

export default {
    name: 'SandboxSettings',
    component: SandboxSettings,
}
