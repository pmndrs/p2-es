import { Body } from '../../src/objects/Body'
import { RotationalSpring } from '../../src/objects/RotationalSpring'

let bodyA: Body, bodyB: Body, spring: RotationalSpring
const options = {
    restAngle: 1,
    stiffness: 2,
    damping: 3,
}

describe('Objects: RotationalSpring', () => {
    beforeEach(() => {
        bodyA = new Body()
        bodyB = new Body()
        spring = new RotationalSpring(bodyA, bodyB, options)
    })

    test('construct', () => {
        expect(spring.stiffness).toEqual(options.stiffness)
        expect(spring.restAngle).toEqual(options.restAngle)
        expect(spring.damping).toEqual(options.damping)
    })

    test('applyForce', () => {
        bodyA.angle = Math.PI / 4
        bodyB.angle = 0
        spring.applyForce()
        expect(bodyA.angularForce < 0).toBe(true)
        expect(bodyB.angularForce > 0).toBe(true)
    })
})
