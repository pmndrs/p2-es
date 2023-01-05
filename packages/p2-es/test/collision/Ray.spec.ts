import { AABB } from '../../src/collision/AABB'
import { Ray } from '../../src/collision/Ray'

describe('Collision: Ray', () => {
    test('construct', () => {
        const ray = new Ray({
            from: [4, 3],
            to: [1, 2],
            skipBackfaces: true,
            collisionMask: 4,
            collisionGroup: 4 | 2,
            mode: Ray.ALL,
        })
        expect(ray.from[0]).toBe(4)
        expect(ray.from[1]).toBe(3)
        expect(ray.to[0]).toBe(1)
        expect(ray.to[1]).toBe(2)
        expect(ray.skipBackfaces).toBe(true)
        expect(ray.collisionMask).toBe(4)
        expect(ray.collisionGroup).toBe(4 | 2)
        expect(ray.mode).toBe(Ray.ALL)
    })

    test('update', () => {
        const ray = new Ray({
            from: [0, 0],
            to: [1, 0],
        })
        expect(ray.direction[0]).toBe(1)
        expect(ray.direction[1]).toBe(0)
        expect(ray.length).toBe(1)

        ray.to[0] = 0
        ray.to[1] = 2
        ray.update()
        expect(ray.direction[0]).toBe(0)
        expect(ray.direction[1]).toBe(1)
        expect(ray.length).toBe(2)
    })

    test('getAABB', () => {
        const ray = new Ray({
            from: [0, 0],
            to: [1, 1],
        })
        const aabb = new AABB()
        ray.getAABB(aabb)
        expect(aabb).toEqual(new AABB({ lowerBound: [0, 0], upperBound: [1, 1] }))
    })
})
