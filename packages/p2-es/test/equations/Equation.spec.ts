import { Equation } from '../../src/equations/Equation'
import { Body } from '../../src/objects/Body'

describe('Equation', () => {
    test('construct', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        const minForce = -100
        const maxForce = 100
        const eq = new Equation(bodyA, bodyB, minForce, maxForce)
        expect(eq.minForce).toEqual(minForce)
        expect(eq.maxForce).toEqual(maxForce)
        expect(eq.bodyA).toEqual(bodyA)
        expect(eq.bodyB).toEqual(bodyB)
    })
})
