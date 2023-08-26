import * as p2 from 'p2-es'
import React, { useEffect, useRef } from 'react'
import { Sandbox } from '../../src'

export const CanvasOnly = () => {
    const ref = useRef<HTMLDivElement>(null!)

    useEffect(() => {
        const sandbox = new Sandbox((context) => {
            // Create the world
            const world = new p2.World({
                gravity: [0, -5],
            })

            // Create circle body
            const body = new p2.Body({
                mass: 1,
                position: [0, 3],
            })
            body.addShape(new p2.Circle({ radius: 0.5 }))
            world.addBody(body)

            // Create bottom plane
            const plane = new p2.Body({
                position: [0, -1],
            })
            plane.addShape(new p2.Plane())
            world.addBody(plane)

            // Frame demo
            context.frame(0, 0, 4, 4)

            return { world }
        }, {
            showControls: false,
            showHeader: false,
            enablePanning: false,
        })

        sandbox.mount(ref.current)

        return () => {
            sandbox.unmount()
        }
    })

    return (
        <div
            ref={ref}
            style={{
                width: '500px',
                height: '500px',
            }}
        ></div>
    )
}

export default {
    name: 'CanvasOnly',
    component: CanvasOnly,
}
