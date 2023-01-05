import { ContactEquation } from '../../src/equations/ContactEquation'
import { Body } from '../../src/objects/Body'

describe('Equations: ContactEquation', () => {
    test('construct', () => {
        const bodyA = new Body()
        const bodyB = new Body()
        new ContactEquation(bodyA, bodyB)
    })

    test('getVelocityAlongNormal', () => {
        const bodyA = new Body({ position: [-1, 0] })
        const bodyB = new Body({ position: [1, 0] })
        const eq = new ContactEquation(bodyA, bodyB)
        expect(eq.getVelocityAlongNormal()).toEqual(0)
        eq.normalA[0] = 1 // points out from bodyA toward bodyB
        eq.normalA[1] = 0
        bodyB.velocity[0] = 1 // Away from bodyA along the positive normal direction
        expect(eq.getVelocityAlongNormal()).toEqual(-1)
    })
})
