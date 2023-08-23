import * as p2 from 'p2-es'
import React, { useEffect, useRef } from 'react'
import { Sandbox, SandboxFunction } from '../../src'
import { App } from '../../src/app'

export const SandboxSettings = () => {
    const ref = useRef<HTMLDivElement>(null!)

    useEffect(() => {
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

        const sandbox = new Sandbox(fn, { title: "Settings" })

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
    name: 'SandboxSettings',
    component: SandboxSettings,
}
