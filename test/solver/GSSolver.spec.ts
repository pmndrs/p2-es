import { DistanceConstraint } from '../../src/constraints/DistanceConstraint'
import { Body } from '../../src/objects/Body'
import { GSSolver } from '../../src/solver/GSSolver'
import { World } from '../../src/world/World'

describe('Solvers: GSSolver', () => {
    test('construct', () => {
        new GSSolver()
    })

    test('solve', () => {
        const world = new World()
        const bodyA = new Body({
            mass: 1,
        })
        world.addBody(bodyA)
        const bodyB = new Body({
            mass: 1,
            position: [0, 1.001],
        })
        world.addBody(bodyB)
        const constraint = new DistanceConstraint(bodyA, bodyB, {
            distance: 1,
        })
        world.addConstraint(constraint)
        const solver = new GSSolver({
            iterations: 10,
            tolerance: 0,
        })
        solver.addEquations(constraint.equations)
        solver.solve(1 / 60, world)
        // should use all iterations if tolerance is zero
        expect(solver.usedIterations).toEqual(solver.iterations)

        solver.tolerance = 1
        solver.solve(1 / 60, world)

        // should use less iterations if tolerance is nonzero
        expect(solver.usedIterations < 10).toBe(true)
    })
})
