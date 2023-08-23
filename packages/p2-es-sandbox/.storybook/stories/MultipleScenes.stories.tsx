import * as p2 from 'p2-es'
import React, { useEffect, useRef } from 'react'
import { Sandbox, SandboxContext } from '../../src'

export const MultipleScenes = () => {
    const ref = useRef<HTMLDivElement>(null!)

    useEffect(() => {
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

        const setup = {
            'Falling Sphere': { setup: sphere },
            'Falling Box': { setup: box },
        }

        const title = 'Multiple Scenes'

        const codeLink = ''

        const sandbox = new Sandbox(setup, { title, codeLink })

        sandbox.mount(ref.current)

        return () => {
            sandbox.unmount()
        }
    }, [])

    return (
        <div
            ref={ref}
            style={{
                width: '100%',
                height: '100vh',
            }}
        ></div>
    )
}

export default {
    name: 'MultipleScenes',
    component: MultipleScenes,
}
