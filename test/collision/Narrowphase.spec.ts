import { Narrowphase } from '../../src/collision/Narrowphase'
import { ContactEquation } from '../../src/equations/ContactEquation'
import { FrictionEquation } from '../../src/equations/FrictionEquation'
import { ContactMaterial } from '../../src/material/ContactMaterial'
import { Material } from '../../src/material/Material'
import * as vec2 from '../../src/math/vec2'
import { Body } from '../../src/objects/Body'
import { Box } from '../../src/shapes/Box'
import { Capsule } from '../../src/shapes/Capsule'
import { Circle } from '../../src/shapes/Circle'
import { Convex } from '../../src/shapes/Convex'
import { Line } from '../../src/shapes/Line'
import { Particle } from '../../src/shapes/Particle'
import { Plane } from '../../src/shapes/Plane'

let rect: Box,
    circle: Circle,
    convex: Convex,
    capsule: Capsule,
    plane: Plane,
    line: Line,
    particle: Particle,
    narrowphase: Narrowphase,
    bodyA: Body,
    bodyB: Body

const position = [0, 0]
const angle = 0

describe('collision: Narrowphase', () => {
    beforeEach(() => {
        // Rect
        rect = new Box()

        // Circle
        const verts = []
        const N = 50
        for (let i = 0; i < N; i++) {
            verts.push(vec2.fromValues(Math.cos(((2 * Math.PI) / N) * i), Math.sin(((2 * Math.PI) / N) * i)))
        }
        circle = new Circle({ radius: 1 })
        convex = new Convex({ vertices: verts })
        capsule = new Capsule({ length: 1, radius: 1 })
        plane = new Plane()
        particle = new Particle()
        line = new Line()

        narrowphase = new Narrowphase()
        narrowphase.currentContactMaterial = new ContactMaterial(new Material(), new Material())

        bodyA = new Body()
        bodyB = new Body()
    })

    test('construct', () => {
        new Narrowphase()
    })

    test('capsuleCapsule', () => {
        let result = narrowphase.capsuleCapsule(bodyA, capsule, position, angle, bodyB, capsule, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.capsuleCapsule(bodyA, capsule, position, angle, bodyB, capsule, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('planeCapsule', () => {
        let result = narrowphase.planeCapsule(bodyA, plane, position, angle, bodyB, capsule, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.planeCapsule(bodyA, plane, position, angle, bodyB, capsule, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circleCapsule', () => {
        let result = narrowphase.circleCapsule(bodyA, circle, position, angle, bodyB, capsule, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circleCapsule(bodyA, circle, position, angle, bodyB, capsule, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circleCircle', () => {
        let result = narrowphase.circleCircle(bodyA, circle, position, angle, bodyB, circle, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circleCircle(bodyA, circle, position, angle, bodyB, circle, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circleConvex', () => {
        let result = narrowphase.circleConvex(bodyA, circle, position, angle, bodyB, convex, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circleConvex(bodyA, circle, position, angle, bodyB, convex, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circleLine', () => {
        let result = narrowphase.circleLine(bodyA, circle, position, angle, bodyB, line, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circleLine(bodyA, circle, position, angle, bodyB, line, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circleParticle', () => {
        let result = narrowphase.circleParticle(bodyA, circle, position, angle, bodyB, particle, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circleParticle(bodyA, circle, position, angle, bodyB, particle, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('circlePlane', () => {
        let result = narrowphase.circlePlane(bodyA, circle, position, angle, bodyB, plane, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.circlePlane(bodyA, circle, position, angle, bodyB, plane, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('collidedLastStep', () => {
        expect(typeof narrowphase.collidedLastStep(bodyA, bodyB)).toBe('boolean')
    })

    test('convexCapsule', () => {
        let result = narrowphase.convexCapsule(bodyA, convex, position, angle, bodyB, capsule, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.convexCapsule(bodyA, convex, position, angle, bodyB, capsule, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('convexConvex', () => {
        let result = narrowphase.convexConvex(bodyA, convex, position, angle, bodyB, convex, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.convexConvex(bodyA, convex, position, angle, bodyB, convex, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('convexLine', () => {
        let result = narrowphase.convexLine(bodyA, convex, position, angle, bodyB, line, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.convexLine(bodyA, convex, position, angle, bodyB, line, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('planeConvex', () => {
        let result = narrowphase.planeConvex(bodyA, plane, position, angle, bodyB, convex, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.planeConvex(bodyA, plane, position, angle, bodyB, convex, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('createContactEquation', () => {
        const contact = narrowphase.createContactEquation(bodyA, bodyB, plane, rect)
        expect(contact instanceof ContactEquation).toBe(true)
    })

    test('createFrictionEquation', () => {
        const eq = narrowphase.createFrictionEquation(bodyA, bodyB, plane, rect)
        expect(eq instanceof FrictionEquation).toBe(true)
    })

    test('lineCapsule', () => {
        let result = narrowphase.lineCapsule(bodyA, line, position, angle, bodyB, capsule, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.lineCapsule(bodyA, line, position, angle, bodyB, capsule, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('lineLine', () => {
        let result = narrowphase.lineLine(bodyA, line, position, angle, bodyB, line, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.lineLine(bodyA, line, position, angle, bodyB, line, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('lineBox', () => {
        let result = narrowphase.lineBox(bodyA, line, position, angle, bodyB, rect, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.lineBox(bodyA, line, position, angle, bodyB, rect, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('particleConvex', () => {
        let result = narrowphase.particleConvex(bodyA, particle, position, angle, bodyB, convex, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.particleConvex(bodyA, particle, position, angle, bodyB, convex, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('particlePlane', () => {
        let result = narrowphase.particlePlane(bodyA, particle, position, angle, bodyB, plane, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.particlePlane(bodyA, particle, position, angle, bodyB, plane, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('planeLine', () => {
        let result = narrowphase.planeLine(bodyA, plane, position, angle, bodyB, line, position, angle)
        expect(typeof result).toEqual('number')

        result = narrowphase.planeLine(bodyA, plane, position, angle, bodyB, line, position, angle, true)
        expect(typeof result).toEqual('number')
    })

    test('bodiesOverlap: simple', () => {
        bodyA.addShape(new Circle({ radius: 1 }))
        bodyB.addShape(new Circle({ radius: 1 }))
        expect(narrowphase.bodiesOverlap(bodyA, bodyB)).toBe(true)
        bodyB.position[0] = 10
        expect(narrowphase.bodiesOverlap(bodyA, bodyB)).toBe(false)
    })

    test('bodiesOverlap: withMask', () => {
        bodyA.addShape(new Circle({ radius: 1, collisionGroup: 1, collisionMask: 1 }))
        bodyB.addShape(new Circle({ radius: 1, collisionGroup: 2, collisionMask: 2 }))
        expect(narrowphase.bodiesOverlap(bodyA, bodyB, true)).toBe(false)

        bodyB.shapes[0].collisionGroup = bodyB.shapes[0].collisionMask = 1
        expect(narrowphase.bodiesOverlap(bodyA, bodyB, true)).toBe(true)
    })

    test('bodiesOverlap: differentOrder', () => {
        bodyA.addShape(new Box({ width: 1, height: 1 }))
        bodyB.addShape(new Circle({ radius: 1 }))

        expect(narrowphase.bodiesOverlap(bodyA, bodyB, true)).toBe(true)
        expect(narrowphase.bodiesOverlap(bodyB, bodyA, true)).toBe(true)
    })
})
