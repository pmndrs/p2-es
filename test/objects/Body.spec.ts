import { AABB } from '../../src/collision/AABB'
import * as vec2 from '../../src/math/vec2'
import { Body } from '../../src/objects/Body'
import { Box } from '../../src/shapes/Box'
import { Circle } from '../../src/shapes/Circle'
import { Plane } from '../../src/shapes/Plane'
import { World } from '../../src/world/World'

describe('Objects: Body', () => {
    test('construct', () => {
        // Static via mass=0
        let body = new Body({
            mass: 0,
        })
        expect(body.invMass).toEqual(0)
        expect(body.type).toEqual(Body.STATIC)

        // Setting things via options
        const o = {
            position: vec2.fromValues(0, 1),
            velocity: vec2.fromValues(1, 2),
            force: vec2.fromValues(3, 4),
            angularVelocity: 5,
            angularForce: 5,
            angle: Math.PI / 2,
        }
        body = new Body(o)
        expect(body.position).toEqual(o.position)
        expect(body.interpolatedPosition).toEqual(o.position)
        expect(body.previousPosition).toEqual(o.position)
        expect(body.velocity).toEqual(o.velocity)
        expect(body.force).toEqual(o.force)
        expect(body.angle).toEqual(o.angle)
        expect(body.previousAngle).toEqual(o.angle)
        expect(body.interpolatedAngle).toEqual(o.angle)
        expect(body.angularVelocity).toEqual(o.angularVelocity)
        expect(body.angularForce).toEqual(o.angularForce)

        // id tick
        expect(new Body().id).not.toEqual(new Body().id)
    })

    describe('addShape', () => {
        test('normal', () => {
            const body = new Body()
            const shape = new Circle({ radius: 1 })
            body.addShape(shape)
            expect(body.shapes).toEqual([shape])
        })

        test('duringStep', (done) => {
            const world = new World()
            const body = new Body()
            world.addBody(body)
            world.on('postBroadphase', function () {
                expect(function () {
                    body.addShape(new Circle())
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    test('adjustCenterOfMass', () => {
        const body = new Body()
        const shape = new Circle({ radius: 1 })
        body.addShape(shape, [1, 0], 0)
        body.adjustCenterOfMass()
        expect(body.position).toEqual(vec2.fromValues(1, 0))
        expect(body.shapes[0].position).toEqual(vec2.fromValues(0, 0))
    })

    test('applyDamping', () => {
        const body = new Body({
            mass: 1,
            velocity: [1, 0],
            angularVelocity: 1,
            damping: 0.5,
            angularDamping: 0.5,
        })

        body.applyDamping(1)

        expect(body.velocity).toEqual(vec2.fromValues(0.5, 0))
        expect(body.angularVelocity).toEqual(0.5)
    })

    describe('applyForce', () => {
        test('withPoint', () => {
            const body = new Body({ mass: 1, position: [2, 3] })
            const force = [0, 1]
            const point = [1, 0]

            body.applyForce(force, point)
            expect(body.force[0]).toEqual(0)
            expect(body.force[1]).toEqual(1)
            expect(body.angularForce).toEqual(1) // [1,0,0] cross [0,1,0] is [0,0,1]
        })

        test('withoutPoint', () => {
            const body = new Body({ mass: 1, position: [2, 3] })
            const force = [0, 1]

            body.applyForce(force)
            expect(body.force[0]).toEqual(0)
            expect(body.force[1]).toEqual(1)
            expect(body.angularForce).toEqual(0)
        })
    })

    describe('applyForceLocal', () => {
        test('withPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyForceLocal([-1, 0], [0, 1])
            expect(bodyA.angularForce > 0).toBe(true)
            expect(bodyA.force[0] > 0).toBe(true)
            expect(Math.abs(bodyA.force[1]) < 0.001).toBe(true)
        })

        test('withoutPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyForceLocal([-1, 0])
            expect(bodyA.angularForce).toEqual(0)
            expect(bodyA.force[0] > 0).toBe(true)
            expect(Math.abs(bodyA.force[1]) < 0.001).toBe(true)
        })
    })

    describe('applyImpulse', () => {
        test('withPoint', () => {
            const bodyA = new Body({ mass: 1, position: [2, 3] })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulse([-1, 0], [0, 1])
            expect(bodyA.angularVelocity !== 0).toBe(true)
            expect(bodyA.velocity[0] !== 0).toBe(true)
            expect(bodyA.velocity[1]).toEqual(0)
        })

        test('withoutPoint', () => {
            const bodyA = new Body({ mass: 1, position: [2, 3] })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulse([-1, 0])
            expect(bodyA.angularVelocity).toEqual(0)
            expect(bodyA.velocity[0] !== 0).toBe(true)
            expect(bodyA.velocity[1]).toEqual(0)
        })
    })

    describe('applyImpulseLocal', () => {
        test('withPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulseLocal([-1, 0], [0, 1])
            expect(bodyA.angularVelocity > 0).toBe(true)
            expect(bodyA.velocity[0] > 0).toBe(true)
            expect(Math.abs(bodyA.velocity[1]) < 0.001).toBe(true)
        })

        test('withoutPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulseLocal([-1, 0])
            expect(bodyA.angularVelocity).toEqual(0)
            expect(bodyA.velocity[0] > 0).toBe(true)
            expect(Math.abs(bodyA.velocity[1]) < 0.001).toBe(true)
        })
    })

    describe('applyImpulseLocal', () => {
        test('withPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulseLocal([-1, 0], [0, 1])
            expect(bodyA.angularVelocity > 0).toBe(true)
            expect(bodyA.velocity[0] > 0).toBe(true)
            expect(Math.abs(bodyA.velocity[1]) < 0.001).toBe(true)
        })

        test('withoutPoint', () => {
            const bodyA = new Body({
                mass: 1,
                position: [2, 3],
                angle: Math.PI, // rotated 180 degrees
            })
            bodyA.addShape(new Circle({ radius: 1 }))
            bodyA.applyImpulseLocal([-1, 0])
            expect(bodyA.angularVelocity).toEqual(0)
            expect(bodyA.velocity[0] > 0).toBe(true)
            expect(Math.abs(bodyA.velocity[1]) < 0.001).toBe(true)
        })
    })

    test('fromPolygon', () => {
        {
            const b = new Body()
            expect(
                b.fromPolygon([
                    [-1, 1],
                    [-1, 0],
                    [1, 0],
                    [1, 1],
                    [0.5, 0.5],
                ])
            ).toBeTruthy

            expect(b.shapes.length > 0).toBe(true)
        }
    })

    test('overlaps', () => {
        const bodyA = new Body({ mass: 1 })
        const bodyB = new Body({ mass: 1 })
        bodyA.addShape(new Circle())
        bodyB.addShape(new Circle())
        const world = new World()
        world.addBody(bodyA)
        world.addBody(bodyB)
        world.step(1 / 60)
        expect(bodyA.overlaps(bodyB)).toBe(true)
    })

    describe('removeShape', () => {
        test('canRemove', () => {
            const body = new Body()
            body.addShape(new Circle({ radius: 1 }))
            expect(body.removeShape(body.shapes[0])).toBe(true)
            expect(body.removeShape(new Circle({ radius: 1 }))).toBe(false)
            expect(body.shapes.length).toEqual(0)
        })

        test('duringStep', (done) => {
            const world = new World()
            const body = new Body()
            const shape = new Circle()
            world.addBody(body)
            body.addShape(shape)
            world.on('postBroadphase', function () {
                expect(function () {
                    body.removeShape(shape)
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    test('getArea', () => {
        const body = new Body()
        body.addShape(new Box({ width: 1, height: 1 }))
        expect(body.getArea()).toEqual(1)
    })

    test('getAABB', () => {
        const body = new Body()
        body.addShape(new Box({ width: 1, height: 1 }))
        expect(body.getAABB()).toEqual(new AABB({ lowerBound: [-0.5, -0.5], upperBound: [0.5, 0.5] }))
    })

    test('setDensity', () => {
        const body = new Body({ mass: 1 })
        body.addShape(new Circle({ radius: 1 }))
        const inertiaBefore = body.inertia
        body.setDensity(10)
        expect(body.mass).toEqual(body.getArea() * 10)
        expect(inertiaBefore !== body.inertia).toBe(true)
    })

    test('setZeroForce', () => {
        const b = new Body({ force: [1, 2], angularForce: 3 })
        b.setZeroForce()
        expect(vec2.length(b.force)).toEqual(0)
        expect(b.angularForce).toEqual(0)
    })

    test('sleep', () => {
        const b = new Body({ mass: 1 })
        expect(b.sleepState).toEqual(Body.AWAKE)
        b.sleep()
        expect(b.sleepState).toEqual(Body.SLEEPING)
    })

    test('toLocalFrame', () => {
        const b = new Body({ position: [1, 1] })
        const localPoint = [123, 456]
        b.toLocalFrame(localPoint, [1, 1])
        expect(localPoint).toEqual([0, 0])
    })

    test('toWorldFrame', () => {
        const b = new Body({ position: [1, 1] })
        const worldPoint = [123, 456]
        b.toWorldFrame(worldPoint, [1, 1])
        expect(worldPoint).toEqual([2, 2])
    })

    test('vectorToLocalFrame', () => {
        const b = new Body({ angle: Math.PI, position: [1, 1] })
        const v = [1, 0]
        b.vectorToLocalFrame(v, v)
        expect(vec2.distance(v, [-1, 0]) < 0.01).toBe(true)
    })

    test('vectorToWorldFrame', () => {
        const b = new Body({ angle: Math.PI, position: [1, 1] })
        const v = [1, 0]
        b.vectorToWorldFrame(v, v)
        expect(vec2.distance(v, [-1, 0]) < 0.01).toBe(true)
    })

    test('updateAABB', () => {
        let b = new Body()
        b.updateAABB()

        b = new Body()
        let s = new Circle({ radius: 1 })
        b.addShape(s)
        b.updateAABB()

        expect(b.aabb.lowerBound[0]).toEqual(-1)
        expect(b.aabb.upperBound[0]).toEqual(1)
        expect(b.aabb.lowerBound[1]).toEqual(-1)
        expect(b.aabb.upperBound[1]).toEqual(1)

        b = new Body()
        s = new Circle({ radius: 1 })
        const offset = [-2, 3]
        b.addShape(s, offset, Math.PI / 2)
        b.updateAABB()

        expect(b.aabb.lowerBound[0]).toEqual(-s.radius + offset[0])
        expect(b.aabb.upperBound[0]).toEqual(s.radius + offset[0])
        expect(b.aabb.lowerBound[1]).toEqual(-s.radius + offset[1])
        expect(b.aabb.upperBound[1]).toEqual(s.radius + offset[1])
    })

    test('updateBoundingRadius', () => {
        const body = new Body({ mass: 1 })
        const shape = new Circle({ radius: 1 })
        body.addShape(shape)
        expect(body.boundingRadius).toEqual(1)
        shape.radius = 2
        shape.updateBoundingRadius()
        body.updateBoundingRadius()
        expect(body.boundingRadius).toEqual(2)
    })

    test('wakeUp', () => {
        const b = new Body({ mass: 1 })
        b.sleep()
        expect(b.sleepState).toEqual(Body.SLEEPING)
        b.wakeUp()
        expect(b.sleepState).toEqual(Body.AWAKE)
    })

    describe('integrate', () => {
        test('withoutCCD', () => {
            const body = new Body({
                velocity: [1, 0],
                mass: 1,
            })
            const world = new World()
            world.addBody(body)
            body.integrate(1)
            expect(body.position).toEqual(vec2.fromValues(1, 0))
        })

        test('withCCD', () => {
            const body = new Body({
                velocity: [2, 0],
                position: [-1, 0],
                mass: 1,
                ccdSpeedThreshold: 0,
            })
            body.addShape(new Circle({ radius: 0.01 }))
            const world = new World()
            world.addBody(body)
            body.integrate(1)
            expect(body.position).toEqual(vec2.fromValues(1, 0))
        })

        test('withCCDAndObstacle', () => {
            const world = new World({ gravity: [0, 0] })
            const body = new Body({
                velocity: [2, 0],
                position: [-1, 0],
                mass: 1,
                ccdSpeedThreshold: 0,
                ccdIterations: 10,
            })
            body.addShape(new Circle({ radius: 0.01 }))
            world.addBody(body)
            const planeBody = new Body({
                mass: 0,
                angle: Math.PI / 2,
            })
            planeBody.addShape(new Plane())
            world.addBody(planeBody)
            world.step(1) // Need to use world.step() instead of body.integrate()
            expect(vec2.distance(body.position, [0, 0]) < 0.1).toBe(true)
        })
    })

    test('getVelocityAtPoint', () => {
        const body = new Body({
            mass: 1,
            velocity: [1, 0],
        })
        const velocity = [0, 0]
        body.getVelocityAtPoint(velocity, [0, 0])
        expect(velocity).toEqual([1, 0])

        body.velocity[0] = 0
        body.angularVelocity = 1
        body.getVelocityAtPoint(velocity, [1, 0])
        expect(Math.abs(velocity[0]) < 0.001).toBe(true)
        expect(velocity[1]).toEqual(1) // r x w = 1 x 1 = 1
    })

    test('collisionResponse', () => {
        const bodyA = new Body({ mass: 1, position: [1, 0] })
        bodyA.addShape(new Circle({ radius: 1 }))

        const bodyB = new Body({ mass: 1, position: [-1, 0] })
        bodyB.addShape(new Circle({ radius: 1 }))

        const world = new World()
        world.addBody(bodyA)
        world.addBody(bodyB)

        world.step(1 / 60)
        expect(world.narrowphase.contactEquations[0].enabled).toBe(true)

        bodyA.collisionResponse = false
        world.step(1 / 60)
        expect(world.narrowphase.contactEquations[0].enabled).toBe(false)

        bodyA.collisionResponse = true
        bodyA.shapes[0].collisionResponse = false
        world.step(1 / 60)
        expect(world.narrowphase.contactEquations[0].enabled).toBe(false)
    })

    test('index', () => {
        const bodyA = new Body()
        const bodyB = new Body()

        expect(bodyA.index).toEqual(-1)
        expect(bodyB.index).toEqual(-1)

        const world = new World()
        world.addBody(bodyA)
        world.addBody(bodyB)

        expect(bodyA.index).toEqual(0)
        expect(bodyB.index).toEqual(1)

        world.removeBody(bodyA)

        expect(bodyA.index).toEqual(-1)
        expect(bodyB.index).toEqual(0)
    })
})
