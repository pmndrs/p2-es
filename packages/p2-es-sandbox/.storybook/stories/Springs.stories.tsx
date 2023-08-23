import * as p2 from 'p2-es'
import { GSSolver } from 'p2-es'
import React, { useEffect, useRef } from 'react'
import { Sandbox, SandboxContext } from '../../src'
import { App } from '../../src/app'

export const Springs = () => {
    const ref = useRef<HTMLDivElement>(null!)

    useEffect(() => {
        const fn = (context: SandboxContext) => {
            const world = new p2.World({
                gravity: [0, -5],
            })

            ;(world.solver as GSSolver).tolerance = 0.001

            const M = 10
            const l = 0.35

            // Create ground
            const planeShape = new p2.Plane()
            const plane = new p2.Body({
                position: [0, (-M / 2) * l * 1.05 - 0.1],
            })
            plane.addShape(planeShape)
            world.addBody(plane)

            // Create circle
            const radius = 1
            const circleShape = new p2.Circle({ radius: radius })
            const circle = new p2.Body({
                mass: 1,
                position: [0, (M / 2) * l * 1.05 + radius],
                angularVelocity: 1,
            })
            circle.addShape(circleShape)
            world.addBody(circle)

            // Create connected boxes
            const box1 = new p2.Body({
                mass: 1,
                position: [-3, (M / 2) * l * 1.05 + radius],
            })
            const box2 = new p2.Body({
                mass: 1,
                position: [-4, (M / 2) * l * 1.05 + radius],
                angularVelocity: -2,
            })
            box1.addShape(new p2.Box({ width: radius, height: radius }))
            box2.addShape(new p2.Box({ width: radius, height: radius }))
            world.addBody(box1)
            world.addBody(box2)
            const boxSpring = new p2.LinearSpring(box1, box2, {
                restLength: 1,
                stiffness: 10,
                localAnchorA: [0, 0.5],
                localAnchorB: [0, 0.5],
            })
            world.addSpring(boxSpring)

            // Create capsule
            const capsuleShape = new p2.Capsule({ length: 1, radius: 0.25 })
            const capsuleBody = new p2.Body({
                mass: 1,
                position: [4, 1],
            })
            capsuleBody.addShape(capsuleShape)
            world.addBody(capsuleBody)
            const capsuleSpring = new p2.LinearSpring(capsuleBody, plane, {
                restLength: 1,
                stiffness: 10,
                localAnchorA: [-capsuleShape.length / 2, 0],
                worldAnchorB: [4 - capsuleShape.length / 2, 2],
            })
            world.addSpring(capsuleSpring)

            // Create capsules connected with angular spring
            const capsuleShapeA = new p2.Capsule({ length: 1, radius: 0.2 })
            const capsuleShapeB = new p2.Capsule({ length: 1, radius: 0.2 })
            const capsuleBodyA = new p2.Body({
                mass: 1,
                position: [5, 0],
            })
            const capsuleBodyB = new p2.Body({
                mass: 1,
                position: [6, 0],
            })
            capsuleBodyA.addShape(capsuleShapeA)
            capsuleBodyB.addShape(capsuleShapeB)
            world.addBody(capsuleBodyA)
            world.addBody(capsuleBodyB)
            const rotationalSpring = new p2.RotationalSpring(capsuleBodyA, capsuleBodyB, {
                stiffness: 10,
                damping: 0.01,
            })
            world.addSpring(rotationalSpring)
            const revolute = new p2.RevoluteConstraint(capsuleBodyA, capsuleBodyB, {
                localPivotA: [0.5, 0],
                localPivotB: [-0.5, 0],
                collideConnected: false,
            })
            world.addConstraint(revolute)

            context.frame(1, 0, 15, 15)

            return { world }
        }

        const sandbox = new Sandbox(fn, { title: 'Springs' })

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
    name: 'Springs',
    component: Springs,
}
