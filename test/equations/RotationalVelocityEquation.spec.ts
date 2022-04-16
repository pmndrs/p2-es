import { RotationalVelocityEquation } from '../../src/equations/RotationalVelocityEquation'
import { Body } from '../../src/objects/Body'

describe('Equations: RotationalVelocityEquation', () => {
    test('construct', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        new RotationalVelocityEquation(bodyA, bodyB)
    })
})
