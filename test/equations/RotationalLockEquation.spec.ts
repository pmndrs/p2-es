import { RotationalLockEquation } from '../../src/equations/RotationalLockEquation'
import { Body } from '../../src/objects/Body'

describe('Equations: RotationalLockEquation', () => {
    test('construct', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        new RotationalLockEquation(bodyA, bodyB)
    })
})
