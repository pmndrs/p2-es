import { RevoluteConstraint } from '../../src/constraints/RevoluteConstraint'
import { Body } from '../../src/objects/Body'
import { World } from '../../src/world/World'

describe('Constraint: RevoluteConstraint', () => {
    test('worldPivot', () => {
        const world = new World()

        const bodyA = new Body({ mass: 1, position: [-1, 0] })
        world.addBody(bodyA)

        const bodyB = new Body({ mass: 1, position: [1, 0] })
        world.addBody(bodyB)

        const constraint = new RevoluteConstraint(bodyA, bodyB, {
            worldPivot: [0, 0],
        })
        world.addConstraint(constraint)

        expect(constraint.pivotA[0]).toEqual(1)
        expect(constraint.pivotA[1]).toEqual(0)

        expect(constraint.pivotB[0]).toEqual(-1)
        expect(constraint.pivotB[1]).toEqual(0)
    })

    test('localPivots', () => {
        const world = new World()

        const bodyA = new Body({ mass: 1, position: [-1, 0] })
        world.addBody(bodyA)

        const bodyB = new Body({ mass: 1, position: [1, 0] })
        world.addBody(bodyB)

        const constraint = new RevoluteConstraint(bodyA, bodyB, {
            localPivotA: [1, 0],
            localPivotB: [-1, 0],
        })
        world.addConstraint(constraint)

        expect(constraint.pivotA[0]).toEqual(1)
        expect(constraint.pivotA[1]).toEqual(0)

        expect(constraint.pivotB[0]).toEqual(-1)
        expect(constraint.pivotB[1]).toEqual(0)
    })

    test('motorEnabled', () => {
        const world = new World()
        const bodyA = new Body({ mass: 1, position: [-1, 0] })
        world.addBody(bodyA)
        const bodyB = new Body({ mass: 1, position: [1, 0] })
        world.addBody(bodyB)
        const constraint = new RevoluteConstraint(bodyA, bodyB)
        world.addConstraint(constraint)

        constraint.motorEnabled = true
        expect(constraint.motorEnabled).toBe(true)
    })

    test('motorSpeed', () => {
        const world = new World()
        const bodyA = new Body({ mass: 1, position: [-1, 0] })
        world.addBody(bodyA)
        const bodyB = new Body({ mass: 1, position: [1, 0] })
        world.addBody(bodyB)
        const constraint = new RevoluteConstraint(bodyA, bodyB)
        world.addConstraint(constraint)

        constraint.motorSpeed = 1
        expect(constraint.motorSpeed).toBe(1)
    })

    test('motorMaxForce', () => {
        const world = new World()
        const bodyA = new Body({ mass: 1, position: [-1, 0] })
        world.addBody(bodyA)
        const bodyB = new Body({ mass: 1, position: [1, 0] })
        world.addBody(bodyB)
        const constraint = new RevoluteConstraint(bodyA, bodyB)
        world.addConstraint(constraint)

        constraint.motorMaxForce = 1
        expect(constraint.motorMaxForce).toEqual(1)
    })
})
