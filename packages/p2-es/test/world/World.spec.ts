import { Ray } from '../../src/collision/Ray'
import { RaycastResult } from '../../src/collision/RaycastResult'
import { DistanceConstraint } from '../../src/constraints/DistanceConstraint'
import { Body } from '../../src/objects/Body'
import { LinearSpring } from '../../src/objects/LinearSpring'
import { Circle } from '../../src/shapes/Circle'
import { Convex } from '../../src/shapes/Convex'
import { Plane } from '../../src/shapes/Plane'
import { World } from '../../src/world/World'

describe('World', () => {
    test('construct', () => {
        let world = new World()

        const options = {
            gravity: [123, 456],
        }
        world = new World(options)
        expect(world.gravity[0]).toEqual(options.gravity[0])
        expect(world.gravity[1]).toEqual(options.gravity[1])
    })

    test('raycast', () => {
        const world = new World()
        const shape = new Plane()
        const body = new Body()
        body.addShape(shape, [0, 0], Math.PI / 2)
        world.addBody(body)
        const result = new RaycastResult()
        const ray = new Ray({
            from: [0, -10],
            to: [0, 10],
        })
        world.raycast(result, ray)
        expect(result.hasHit()).toBe(true)

        const hitPointWorld = [1, 1]
        result.getHitPoint(hitPointWorld, ray)
        expect(hitPointWorld[0]).toEqual(0)
        expect(hitPointWorld[1]).toEqual(0)

        expect(result.getHitDistance(ray)).toEqual(10)
    })

    describe('addBody', () => {
        test('duringStep', (done) => {
            const world = new World()
            const body = new Body()
            world.on('postBroadphase', function () {
                expect(function () {
                    world.addBody(body)
                }).toThrow
                done()
            })
            world.step(1)
        })

        test('twice', () => {
            const world = new World()
            const body = new Body()
            world.addBody(body)

            // should throw on adding body twice
            expect(function () {
                world.addBody(body)
            }).toThrow
        })
    })

    describe('addConstraint', () => {
        test('withoutAddedBodies', () => {
            const bodyA = new Body()
            const bodyB = new Body()
            const constraint = new DistanceConstraint(bodyA, bodyB)
            const world = new World()

            // Should throw error if a constraint is added to the world but not its bodies
            expect(function () {
                world.addConstraint(constraint)
            }).toThrow()

            world.addBody(bodyA)
            world.addBody(bodyB)
            world.addConstraint(constraint)
        })

        test('duringStep', (done) => {
            const bodyA = new Body()
            const bodyB = new Body()
            const constraint = new DistanceConstraint(bodyA, bodyB)
            const world = new World()
            world.on('postBroadphase', function () {
                // should throw on adding constraints during step
                expect(() => {
                    world.addConstraint(constraint)
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    describe('addSpring', () => {
        test('duringStep', (done) => {
            const bodyA = new Body()
            const bodyB = new Body()
            const spring = new LinearSpring(bodyA, bodyB)
            const world = new World()
            world.on('postBroadphase', function () {
                // should throw on adding springs during step
                expect(function () {
                    world.addSpring(spring)
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    test('clear', () => {
        const world = new World()

        const bodyA = new Body()
        const bodyB = new Body()
        world.addBody(bodyA)
        world.addBody(bodyB)

        const spring = new LinearSpring(bodyA, bodyB)
        world.addSpring(spring)

        const constraint = new DistanceConstraint(bodyA, bodyB)
        world.addConstraint(constraint)

        world.clear()

        expect(world.bodies).toEqual([])
        expect(world.springs).toEqual([])
        expect(world.constraints).toEqual([])
        expect(world.contactMaterials).toEqual([])
    })

    test('disableBodyCollision', () => {
        const bodyA = new Body({ mass: 1 }),
            bodyB = new Body({ mass: 1 }),
            world = new World()
        bodyA.addShape(new Circle({ radius: 1 }))
        bodyB.addShape(new Circle({ radius: 1 }))
        world.addBody(bodyA)
        world.addBody(bodyB)
        world.disableBodyCollision(bodyA, bodyB)
        world.step(1 / 60)
        expect(world.narrowphase.contactEquations.length).toEqual(0)
        world.enableBodyCollision(bodyA, bodyB)
        world.step(1 / 60)
        expect(world.narrowphase.contactEquations.length).toEqual(1)
    })

    test('hitTest', () => {
        let b = new Body()
        const world = new World()
        world.addBody(b)

        // Should miss bodies without shapes
        expect(world.hitTest([0, 0], [b])).toEqual([])

        b.addShape(new Circle({ radius: 1 }))

        // Should hit Circle
        expect(world.hitTest([0, 0], [b])).toEqual([b])

        // Should miss Circle
        expect(world.hitTest([1.1, 0], [b])).toEqual([])

        b = new Body()
        b.addShape(
            new Convex({
                vertices: [
                    [-1, -1],
                    [1, -1],
                    [1, 1],
                    [-1, 1],
                ],
            })
        )

        // Should hit Convex
        expect(world.hitTest([0, 0], [b])).toEqual([b])

        // Should miss Convex
        expect(world.hitTest([1.1, 0], [b])).toEqual([])
    })

    describe('removeBody', () => {
        test('duringStep', (done) => {
            const world = new World()
            const body = new Body()
            world.addBody(body)
            world.on('postBroadphase', function () {
                // should throw on adding bodies during step
                expect(function () {
                    world.removeBody(body)
                }).toThrow()
                done()
            })
            world.step(1)
        })

        test('removes relevant pairs from disabledBodyCollisionPairs', () => {
            const body1 = new Body({ id: 1 }),
                body2 = new Body({ id: 2 }),
                body3 = new Body({ id: 3 }),
                world = new World()
            world.addBody(body1)
            world.addBody(body2)
            world.addBody(body3)
            world.disableBodyCollision(body1, body2)
            world.disableBodyCollision(body2, body1)
            world.disableBodyCollision(body3, body3)

            world.removeBody(body1)

            expect(world.disabledBodyCollisionPairs.length).toEqual(2)
            expect(world.disabledBodyCollisionPairs[0].id).toEqual(body3.id)
            expect(world.disabledBodyCollisionPairs[1].id).toEqual(body3.id)
        })
    })

    describe('removeConstraint', () => {
        test('duringStep', (done) => {
            const world = new World()
            const bodyA = new Body()
            world.addBody(bodyA)
            const bodyB = new Body()
            world.addBody(bodyB)

            const constraint = new DistanceConstraint(bodyA, bodyB)
            world.addConstraint(constraint)

            world.on('postBroadphase', function () {
                // should throw on removing constraints during step
                expect(function () {
                    world.removeConstraint(constraint)
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    describe('removeSpring', () => {
        test('duringStep', (done) => {
            const world = new World()
            const bodyA = new Body()
            world.addBody(bodyA)
            const bodyB = new Body()
            world.addBody(bodyB)

            const spring = new LinearSpring(bodyA, bodyB)
            world.addSpring(spring)

            world.on('postBroadphase', function () {
                // should throw on removing springs during step
                expect(function () {
                    world.removeSpring(spring)
                }).toThrow()
                done()
            })
            world.step(1)
        })
    })

    test('setGlobalStiffness', () => {
        const world = new World()
        world.setGlobalStiffness(123)
        expect(world.defaultContactMaterial.stiffness).toEqual(123)
    })

    test('setGlobalRelaxation', () => {
        const world = new World()
        world.setGlobalRelaxation(123)
        expect(world.defaultContactMaterial.relaxation).toEqual(123)
        // TODO: check constraints etc
    })

    describe('events', () => {
        test('beginContact', () => {
            const world = new World(),
                bodyA = new Body({ mass: 1 }),
                bodyB = new Body({ mass: 1 })
            world.addBody(bodyA)
            world.addBody(bodyB)
            const shapeA = new Circle({ radius: 1 }),
                shapeB = new Circle({ radius: 1 })
            bodyA.addShape(shapeA)
            bodyB.addShape(shapeB)
            let beginContactHits = 0,
                endContactHits = 0
            world.on('beginContact', function (evt) {
                expect(evt.shapeA.id === shapeA.id || evt.shapeA.id === shapeB.id).toBe(true)
                expect(evt.shapeB.id === shapeA.id || evt.shapeB.id === shapeB.id).toBe(true)
                expect(evt.bodyA.id === bodyA.id || evt.bodyA.id === bodyB.id).toBe(true)
                expect(evt.bodyB.id === bodyA.id || evt.bodyB.id === bodyB.id).toBe(true)
                beginContactHits++
            })
            world.on('endContact', function (evt) {
                expect(evt.shapeA.id === shapeA.id || evt.shapeA.id === shapeB.id).toBe(true)
                expect(evt.shapeB.id === shapeA.id || evt.shapeB.id === shapeB.id).toBe(true)
                expect(evt.bodyA.id === bodyA.id || evt.bodyA.id === bodyB.id).toBe(true)
                expect(evt.bodyB.id === bodyA.id || evt.bodyB.id === bodyB.id).toBe(true)
                endContactHits++
            })

            // First overlap - one new beginContact
            world.step(1 / 60)
            expect(beginContactHits).toEqual(1)
            expect(endContactHits).toEqual(0)

            // Still overlapping - should maintain
            world.step(1 / 60)
            expect(beginContactHits).toEqual(1)
            expect(endContactHits).toEqual(0)

            // End the overlap
            bodyA.position[0] = 10
            world.step(1 / 60)
            expect(beginContactHits).toEqual(1)
            expect(endContactHits).toEqual(1)
        })

        test('beginContact2', () => {
            const world = new World(),
                // 3 circles, A overlaps B which overlaps C
                bodyA = new Body({ mass: 1, position: [-1.1, 0] }),
                bodyB = new Body({ mass: 1, position: [0, 0] }),
                bodyC = new Body({ mass: 1, position: [1.1, 0] })
            world.addBody(bodyA)
            world.addBody(bodyB)
            world.addBody(bodyC)
            const shapeA = new Circle({ radius: 1 }),
                shapeB = new Circle({ radius: 1 }),
                shapeC = new Circle({ radius: 1 })
            bodyA.addShape(shapeA)
            bodyB.addShape(shapeB)
            bodyC.addShape(shapeC)

            let beginContactHits = 0,
                endContactHits = 0

            world.on('beginContact', function (_evt) {
                beginContactHits++
            })

            world.on('endContact', function (_evt) {
                endContactHits++
            })

            // First overlap - two new beginContact
            world.step(1 / 60)
            expect(beginContactHits).toEqual(2)
            expect(endContactHits).toEqual(0)

            // Still overlapping - should not report anything
            world.step(1 / 60)
            expect(beginContactHits).toEqual(2)
            expect(endContactHits).toEqual(0)

            // End one overlap
            bodyA.position[1] = 10
            world.step(1 / 60)
            expect(beginContactHits).toEqual(2)
            expect(endContactHits).toEqual(1)

            // End another overlap
            bodyB.position[1] = -10
            world.step(1 / 60)
            expect(beginContactHits).toEqual(2)
            expect(endContactHits).toEqual(2)
        })
    })

    describe('hasActiveBodies', () => {
        test('no sleeping', () => {
            const world = new World({
                gravity: [0, -10],
            })

            // Disable sleeping
            world.sleepMode = World.NO_SLEEPING

            // Create circle
            const circleBody = new Body({
                mass: 1,
                position: [0, 0.3],
                damping: 0.01,
            })
            circleBody.addShape(
                new Circle({
                    radius: 0.15,
                })
            )
            circleBody.allowSleep = true
            circleBody.sleepSpeedLimit = 1
            circleBody.sleepTimeLimit = 1
            circleBody.damping = 0.2
            world.addBody(circleBody)

            // Create ground
            const planeShape = new Plane()
            const plane = new Body({
                position: [0, -1],
            })
            plane.addShape(planeShape)
            world.addBody(plane)

            world.step(1 / 60)

            // Circle should be falling
            expect(world.hasActiveBodies).toBe(true)

            // Wait until circle has landed and is at rest
            world.step(1 / 60, 5 * 1000, 5 * 60)

            // Sleeping should be disabled for the world
            expect(world.hasActiveBodies).toBe(true)
        })

        test('body sleeping', () => {
            const world = new World({
                gravity: [0, -10],
            })

            // Body sleeping
            world.sleepMode = World.BODY_SLEEPING

            // Create ball
            const circleBody = new Body({
                mass: 1,
                position: [0, 0.3],
                damping: 0.01,
            })
            circleBody.addShape(
                new Circle({
                    radius: 0.15,
                })
            )
            circleBody.allowSleep = true
            circleBody.sleepSpeedLimit = 1
            circleBody.sleepTimeLimit = 1
            circleBody.damping = 0.2
            world.addBody(circleBody)

            // Create ground
            const plane = new Body({
                position: [0, -1],
            })
            plane.addShape(new Plane())
            world.addBody(plane)

            world.step(1 / 60)

            // Circle should be falling
            expect(world.hasActiveBodies).toBe(true)

            // Wait until circle has landed and is at rest
            world.step(1 / 60, 5 * 1000, 5 * 60)

            // Circle should be sleeping
            expect(world.hasActiveBodies).toBe(false)
        })

        test('island sleeping', () => {
            const world = new World({
                gravity: [0, -10],
                islandSplit: true,
            })

            // Island sleeping
            world.sleepMode = World.ISLAND_SLEEPING

            // Create circles
            const circleBodyOne = new Body({
                mass: 1,
                position: [0, 0.6],
                damping: 0.01,
            })
            circleBodyOne.addShape(
                new Circle({
                    radius: 0.15,
                })
            )
            circleBodyOne.allowSleep = true
            circleBodyOne.sleepSpeedLimit = 1
            circleBodyOne.sleepTimeLimit = 1
            circleBodyOne.damping = 0.2
            world.addBody(circleBodyOne)

            const circleBodyTwo = new Body({
                mass: 1,
                position: [0, 0.3],
                damping: 0.01,
            })
            circleBodyTwo.addShape(
                new Circle({
                    radius: 0.15,
                })
            )
            circleBodyTwo.allowSleep = true
            circleBodyTwo.sleepSpeedLimit = 1
            circleBodyTwo.sleepTimeLimit = 1
            circleBodyTwo.damping = 0.2
            world.addBody(circleBodyTwo)

            // Create ground
            const planeShape = new Plane()
            const plane = new Body({
                position: [0, -1],
            })
            plane.addShape(planeShape)
            world.addBody(plane)

            world.step(1 / 60)

            // Circles should be falling
            expect(world.hasActiveBodies).toBe(true)

            // Wait until circles have landed and are at rest
            world.step(1 / 60, 5 * 1000, 5 * 60)

            // Circles should be sleeping
            expect(world.hasActiveBodies).toBe(false)
        })
    })
})
