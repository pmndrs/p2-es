import { FrictionEquation } from '../../src/equations/FrictionEquation'
import { Body } from '../../src/p2-es'

describe('Equations: FrictionEquation', () => {
    test('construct', () => {
        const slipForce = 100
        const bodyA = new Body()
        const bodyB = new Body()
        const eq = new FrictionEquation(bodyA, bodyB, slipForce)
        expect(eq.minForce).toEqual(-slipForce)
        expect(eq.maxForce).toEqual(slipForce)
    })
})
