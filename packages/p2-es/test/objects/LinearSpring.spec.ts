import * as vec2 from '../../src/math/vec2'
import { Body } from '../../src/objects/Body'
import { LinearSpring } from '../../src/objects/LinearSpring'

let bodyA: Body, bodyB: Body, spring: LinearSpring
const options = {
    restLength: 1,
    stiffness: 2,
    damping: 3,
    localAnchorA: [4, 5],
    localAnchorB: [6, 7],
}

describe('Objects: LinearSpring', () => {
    beforeEach(() => {
        bodyA = new Body()
        bodyB = new Body()
        spring = new LinearSpring(bodyA, bodyB, options)
    })

    test('construct', () => {
        expect(spring.stiffness).toEqual(options.stiffness)
        expect(spring.restLength).toEqual(options.restLength)
        expect(spring.damping).toEqual(options.damping)
    })

    test('applyForce', () => {
        spring.setWorldAnchorA([0, 0])
        spring.setWorldAnchorB([0, 0])
        bodyA.position[0] = 1
        bodyB.position[0] = -1
        spring.applyForce()
        expect(bodyA.force[0] < 0).toBe(true)
        expect(bodyB.force[0] > 0).toBe(true)
    })

    test('getWorldAnchorA', () => {
        const v = vec2.create()
        spring.getWorldAnchorA(v)
        expect(v[0]).toEqual(options.localAnchorA[0])
        expect(v[1]).toEqual(options.localAnchorA[1])
    })

    test('getWorldAnchorB', () => {
        const v = vec2.create()
        spring.getWorldAnchorB(v)
        expect(v[0]).toEqual(options.localAnchorB[0])
        expect(v[1]).toEqual(options.localAnchorB[1])
    })

    test('setWorldAnchorA', () => {
        const v = vec2.create()
        spring.setWorldAnchorA([0, 0])
        spring.getWorldAnchorA(v)
        expect(v[0]).toEqual(0)
        expect(v[1]).toEqual(0)
    })

    test('setWorldAnchorB', () => {
        const v = vec2.create()
        spring.setWorldAnchorB([0, 0])
        spring.getWorldAnchorB(v)
        expect(v[0]).toEqual(0)
        expect(v[1]).toEqual(0)
    })
})
