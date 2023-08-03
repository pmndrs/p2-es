import { Constraint } from '../../src/constraints/Constraint'
import { DistanceConstraint } from '../../src/constraints/DistanceConstraint'
import { Body } from '../../src/objects/Body'
import { World } from '../../src/world/World'

describe('Constraint', () => {
    test('construct', () => {
        new Constraint(new Body(), new Body(), 1)
    })

    test('setMaxBias', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const world = new World()
        world.addBody(bodyA)
        world.addBody(bodyB)
        const constraint = new DistanceConstraint(bodyA, bodyB)

        constraint.setMaxBias(1)
        expect(constraint.equations[0].maxBias).toEqual(1)
    })
})
